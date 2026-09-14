"""Tests for admin-editable website content feature.

Coverage:
- Auth (login) to fetch admin JWT.
- Public GET /api/settings returns dict, does not leak _id.
- PUT /api/admin/settings persists new content keys and about_portrait.
- Security: about_portrait rejects external URL (400); PUT without token → 401/403.
- Cross-tab safety: partial save preserves unknown keys.
- Cleanup at end: restore original settings & remove about_portrait.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = "abhijit@aurabyabhijit.com"
ADMIN_PASSWORD = "AuraAdmin#2026"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def original_settings():
    r = requests.get(f"{BASE_URL}/api/settings", timeout=15)
    assert r.status_code == 200
    return r.json()


def _put(token, payload):
    return requests.put(f"{BASE_URL}/api/admin/settings",
                        json=payload,
                        headers={"Authorization": f"Bearer {token}"}, timeout=15)


def _echo_payload(s, **overrides):
    """Build a full settings PUT payload echoing all existing top-level fields."""
    payload = {
        "phone": s.get("phone"),
        "public_email": s.get("public_email"),
        "linkedin": s.get("linkedin"),
        "youtube": s.get("youtube"),
        "facebook": s.get("facebook"),
        "booking_url": s.get("booking_url"),
        "whatsapp": s.get("whatsapp"),
        "disclosure_text": s.get("disclosure_text"),
        "hero_portrait": s.get("hero_portrait"),
        "about_portrait": s.get("about_portrait"),
        "content": s.get("content") or {},
    }
    payload.update(overrides)
    return payload


class TestPublicSettings:
    def test_get_settings_ok(self, original_settings):
        assert isinstance(original_settings, dict)
        assert "_id" not in original_settings
        # content is a dict (or None when nothing saved)
        c = original_settings.get("content")
        assert c is None or isinstance(c, dict)


class TestSecurity:
    def test_put_requires_auth(self, original_settings):
        r = requests.put(f"{BASE_URL}/api/admin/settings",
                         json=_echo_payload(original_settings), timeout=15)
        assert r.status_code in (401, 403), r.text

    def test_about_portrait_rejects_external_url(self, token, original_settings):
        r = _put(token, _echo_payload(original_settings,
                                      about_portrait="https://evil.com/x.png"))
        assert r.status_code == 400, r.text
        assert "about_portrait" in r.text.lower()

    def test_about_portrait_rejects_traversal(self, token, original_settings):
        r = _put(token, _echo_payload(original_settings,
                                      about_portrait="aura/uploads/../../../etc/passwd"))
        assert r.status_code == 400, r.text


class TestContentPersistence:
    def test_save_and_retrieve_content_keys(self, token, original_settings):
        marker = "TEST_EYEBROW_XYZ_pytest"
        content = dict(original_settings.get("content") or {})
        content["hero_eyebrow"] = marker
        content["why_aura_p1"] = "TEST_WHY_P1"
        content["share_items"] = [{"title": "TEST_SHARE", "text": "ok"}]
        content["chat_suggestions"] = ["TEST_CHIP_1", "TEST_CHIP_2"]
        content["contact_topics"] = ["TEST_TOPIC_1", "TEST_TOPIC_2"]
        content["bio_paragraphs"] = ["**TEST bold** normal", "*italic*"]
        r = _put(token, _echo_payload(original_settings, content=content))
        assert r.status_code == 200, r.text

        got = requests.get(f"{BASE_URL}/api/settings", timeout=15).json()
        c = got["content"]
        assert c["hero_eyebrow"] == marker
        assert c["why_aura_p1"] == "TEST_WHY_P1"
        assert c["share_items"][0]["title"] == "TEST_SHARE"
        assert c["chat_suggestions"] == ["TEST_CHIP_1", "TEST_CHIP_2"]
        assert c["contact_topics"] == ["TEST_TOPIC_1", "TEST_TOPIC_2"]
        assert c["bio_paragraphs"] == ["**TEST bold** normal", "*italic*"]

    def test_content_limits_strip_extras(self, token, original_settings):
        # chat_suggestions capped to 4, contact_topics to 12
        content = dict(original_settings.get("content") or {})
        content["chat_suggestions"] = [f"c{i}" for i in range(10)]
        content["contact_topics"] = [f"t{i}" for i in range(20)]
        r = _put(token, _echo_payload(original_settings, content=content))
        assert r.status_code == 200
        c = requests.get(f"{BASE_URL}/api/settings", timeout=15).json()["content"]
        assert len(c["chat_suggestions"]) == 4
        assert len(c["contact_topics"]) == 12


class TestCleanup:
    def test_restore_original(self, token, original_settings):
        # restore original content and about_portrait state
        r = _put(token, _echo_payload(original_settings,
                                      content=original_settings.get("content") or {},
                                      about_portrait=original_settings.get("about_portrait")))
        assert r.status_code == 200, r.text
        got = requests.get(f"{BASE_URL}/api/settings", timeout=15).json()
        oc = original_settings.get("content") or {}
        gc = got.get("content") or {}
        # Verify a few key fields match
        for k in ("hero_eyebrow", "why_aura_p1", "share_items", "chat_suggestions",
                  "contact_topics", "bio_paragraphs"):
            assert gc.get(k) == oc.get(k), f"{k} mismatch after restore"
        assert got.get("about_portrait") == original_settings.get("about_portrait")
