from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
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
    return {"ok": True, "id": doc["id"]}

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
            "password_hash": hash_password(password), "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    elif not verify_password(password, existing["password_hash"]):
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
    await seed_admin()
    await seed_articles()

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
