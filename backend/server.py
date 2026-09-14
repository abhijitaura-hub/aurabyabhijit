from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import logging
import asyncio
import ipaddress
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from datetime import datetime, timezone, timedelta
from typing import Optional, List

import bcrypt
import jwt
import requests
import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="AURA by Abhijit API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)
logger = logging.getLogger("aura")
logging.basicConfig(level=logging.INFO)

JWT_ALGORITHM = "HS256"

# ---------- Auth ----------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)

async def get_current_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=401, detail="User not found")
    return user

class LoginInput(BaseModel):
    email: EmailStr
    password: str

@api_router.post("/admin/login")
async def admin_login(input: LoginInput, request: Request):
    email = input.email.lower()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        locked_at = attempts.get("updated_at")
        if locked_at and datetime.now(timezone.utc) - datetime.fromisoformat(locked_at) < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email, "role": "admin"})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    return {"token": create_token(user["id"], email), "email": email}

@api_router.get("/admin/messages")
async def list_messages(admin=Depends(get_current_admin)):
    return await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api_router.patch("/admin/messages/{message_id}/read")
async def mark_message_read(message_id: str, admin=Depends(get_current_admin)):
    result = await db.contact_messages.update_one({"id": message_id}, {"$set": {"read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}

@api_router.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str, admin=Depends(get_current_admin)):
    result = await db.contact_messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}

class ChangePasswordInput(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=8, max_length=200)

@api_router.post("/admin/change-password")
async def change_password(input: ChangePasswordInput, admin=Depends(get_current_admin)):
    user = await db.users.find_one({"id": admin["id"]})
    if not user or not verify_password(input.current_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    await db.users.update_one(
        {"id": admin["id"]},
        {"$set": {"password_hash": hash_password(input.new_password), "password_source": "manual"}},
    )
    return {"ok": True}

# ---------- Contact ----------

class ContactInput(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    organization: Optional[str] = Field(default=None, max_length=160)
    topic: str = Field(min_length=2, max_length=120)
    message: str = Field(min_length=10, max_length=5000)
    website: Optional[str] = Field(default=None, max_length=200)  # honeypot

@api_router.post("/contact")
async def submit_contact(input: ContactInput):
    if input.website:
        return {"ok": True}  # silently accept bot submissions
    doc = {
        "id": str(uuid.uuid4()),
        "name": input.name.strip(),
        "email": input.email.lower(),
        "organization": (input.organization or "").strip() or None,
        "topic": input.topic.strip(),
        "message": input.message.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False,
    }
    await db.contact_messages.insert_one(doc)
    doc.pop("_id", None)
    notify_owner_contact(doc)
    return {"ok": True, "id": doc["id"]}

# ---------- Transactional Email (Emergent managed) ----------

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "AURA by Abhijit")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL")
SITE_URL = "https://www.aurabyabhijit.com"

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)

def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)

def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)

class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []
    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []
    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []

def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")

async def send_email(*, to: str, subject: str, html: str) -> None:
    _assert_safe_email(subject, html)
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY not set; skipping email to %s", to)
        return
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                 headers={"X-Email-Key": EMAIL_KEY}, json=payload)
    resp.raise_for_status()

def send_email_bg(**kwargs) -> None:
    async def runner():
        try:
            await send_email(**kwargs)
        except Exception as e:
            logger.error("Background email failed: %s", e)
    asyncio.create_task(runner())

def _email_shell(inner: str) -> str:
    return (f'<table role="presentation" width="100%" style="background:#0a0a0c;padding:32px 0">'
            f'<tr><td align="center"><table role="presentation" width="560" style="background:#121217;'
            f'border:1px solid #2a2a30;font-family:Arial,sans-serif">'
            f'<tr><td style="padding:28px 32px;border-bottom:3px solid #ff2e3e">'
            f'<span style="font-size:18px;letter-spacing:4px;color:#ffffff"><strong>AURA</strong></span>'
            f'<span style="font-size:10px;letter-spacing:2px;color:#a1a1aa"> BY ABHIJIT</span></td></tr>'
            f'<tr><td style="padding:28px 32px;color:#d4d4d8;font-size:14px;line-height:1.7">{inner}</td></tr>'
            f'<tr><td style="padding:18px 32px;border-top:1px solid #2a2a30;font-size:11px;color:#71717a">'
            f'Sent by {escape(EMAIL_FROM_NAME)} · <a href="{SITE_URL}" style="color:#a1a1aa">AURA</a></td></tr>'
            f'</table></td></tr></table>')

def notify_owner_contact(doc: dict) -> None:
    if not OWNER_EMAIL:
        return
    inner = (f'<p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;color:#ff2e3e">NEW ENQUIRY</p>'
             f'<p style="margin:0 0 16px"><strong style="color:#fff">{escape(doc["name"])}</strong> '
             f'&lt;<a href="mailto:{escape(doc["email"])}" style="color:#d4d4d8">{escape(doc["email"])}</a>&gt;'
             f'{(" · " + escape(doc["organization"])) if doc.get("organization") else ""}</p>'
             f'<p style="margin:0 0 16px">Topic: <strong style="color:#fff">{escape(doc["topic"])}</strong></p>'
             f'<p style="margin:0 0 16px;white-space:pre-wrap">{escape(doc["message"])}</p>'
             f'<p style="margin:0"><a href="{SITE_URL}/admin" style="color:#ff2e3e">Open the AURA inbox</a></p>')
    send_email_bg(to=OWNER_EMAIL, subject=f"New AURA enquiry from {doc['name'][:60]}",
                  html=_email_shell(inner))

def welcome_subscriber(email: str) -> None:
    inner = (f'<p style="margin:0 0 16px;color:#fff;font-size:16px"><strong>You\'re on the list.</strong></p>'
             f'<p style="margin:0 0 16px">New perspectives on AI, automation, cybersecurity and technology '
             f'leadership will find you by email — written occasionally, never noisily.</p>'
             f'<p style="margin:0 0 16px"><a href="{SITE_URL}/perspective" style="color:#ff2e3e">'
             f'Read the latest perspectives</a></p>'
             f'<p style="margin:0;font-size:12px;color:#71717a">To unsubscribe, simply reply to this email.</p>')
    send_email_bg(to=email, subject="You're on the AURA list", html=_email_shell(inner))

# ---------- Newsletter ----------

class SubscribeInput(BaseModel):
    email: EmailStr
    website: Optional[str] = Field(default=None, max_length=200)  # honeypot

@api_router.post("/newsletter/subscribe", status_code=201)
async def subscribe_newsletter(input: SubscribeInput):
    if input.website:
        return {"ok": True}
    email = input.email.lower()
    await db.newsletter_subscribers.update_one(
        {"email": email},
        {"$setOnInsert": {
            "id": str(uuid.uuid4()),
            "email": email,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    welcome_subscriber(email)
    return {"ok": True}

@api_router.get("/admin/subscribers")
async def list_subscribers(admin=Depends(get_current_admin)):
    return await db.newsletter_subscribers.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

# ---------- Articles ----------

def article_public(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc

@api_router.get("/articles")
async def list_articles(category: Optional[str] = None, q: Optional[str] = None,
                        skip: int = 0, limit: int = 12):
    query = {"status": "published"}
    if category:
        query["category"] = category
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [{"title": rx}, {"subtitle": rx}, {"tags": rx}]
    total = await db.articles.count_documents(query)
    items = await db.articles.find(query, {"_id": 0}).sort("published_at", -1).skip(skip).limit(min(limit, 50)).to_list(50)
    categories = await db.articles.distinct("category", {"status": "published"})
    return {"articles": items, "total": total, "categories": sorted(categories)}

@api_router.get("/articles/{slug}")
async def get_article(slug: str):
    doc = await db.articles.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    related = await db.articles.find(
        {"status": "published", "category": doc["category"], "slug": {"$ne": slug}},
        {"_id": 0, "body": 0},
    ).sort("published_at", -1).limit(3).to_list(3)
    return {"article": doc, "related": related}

@api_router.get("/health")
async def health():
    return {"status": "ok"}

# ---------- Seed ----------

AUTHOR = "Abhijit Debnath"
NOW = datetime.now(timezone.utc).isoformat()

SEED_ARTICLES = [
    {
        "id": str(uuid.uuid4()),
        "slug": "why-most-ai-strategies-fail-before-the-first-pilot",
        "title": "Why Most AI Strategies Fail Before the First Pilot",
        "subtitle": "The failure rarely happens in the model. It happens in the meeting where nobody asked what problem we were solving.",
        "author": AUTHOR,
        "category": "AI Strategy",
        "tags": ["AI", "Strategy", "Leadership"],
        "reading_time": 6,
        "status": "published",
        "is_draft_content": True,
        "featured": True,
        "published_at": "2026-06-18T09:00:00+00:00",
        "updated_at": NOW,
        "seo_title": "Why Most AI Strategies Fail Before the First Pilot | AURA by Abhijit",
        "meta_description": "Most AI initiatives fail before the first pilot — not because of technology, but because nobody defined the business problem. A practitioner's perspective.",
        "body": [
            {"type": "paragraph", "text": "Every organisation I speak with today has an AI strategy, or is urgently writing one. Far fewer can answer a simpler question: what specific problem is the strategy meant to solve?"},
            {"type": "paragraph", "text": "After two decades of watching technology waves arrive — virtualisation, cloud, mobility, and now AI — a pattern repeats. The technology is rarely the reason initiatives fail. They fail earlier, quietly, in conference rooms where ambition outruns definition."},
            {"type": "heading", "text": "The pilot is not the starting line"},
            {"type": "paragraph", "text": "By the time a pilot launches, most of the consequential decisions have already been made — or avoided. Was a real business process selected, or a convenient demo scenario? Does the data behind the process actually exist in usable form? Who owns the outcome when the pilot 'succeeds' and someone must turn it into operations?"},
            {"type": "quote", "text": "AI without strategy becomes complexity. Strategy without a defined problem becomes theatre."},
            {"type": "paragraph", "text": "The pilots that succeed tend to look boring from the outside. A narrow workflow. A measurable baseline. A named owner. A decision about what happens if it works. None of this requires a data science degree — it requires operational honesty."},
            {"type": "heading", "text": "Three questions before any pilot"},
            {"type": "paragraph", "text": "First: what does the process cost us today, in time, error, or friction — and how do we know? Second: what would a 30 percent improvement be worth, and to whom? Third: if the pilot works, who runs it on day ninety-one?"},
            {"type": "paragraph", "text": "If those questions feel uncomfortable, that is precisely where the strategy work lives. The model is the easy part. The organisation is the strategy."},
            {"type": "heading", "text": "A quieter way to start"},
            {"type": "paragraph", "text": "Start with workflows your teams already complain about. Document the baseline before touching any tooling. Treat the first pilot as an organisational learning exercise with a useful by-product, not as a product launch. The companies that compound value from AI are the ones that treated their first pilots as tuition, not trophies."},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "slug": "zero-trust-is-a-culture-not-a-product",
        "title": "Zero Trust Is a Culture, Not a Product",
        "subtitle": "You cannot purchase your way to zero trust. The architecture only works when the organisation changes how it thinks about access.",
        "author": AUTHOR,
        "category": "Cybersecurity",
        "tags": ["Cybersecurity", "Zero Trust", "Governance"],
        "reading_time": 4,
        "status": "published",
        "is_draft_content": True,
        "featured": False,
        "published_at": "2026-05-27T09:00:00+00:00",
        "updated_at": NOW,
        "seo_title": "Zero Trust Is a Culture, Not a Product | AURA by Abhijit",
        "meta_description": "Zero trust fails when treated as a procurement exercise. It succeeds when identity, access and accountability become organisational habits.",
        "body": [
            {"type": "paragraph", "text": "Somewhere along the way, 'zero trust' became something you buy. Vendors sell it in boxes, dashboards, and licence tiers. But the organisations I have seen struggle with zero trust rarely lacked tooling — they lacked agreement about what they were actually protecting, and from whom."},
            {"type": "heading", "text": "The architecture is the easy part"},
            {"type": "paragraph", "text": "Verify explicitly. Least privilege. Assume breach. The principles are well documented and the technology to enforce them is mature. What is hard is the Tuesday morning reality: a regional manager who shares credentials because the approval workflow takes three days, a legacy application that cannot speak modern identity protocols, an executive who wants an exception."},
            {"type": "quote", "text": "Security without culture becomes friction. Culture without architecture becomes hope. You need both, in that order of difficulty."},
            {"type": "paragraph", "text": "Zero trust is ultimately a statement about how an organisation treats access: as something earned continuously, never assumed permanently. That is a behavioural commitment before it is a network diagram."},
            {"type": "heading", "text": "Start with identity, not infrastructure"},
            {"type": "paragraph", "text": "If you are beginning the journey, resist the urge to redesign the network first. Start where trust actually lives — identity. Consolidate it, strengthen it, make access visible and reviewable. Every hour invested in clean identity data pays back across every later phase."},
            {"type": "paragraph", "text": "And measure culture, not just coverage: how long does access provisioning take, how often are permissions reviewed, how many standing exceptions exist? Those numbers tell you more about your zero-trust maturity than any dashboard."},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "slug": "the-automation-projects-that-quietly-fail",
        "title": "The Automation Projects That Quietly Fail",
        "subtitle": "Nobody announces an automation failure. The workflow just slowly returns to spreadsheets, and the licence renewal gets questioned once a year.",
        "author": AUTHOR,
        "category": "Automation",
        "tags": ["Automation", "AI Workflows", "Operations"],
        "reading_time": 5,
        "status": "published",
        "is_draft_content": True,
        "featured": False,
        "published_at": "2026-04-30T09:00:00+00:00",
        "updated_at": NOW,
        "seo_title": "The Automation Projects That Quietly Fail | AURA by Abhijit",
        "meta_description": "Automation rarely fails loudly. It fails when we automate broken processes. Practical lessons on choosing what — and what not — to automate.",
        "body": [
            {"type": "paragraph", "text": "Automation failures are quiet. There is no outage, no incident review, no post-mortem. There is just a gradual drift back to the manual process, a bot that someone keeps meaning to fix, and a subscription that survives a few budget cycles before anyone asks why."},
            {"type": "heading", "text": "Automating the mess"},
            {"type": "paragraph", "text": "The most common cause is deceptively simple: we automate processes we have never examined. A workflow that has accreted over years — exceptions, workarounds, tribal knowledge — gets encoded exactly as it exists. The automation inherits every flaw and adds a new one: it is now harder to change."},
            {"type": "quote", "text": "Automation without process becomes chaos — faster, more consistent, more expensive chaos."},
            {"type": "paragraph", "text": "The discipline is to simplify before you automate. Map the process as it should be, not as it is. Remove steps before you digitise them. The best automation projects I have seen spent most of their effort on subtraction."},
            {"type": "heading", "text": "Choose boring, high-frequency work"},
            {"type": "paragraph", "text": "The highest-return automations are unglamorous: reconciliations, report generation, ticket routing, provisioning. High frequency, low ambiguity, clear rules. They build organisational confidence and free real hours. The ambitious edge cases can wait until the muscle exists."},
            {"type": "paragraph", "text": "And decide upfront who owns the automation after launch. A bot without an owner is a failure on a timer."},
        ],
    },
    {
        "id": str(uuid.uuid4()),
        "slug": "cloud-without-architecture-is-expensive-hosting",
        "title": "Cloud Without Architecture Is Just Expensive Hosting",
        "subtitle": "Moving to the cloud changes where your servers live. It does not change how your systems are designed — unless you deliberately do the harder work.",
        "author": AUTHOR,
        "category": "Cloud",
        "tags": ["Cloud", "Azure", "Architecture"],
        "reading_time": 5,
        "status": "published",
        "is_draft_content": True,
        "featured": False,
        "published_at": "2026-03-21T09:00:00+00:00",
        "updated_at": NOW,
        "seo_title": "Cloud Without Architecture Is Just Expensive Hosting | AURA by Abhijit",
        "meta_description": "Lift-and-shift migrations relocate problems rather than solve them. Why architecture, governance and cost discipline matter more than the move itself.",
        "body": [
            {"type": "paragraph", "text": "The first cloud bill after a lift-and-shift migration has ended more optimism than any technical failure I have witnessed. The workloads moved successfully. The problems moved with them — and now they bill by the hour."},
            {"type": "heading", "text": "Migration is not transformation"},
            {"type": "paragraph", "text": "Relocating a server changes its address, not its design. An application that was over-provisioned on-premises becomes over-provisioned in the cloud, except now the waste is itemised. The organisations that extract real value treat migration as the trigger for architectural questions, not as the goal."},
            {"type": "quote", "text": "Cloud without architecture becomes cost. Architecture without governance becomes sprawl."},
            {"type": "paragraph", "text": "The questions that matter are unglamorous: which workloads should be re-platformed, which should be retired, which should stay put? What does the landing zone enforce by default? Who reviews spend, and how often?"},
            {"type": "heading", "text": "Governance before scale"},
            {"type": "paragraph", "text": "Tagging standards, cost alerts, environment policies, identity boundaries — none of this is exciting, and all of it is cheaper to establish before the hundredth workload than after. In distributed operations across many locations, that discipline is the difference between a cloud estate and a cloud bill."},
            {"type": "paragraph", "text": "The cloud rewards deliberate organisations and taxes impulsive ones. The technology is indifferent to which one you are."},
        ],
    },
]

async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": email, "name": "Abhijit Debnath",
            "password_hash": hash_password(password), "role": "admin", "password_source": "env",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    elif existing.get("password_source") != "manual" and not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})

async def seed_articles():
    count = await db.articles.count_documents({})
    if count == 0:
        await db.articles.insert_many(SEED_ARTICLES)
        logger.info("Seeded %d articles", len(SEED_ARTICLES))

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.articles.create_index("slug", unique=True)
    await db.articles.create_index([("status", 1), ("published_at", -1)])
    await db.recommendations.create_index("slug", unique=True)
    await db.recommendations.create_index([("status", 1), ("category", 1)])
    if await db.recommendation_categories.count_documents({}) == 0:
        await db.recommendation_categories.insert_many(
            [{**c, "id": str(uuid.uuid4())} for c in SEED_RECO_CATEGORIES]
        )
    await seed_admin()
    await seed_articles()
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error("Object storage init failed: %s", e)

# ---------- Object Storage (article hero images) ----------

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "aura"
_storage_key = None

def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": init_storage(), "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": _storage_key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": init_storage()}, timeout=60)
    if resp.status_code == 404 and not path.startswith(f"{APP_NAME}/"):
        init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": _storage_key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------- Admin: Article Studio ----------

SLUG_RE = re.compile(r"[^a-z0-9]+")
ALLOWED_BLOCKS = {"paragraph", "heading", "quote"}

def slugify(text: str) -> str:
    return SLUG_RE.sub("-", text.lower()).strip("-")[:180]

def clean_blocks(blocks: list) -> list:
    out = []
    for b in blocks[:200]:
        if isinstance(b, dict) and b.get("type") in ALLOWED_BLOCKS and isinstance(b.get("text"), str):
            text = b["text"].strip()
            if text:
                out.append({"type": b["type"], "text": text[:5000]})
    return out

class ArticleInput(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    subtitle: str = Field(default="", max_length=400)
    category: str = Field(min_length=2, max_length=80)
    tags: List[str] = Field(default_factory=list)
    body: List[dict] = Field(default_factory=list)
    reading_time: Optional[int] = Field(default=None, ge=1, le=120)
    featured: bool = False
    status: str = Field(default="draft", pattern="^(draft|published)$")
    slug: Optional[str] = Field(default=None, max_length=200)
    hero_image: Optional[str] = Field(default=None, max_length=300)
    seo_title: Optional[str] = Field(default=None, max_length=200)
    meta_description: Optional[str] = Field(default=None, max_length=300)

def article_doc(input: ArticleInput, existing: Optional[dict] = None) -> dict:
    body = clean_blocks(input.body)
    words = sum(len(b["text"].split()) for b in body)
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "title": input.title.strip(),
        "subtitle": input.subtitle.strip(),
        "author": AUTHOR,
        "category": input.category.strip(),
        "tags": [t.strip()[:40] for t in input.tags[:12] if t.strip()],
        "body": body,
        "reading_time": input.reading_time or max(1, round(words / 200)),
        "featured": input.featured,
        "status": input.status,
        "hero_image": (input.hero_image or "").strip() or None,
        "seo_title": (input.seo_title or "").strip() or None,
        "meta_description": (input.meta_description or "").strip() or None,
        "updated_at": now,
    }
    if existing is None:
        doc.update({
            "id": str(uuid.uuid4()),
            "slug": slugify(input.slug or input.title),
            "is_draft_content": False,
            "published_at": now,
        })
    elif input.slug and slugify(input.slug) != existing["slug"]:
        doc["slug"] = slugify(input.slug)
    return doc

@api_router.get("/admin/articles")
async def admin_list_articles(admin=Depends(get_current_admin)):
    return await db.articles.find({}, {"_id": 0}).sort("published_at", -1).to_list(200)

@api_router.post("/admin/articles", status_code=201)
async def admin_create_article(input: ArticleInput, admin=Depends(get_current_admin)):
    doc = article_doc(input)
    if await db.articles.find_one({"slug": doc["slug"]}):
        raise HTTPException(status_code=409, detail="An article with this slug already exists")
    if doc["featured"]:
        await db.articles.update_many({}, {"$set": {"featured": False}})
    await db.articles.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/articles/{article_id}")
async def admin_update_article(article_id: str, input: ArticleInput, admin=Depends(get_current_admin)):
    existing = await db.articles.find_one({"id": article_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")
    doc = article_doc(input, existing)
    if doc.get("slug") and doc["slug"] != existing["slug"]:
        if await db.articles.find_one({"slug": doc["slug"], "id": {"$ne": article_id}}):
            raise HTTPException(status_code=409, detail="An article with this slug already exists")
    if doc["featured"]:
        await db.articles.update_many({"id": {"$ne": article_id}}, {"$set": {"featured": False}})
    await db.articles.update_one({"id": article_id}, {"$set": doc})
    updated = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/articles/{article_id}")
async def admin_delete_article(article_id: str, admin=Depends(get_current_admin)):
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"ok": True}

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024

@api_router.post("/admin/upload", status_code=201)
async def admin_upload_image(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP or GIF images are allowed")
    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be under 8 MB")
    ext = (file.filename.rsplit(".", 1)[-1] or "jpg").lower()
    ext = {"jpeg": "jpg"}.get(ext, ext)
    path = f"{APP_NAME}/uploads/articles/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, file.content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": result["path"]}

@api_router.get("/media/{path:path}")
async def serve_media(path: str):
    if ".." in path or not path.startswith(f"{APP_NAME}/uploads/"):
        raise HTTPException(status_code=400, detail="Invalid path")
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found in storage")
    return Response(content=data, media_type=record.get("content_type") or content_type,
                    headers={"Cache-Control": "public, max-age=31536000, immutable"})

# ---------- Privacy-friendly Analytics ----------

class TrackInput(BaseModel):
    path: str = Field(min_length=1, max_length=300)
    referrer: Optional[str] = Field(default=None, max_length=300)
    event: Optional[str] = Field(default="pageview", max_length=30)
    target: Optional[str] = Field(default=None, max_length=300)

@api_router.post("/analytics/track", status_code=201)
async def track_pageview(input: TrackInput):
    path = input.path.split("?")[0].split("#")[0]
    if not path.startswith("/") or path.startswith("/admin"):
        return {"ok": True}
    ref_host = None
    if input.referrer:
        try:
            ref_host = urlparse(input.referrer).hostname
        except Exception:
            ref_host = None
    now = datetime.now(timezone.utc)
    await db.analytics_events.insert_one({
        "id": str(uuid.uuid4()),
        "path": path[:300],
        "referrer": ref_host,
        "event": (input.event or "pageview")[:30],
        "target": (input.target or "")[:300] or None,
        "date": now.strftime("%Y-%m-%d"),
        "ts": now.isoformat(),
    })
    return {"ok": True}

@api_router.get("/admin/analytics")
async def get_analytics(days: int = 30, admin=Depends(get_current_admin)):
    days = max(1, min(days, 365))
    since = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    pv = {"$or": [{"event": "pageview"}, {"event": {"$exists": False}}]}
    match = {"$match": {"date": {"$gte": since}, **pv}}
    total = await db.analytics_events.count_documents({"date": {"$gte": since}, **pv})
    by_page = await db.analytics_events.aggregate([
        match, {"$group": {"_id": "$path", "views": {"$sum": 1}}},
        {"$sort": {"views": -1}}, {"$limit": 25},
    ]).to_list(25)
    daily = await db.analytics_events.aggregate([
        match, {"$group": {"_id": "$date", "views": {"$sum": 1}}}, {"$sort": {"_id": 1}},
    ]).to_list(400)
    by_referrer = await db.analytics_events.aggregate([
        {"$match": {"date": {"$gte": since}, "referrer": {"$ne": None}}},
        {"$group": {"_id": "$referrer", "views": {"$sum": 1}}},
        {"$sort": {"views": -1}}, {"$limit": 10},
    ]).to_list(10)
    return {
        "days": days,
        "total_views": total,
        "by_page": [{"path": d["_id"], "views": d["views"]} for d in by_page],
        "daily": [{"date": d["_id"], "views": d["views"]} for d in daily],
        "by_referrer": [{"host": d["_id"], "views": d["views"]} for d in by_referrer],
    }

# ---------- Site Settings (editable from admin) ----------

class SettingsInput(BaseModel):
    phone: Optional[str] = Field(default=None, max_length=40)
    public_email: Optional[str] = Field(default=None, max_length=120)
    linkedin: Optional[str] = Field(default=None, max_length=300)
    youtube: Optional[str] = Field(default=None, max_length=300)
    facebook: Optional[str] = Field(default=None, max_length=300)
    booking_url: Optional[str] = Field(default=None, max_length=300)
    whatsapp: Optional[str] = Field(default=None, max_length=25)
    disclosure_text: Optional[str] = Field(default=None, max_length=2000)
    content: Optional[dict] = None

def clean_settings(input: SettingsInput) -> dict:
    doc = {}
    for field in ("linkedin", "youtube", "facebook", "booking_url"):
        val = (getattr(input, field) or "").strip()
        if val and not val.startswith("https://"):
            raise HTTPException(status_code=400, detail=f"{field} must be a full https:// URL")
        doc[field] = val or None
    phone = (input.phone or "").strip()
    doc["phone"] = phone or None
    wa = re.sub(r"[^\d]", "", input.whatsapp or "")
    if wa and len(wa) < 8:
        raise HTTPException(status_code=400, detail="WhatsApp number looks too short — include country code, e.g. 9198XXXXXXXX")
    doc["whatsapp"] = wa or None
    email = (input.public_email or "").strip().lower()
    if email and not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Invalid public email")
    doc["public_email"] = email or None
    doc["disclosure_text"] = (input.disclosure_text or "").strip() or None
    content = {}
    if isinstance(input.content, dict):
        for k in ("tagline", "description", "hero_title_1", "hero_title_2", "hero_subcopy", "credibility"):
            v = input.content.get(k)
            if isinstance(v, str) and v.strip():
                content[k] = v.strip()[:400]
        stats = input.content.get("stats")
        if isinstance(stats, list):
            clean_stats = []
            for s in stats[:6]:
                if isinstance(s, dict):
                    val = str(s.get("value", ""))[:20].strip()
                    lab = str(s.get("label", ""))[:120].strip()
                    if val and lab:
                        clean_stats.append({"value": val, "label": lab})
            if clean_stats:
                content["stats"] = clean_stats
        ve = input.content.get("verified_experience")
        if isinstance(ve, list):
            clean_ve = [str(x).strip()[:160] for x in ve[:8] if isinstance(x, str) and x.strip()]
            if clean_ve:
                content["verified_experience"] = clean_ve
        st = input.content.get("speaking_topics")
        if isinstance(st, list):
            clean_st = [str(x).strip()[:60] for x in st[:20] if isinstance(x, str) and x.strip()]
            if clean_st:
                content["speaking_topics"] = clean_st
        tl = input.content.get("timeline")
        if isinstance(tl, list):
            clean_tl = [{"era": str(x.get("era", ""))[:80].strip(), "note": str(x.get("note", ""))[:300].strip()}
                        for x in tl[:12] if isinstance(x, dict)]
            clean_tl = [x for x in clean_tl if x["era"]]
            if clean_tl:
                content["timeline"] = clean_tl
        aa = input.content.get("advisory_areas")
        if isinstance(aa, list):
            clean_aa = [{"title": str(x.get("title", ""))[:80].strip(), "desc": str(x.get("desc", ""))[:300].strip()}
                        for x in aa[:12] if isinstance(x, dict)]
            clean_aa = [x for x in clean_aa if x["title"]]
            if clean_aa:
                content["advisory_areas"] = clean_aa
        dm = input.content.get("dimensions")
        if isinstance(dm, list):
            clean_dm = []
            for x in dm[:8]:
                if not isinstance(x, dict):
                    continue
                title = str(x.get("title", ""))[:80].strip()
                if not title:
                    continue
                topics = x.get("topics")
                clean_dm.append({
                    "title": title,
                    "slug": str(x.get("slug", ""))[:60].strip() or slugify(title),
                    "desc": str(x.get("desc", ""))[:300].strip(),
                    "topics": [str(t).strip()[:60] for t in topics[:8] if isinstance(t, str) and t.strip()] if isinstance(topics, list) else [],
                })
            if clean_dm:
                content["dimensions"] = clean_dm
        fn = input.content.get("field_notes")
        if isinstance(fn, list):
            clean_fn = []
            for x in fn[:8]:
                if not isinstance(x, dict):
                    continue
                title = str(x.get("title", ""))[:120].strip()
                if not title:
                    continue
                clean_fn.append({k: str(x.get(k, ""))[:600].strip() for k in ("tag", "title", "problem", "thinking", "approach", "outcome")})
            if clean_fn:
                content["field_notes"] = clean_fn
    doc["content"] = content or None
    return doc

@api_router.get("/settings")
async def get_settings():
    doc = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    return doc or {"id": "main"}

@api_router.put("/admin/settings")
async def update_settings(input: SettingsInput, admin=Depends(get_current_admin)):
    doc = clean_settings(input)
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.site_settings.update_one({"id": "main"}, {"$set": doc}, upsert=True)
    return await db.site_settings.find_one({"id": "main"}, {"_id": 0})

# ---------- AURA Recommendations ----------

RECO_STATUSES = {"draft", "review", "approved", "published", "update_required", "archived"}
RECO_BADGES = {"AURA PICK", "AURA VALUE", "AURA PRO"}
SUB_SCORE_KEYS = {"performance", "reliability", "value", "ease_of_use", "professional_suitability"}

class MerchantInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    product_url: Optional[str] = Field(default=None, max_length=500)
    affiliate_url: Optional[str] = Field(default=None, max_length=500)
    affiliate_enabled: bool = False
    disclosure_override: Optional[str] = Field(default=None, max_length=600)

class RecommendationInput(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category: str = Field(min_length=2, max_length=80)
    description: str = Field(default="", max_length=600)
    image: Optional[str] = Field(default=None, max_length=300)
    aura_score: Optional[float] = Field(default=None, ge=1.0, le=10.0)
    sub_scores: Optional[dict] = None
    badge: Optional[str] = Field(default=None, max_length=20)
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    best_for: Optional[str] = Field(default=None, max_length=300)
    avoid_if: Optional[str] = Field(default=None, max_length=300)
    verdict: Optional[str] = Field(default=None, max_length=2000)
    merchants: List[MerchantInput] = Field(default_factory=list)
    status: str = Field(default="draft")
    featured: bool = False
    sort_order: int = 0
    setup_group: Optional[str] = Field(default=None, max_length=80)
    slug: Optional[str] = Field(default=None, max_length=200)

def clean_recommendation(input: RecommendationInput) -> dict:
    if input.status not in RECO_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    badge = input.badge or None
    if badge and badge not in RECO_BADGES:
        raise HTTPException(status_code=400, detail="Invalid badge")
    sub_scores = None
    if input.sub_scores:
        sub_scores = {}
        for k, v in input.sub_scores.items():
            if k not in SUB_SCORE_KEYS:
                continue
            try:
                fv = float(v)
            except (TypeError, ValueError):
                continue
            if 1.0 <= fv <= 10.0:
                sub_scores[k] = fv
        sub_scores = sub_scores or None
    merchants = []
    for m in input.merchants[:5]:
        md = {"name": m.name.strip(), "affiliate_enabled": m.affiliate_enabled}
        for f in ("product_url", "affiliate_url"):
            val = (getattr(m, f) or "").strip()
            if val and not val.startswith("https://"):
                raise HTTPException(status_code=400, detail=f"Merchant {f} must be a full https:// URL")
            md[f] = val or None
        md["disclosure_override"] = (m.disclosure_override or "").strip() or None
        merchants.append(md)
    return {
        "name": input.name.strip(),
        "category": input.category.strip().lower(),
        "description": input.description.strip(),
        "image": (input.image or "").strip() or None,
        "aura_score": input.aura_score,
        "sub_scores": sub_scores,
        "badge": badge,
        "pros": [p.strip()[:300] for p in input.pros[:12] if p.strip()],
        "cons": [c.strip()[:300] for c in input.cons[:12] if c.strip()],
        "best_for": (input.best_for or "").strip() or None,
        "avoid_if": (input.avoid_if or "").strip() or None,
        "verdict": (input.verdict or "").strip() or None,
        "merchants": merchants,
        "status": input.status,
        "featured": input.featured,
        "sort_order": input.sort_order,
        "setup_group": (input.setup_group or "").strip() or None,
    }

@api_router.get("/recommendations/categories")
async def reco_categories():
    return await db.recommendation_categories.find({}, {"_id": 0}).sort("sort_order", 1).to_list(50)

@api_router.get("/recommendations")
async def list_recommendations(category: Optional[str] = None, badge: Optional[str] = None):
    query = {"status": "published"}
    if category:
        query["category"] = category
    if badge:
        query["badge"] = badge
    return await db.recommendations.find(query, {"_id": 0}).sort([("sort_order", 1), ("published_at", -1)]).to_list(200)

@api_router.get("/recommendations/{slug}")
async def get_recommendation(slug: str):
    doc = await db.recommendations.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    related = await db.recommendations.find(
        {"status": "published", "category": doc["category"], "slug": {"$ne": slug}}, {"_id": 0}
    ).sort("sort_order", 1).limit(3).to_list(3)
    return {"item": doc, "related": related}

@api_router.get("/admin/recommendations")
async def admin_list_recommendations(admin=Depends(get_current_admin)):
    return await db.recommendations.find({}, {"_id": 0}).sort([("sort_order", 1), ("updated_at", -1)]).to_list(300)

@api_router.post("/admin/recommendations", status_code=201)
async def admin_create_recommendation(input: RecommendationInput, admin=Depends(get_current_admin)):
    doc = clean_recommendation(input)
    doc["slug"] = slugify(input.slug or input.name)
    if await db.recommendations.find_one({"slug": doc["slug"]}):
        raise HTTPException(status_code=409, detail="A recommendation with this slug already exists")
    now = datetime.now(timezone.utc).isoformat()
    doc.update({"id": str(uuid.uuid4()), "published_at": now, "last_reviewed": None, "created_at": now, "updated_at": now})
    await db.recommendations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/recommendations/{rec_id}")
async def admin_update_recommendation(rec_id: str, input: RecommendationInput, admin=Depends(get_current_admin)):
    existing = await db.recommendations.find_one({"id": rec_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    doc = clean_recommendation(input)
    new_slug = slugify(input.slug or input.name)
    if new_slug != existing["slug"]:
        if await db.recommendations.find_one({"slug": new_slug, "id": {"$ne": rec_id}}):
            raise HTTPException(status_code=409, detail="A recommendation with this slug already exists")
        doc["slug"] = new_slug
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.recommendations.update_one({"id": rec_id}, {"$set": doc})
    return await db.recommendations.find_one({"id": rec_id}, {"_id": 0})

@api_router.delete("/admin/recommendations/{rec_id}")
async def admin_delete_recommendation(rec_id: str, admin=Depends(get_current_admin)):
    result = await db.recommendations.delete_one({"id": rec_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return {"ok": True}

class CategoryInput(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    description: str = Field(default="", max_length=200)

@api_router.post("/admin/recommendation-categories", status_code=201)
async def admin_create_category(input: CategoryInput, admin=Depends(get_current_admin)):
    slug = slugify(input.name)
    if await db.recommendation_categories.find_one({"slug": slug}):
        raise HTTPException(status_code=409, detail="Category already exists")
    max_order = await db.recommendation_categories.find_one({}, sort=[("sort_order", -1)])
    doc = {"id": str(uuid.uuid4()), "name": input.name.strip(), "slug": slug,
           "description": input.description.strip(), "sort_order": (max_order or {}).get("sort_order", 0) + 1}
    await db.recommendation_categories.insert_one(doc)
    doc.pop("_id", None)
    return doc

SEED_RECO_CATEGORIES = [
    {"name": "AI Tools", "slug": "ai-tools", "description": "AI assistants, research, automation, coding, creative AI", "sort_order": 1},
    {"name": "Creator Gear", "slug": "creator-gear", "description": "Cameras, microphones, lighting, monitors, accessories", "sort_order": 2},
    {"name": "Computers", "slug": "computers", "description": "Laptops, desktops, workstations, computing hardware", "sort_order": 3},
    {"name": "Monitors", "slug": "monitors", "description": "Productivity, professional, creator, high-res displays", "sort_order": 4},
    {"name": "Cybersecurity", "slug": "cybersecurity", "description": "Security, privacy, backup, identity tools", "sort_order": 5},
    {"name": "Productivity", "slug": "productivity", "description": "Apps and platforms that improve workflows", "sort_order": 6},
    {"name": "Software", "slug": "software", "description": "Professional software, SaaS, cloud, digital tools", "sort_order": 7},
    {"name": "My Setup", "slug": "my-setup", "description": "Tools and gear used or evaluated in Abhijit's setup", "sort_order": 8},
    {"name": "AURA Picks", "slug": "aura-picks", "description": "The strongest recommendations across categories", "sort_order": 9},
]

# ---------- AURA AI Chatbot ----------

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

CHAT_SYSTEM = """You are AURA AI, the concierge of aurabyabhijit.com — the personal technology leadership platform of Abhijit Debnath.

You are not a website navigation assistant. You are an experienced technology mentor having a useful conversation with the visitor — the way Abhijit would talk to someone who asked him for advice over coffee.

VERIFIED FACTS (only these — never invent anything else about Abhijit):
- Abhijit Debnath: technology leader, 20+ years in IT, 10+ years in technology leadership, enabled technology across 65+ distributed business locations.
- Expertise: AI & intelligence, digital transformation, cybersecurity, cloud & Azure infrastructure, automation, technology leadership & CIO thinking.
- Positioning: "Technology Leadership for an Intelligent Future." Philosophy: "Technology is not the destination. Business transformation is."
- Signature frameworks: the Six Dimensions of Modern Technology Leadership (AI & Intelligence, Digital Transformation, Cybersecurity, Cloud & Infrastructure, Automation, Technology Leadership) and the AURA Decision Framework (Understand, Simplify, Secure, Automate, Scale, Measure) — both on /expertise and the homepage.
- Services: strategic technology advisory — AI strategy, AI automation, digital transformation, cybersecurity strategy, technology advisory, executive technology advisory.
- Site pages: / (home), /about, /expertise, /perspective (articles), /recommendations (evaluated tools with AURA Score), /projects, /speaking, /work-with-me, /contact.

HOW TO HAVE A CONVERSATION:
- First understand what the visitor is actually trying to achieve, not just the literal question.
- Give the useful, practical answer first. Never send the visitor to a page when you can answer the question yourself.
- Close with the visitor's next best step — the one thing worth doing next.
- Keep answers concise: usually 3-8 short sentences, or a short list when it improves readability. Use simple numbered lists or hyphen bullets with line breaks. Plain text only — never use markdown symbols like **, ## or backticks.
- Speak naturally, like a person. No corporate jargon, no sales language, no long introductions, no repeated "explore our website".
- Ask at most ONE follow-up question, and only when the answer would materially improve your advice. Never ask several questions at once.
- For simple questions, give a simple answer. Do not force structure, next steps or a roadmap where they are not needed.
- When relevant AURA content genuinely helps, you may mention it once, naturally, at the end (for example an article from the published perspectives list, /expertise or /recommendations). Never more than one pointer per reply.

ROADMAPS:
- When a question is clearly goal-oriented — for example becoming a CIO or CTO, moving from IT Manager to IT Director, moving into cybersecurity leadership, introducing AI into a business, improving an IT department, planning a cloud or transformation journey — give a practical answer first, then offer: "Would you like me to create a roadmap for you?"
- Only create the roadmap if the visitor says yes or clearly asks for one. Never force a roadmap on a question that does not need one.
- A roadmap covers, concisely: 1. Current situation 2. Target 3. Key areas to develop 4. Priorities 5. Practical next steps 6. A 30/60/90-day plan 7. Relevant AURA content, when available.
- Keep roadmaps compact — short lines, no filler — so the complete roadmap fits comfortably within a single reply.

BOUNDARIES (absolute):
- AURA is Abhijit's personal platform — his own experiences, ideas, perspectives, learning and publicly shared content. NEVER present yourself as representing Abhijit's current or past employer.
- NEVER disclose, guess, infer or fabricate: employer confidential information, internal systems or infrastructure, internal projects or processes, customer or patient information, security details, financial or business information, vendor or contract information, private information about colleagues or other individuals, or any other non-public professional information. If asked for such information, politely explain that you can only discuss Abhijit's publicly shared professional experience, ideas and content.
- Give generalised technology leadership lessons and publicly shared knowledge only. Present all views on AI, cybersecurity, cloud, automation, technology and leadership as Abhijit's personal perspective and experience — never as an official statement from any organisation or employer. Never imply access to any employer's internal data, systems, customers, employees or projects.
- Do not claim Abhijit officially provides consulting, outside employment or other professional services beyond what is published on this site. If a visitor asks how to work with him, direct them to /work-with-me or /contact without making promises.
- Never invent facts, clients, awards, prices, dates, or claims about Abhijit. If information is unavailable, say so clearly and point to /contact.

Tone: an experienced technology leader having a useful conversation — intelligent, warm, direct, practical."""

class ChatInput(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    history: List[dict] = Field(default_factory=list)

@api_router.post("/chat")
async def aura_chat(input: ChatInput, request: Request):
    ip = request.client.host if request.client else "unknown"
    hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    recent = await db.chat_rate.count_documents({"ip": ip, "ts": {"$gte": hour_ago}})
    if recent >= 20:
        raise HTTPException(status_code=429, detail="AURA AI is catching its breath — please try again in a little while, or use the contact form.")
    await db.chat_rate.insert_one({"id": str(uuid.uuid4()), "ip": ip, "ts": datetime.now(timezone.utc).isoformat()})

    clean_history = []
    for h in input.history[-6:]:
        if isinstance(h, dict) and h.get("role") in ("user", "assistant") and isinstance(h.get("content"), str):
            clean_history.append(f"{'Visitor' if h['role'] == 'user' else 'AURA AI'}: {h['content'][:1000]}")

    context = ""
    try:
        titles = await db.articles.find({"status": "published"}, {"_id": 0, "title": 1}).sort("published_at", -1).limit(5).to_list(5)
        if titles:
            context = "\n\nCurrent published perspectives: " + "; ".join(t["title"] for t in titles)
    except Exception:
        pass

    prompt = ""
    if clean_history:
        prompt += "Conversation so far:\n" + "\n".join(clean_history) + "\n\n"
    prompt += f"Visitor: {input.message.strip()[:500]}"

    async def stream():
        try:
            chat = LlmChat(
                api_key=os.environ["EMERGENT_LLM_KEY"],
                session_id=f"aura-{uuid.uuid4()}",
                system_message=CHAT_SYSTEM + context,
            ).with_model("gemini", "gemini-2.5-flash").with_params(max_tokens=1200)
            async for event in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(event, TextDelta):
                    yield "data: " + event.content.replace("\n", "\\n") + "\n\n"
                elif isinstance(event, StreamDone):
                    break
        except Exception as e:
            logger.error("AURA AI error: %s", e)
            yield "data: AURA AI is resting right now — please use Start a Conversation on the contact page and Abhijit will reply personally.\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
