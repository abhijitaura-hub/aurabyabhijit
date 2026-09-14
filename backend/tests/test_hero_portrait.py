"""Backend tests for hero portrait admin upload + settings validation."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aura-tech-leadership.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "abhijit@aurabyabhijit.com"
ADMIN_PASSWORD = "AuraAdmin#2026"
LOCAL_IMAGE = "/app/frontend/public/assets/portrait-cutout.png"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    tok = r.json().get("token")
    assert tok
    return tok


def test_health():
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200


def test_unauth_upload_rejected():
    with open(LOCAL_IMAGE, "rb") as f:
        r = requests.post(f"{BASE_URL}/api/admin/upload", files={"file": ("p.png", f, "image/png")})
    assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}"


def test_upload_and_settings_flow(token):
    # Upload valid image
    with open(LOCAL_IMAGE, "rb") as f:
        r = requests.post(
            f"{BASE_URL}/api/admin/upload",
            headers={"Authorization": f"Bearer {token}"},
            files={"file": ("portrait-cutout.png", f, "image/png")},
        )
    assert r.status_code == 201, f"upload failed: {r.status_code} {r.text}"
    path = r.json().get("path")
    assert path and path.startswith("aura/uploads/"), f"bad path: {path}"

    # Media served
    m = requests.get(f"{BASE_URL}/api/media/{path}")
    assert m.status_code == 200
    assert m.headers.get("content-type", "").startswith("image/")

    # Fetch current settings to preserve fields
    cur = requests.get(f"{BASE_URL}/api/settings").json()
    payload = {k: cur.get(k) for k in ("phone", "public_email", "linkedin", "youtube", "facebook", "booking_url", "whatsapp", "disclosure_text")}
    payload["content"] = cur.get("content") or {}
    payload["hero_portrait"] = path

    up = requests.put(f"{BASE_URL}/api/admin/settings", headers={"Authorization": f"Bearer {token}"}, json=payload)
    assert up.status_code == 200, f"settings save failed: {up.status_code} {up.text}"

    # Public settings should return new path
    s = requests.get(f"{BASE_URL}/api/settings").json()
    assert s.get("hero_portrait") == path


def test_reject_external_url(token):
    cur = requests.get(f"{BASE_URL}/api/settings").json()
    payload = {"hero_portrait": "https://evil.com/x.png", "content": cur.get("content") or {}}
    r = requests.put(f"{BASE_URL}/api/admin/settings", headers={"Authorization": f"Bearer {token}"}, json=payload)
    assert r.status_code == 400


def test_reject_traversal(token):
    cur = requests.get(f"{BASE_URL}/api/settings").json()
    payload = {"hero_portrait": "aura/uploads/../etc/passwd", "content": cur.get("content") or {}}
    r = requests.put(f"{BASE_URL}/api/admin/settings", headers={"Authorization": f"Bearer {token}"}, json=payload)
    assert r.status_code == 400


def test_reject_non_image_upload(token):
    r = requests.post(
        f"{BASE_URL}/api/admin/upload",
        headers={"Authorization": f"Bearer {token}"},
        files={"file": ("note.txt", b"hello world", "text/plain")},
    )
    assert r.status_code == 400
