"""Farmer Helper backend API tests - auth, mandi, weather, schemes, products."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://mandi-connect-19.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@farmhelper.in"
ADMIN_PASSWORD = "Admin@123"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Health / Root ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "message" in r.json()


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert "id" in data["user"]

    def test_login_invalid_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"}, timeout=15)
        assert r.status_code == 401

    def test_login_unknown_user(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "noone@foo.com", "password": "x"}, timeout=15)
        assert r.status_code == 401

    def test_me_requires_token(self, session):
        r = session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_token(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"

    def test_me_invalid_token(self, session):
        r = session.get(f"{API}/auth/me", headers={"Authorization": "Bearer invalid.token.here"}, timeout=15)
        assert r.status_code == 401


# ---------- Mandi ----------
class TestMandi:
    def test_mandi_default(self, session):
        r = session.get(f"{API}/mandi?limit=10", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "records" in d and "count" in d
        assert isinstance(d["records"], list)
        if d["records"]:
            rec = d["records"][0]
            for k in ("state", "district", "market", "commodity", "modal_price"):
                assert k in rec

    def test_mandi_filter(self, session):
        r = session.get(f"{API}/mandi?state=Maharashtra&limit=5", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["records"], list)


# ---------- Weather ----------
class TestWeather:
    def test_weather_delhi(self, session):
        r = session.get(f"{API}/weather?lat=28.61&lon=77.21", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "current" in d and "forecast" in d and "location" in d
        for k in ("temp", "humidity", "description", "icon"):
            assert k in d["current"]
        assert isinstance(d["forecast"], list)
        # Expect up to 3 days
        assert len(d["forecast"]) <= 3


# ---------- Schemes ----------
class TestSchemes:
    def test_list_schemes(self, session):
        r = session.get(f"{API}/schemes", timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 6
        # ensure no _id leak
        for it in items:
            assert "_id" not in it
            assert "id" in it and "name" in it and "apply_url" in it

    def test_create_scheme_requires_auth(self, session):
        r = session.post(f"{API}/schemes", json={
            "name": "TEST_NoAuth", "benefit": "x", "apply_url": "https://x.com"
        }, timeout=15)
        assert r.status_code in (401, 403)

    def test_scheme_crud(self, session, auth_headers):
        payload = {
            "name": f"TEST_Scheme_{uuid.uuid4().hex[:6]}",
            "benefit": "Test benefit",
            "description": "Test desc",
            "eligibility": "Anyone",
            "apply_url": "https://example.com/apply",
            "image_url": "https://example.com/img.jpg",
            "category": "Test",
        }
        # Create
        r = session.post(f"{API}/schemes", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        created = r.json()
        sid = created["id"]
        assert created["name"] == payload["name"]

        # Verify in list
        r = session.get(f"{API}/schemes", timeout=15)
        assert any(s["id"] == sid for s in r.json())

        # Update
        upd = {**payload, "benefit": "Updated benefit"}
        r = session.put(f"{API}/schemes/{sid}", json=upd, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["benefit"] == "Updated benefit"

        # Verify update persisted
        r = session.get(f"{API}/schemes", timeout=15)
        found = next((s for s in r.json() if s["id"] == sid), None)
        assert found and found["benefit"] == "Updated benefit"

        # Delete
        r = session.delete(f"{API}/schemes/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200

        # Verify deleted
        r = session.get(f"{API}/schemes", timeout=15)
        assert not any(s["id"] == sid for s in r.json())

        # Delete non-existent -> 404
        r = session.delete(f"{API}/schemes/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 404


# ---------- Products ----------
class TestProducts:
    def test_list_products(self, session):
        r = session.get(f"{API}/products", timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 6
        for it in items:
            assert "_id" not in it
            assert "id" in it and "name" in it and "amazon_url" in it and "price" in it

    def test_create_product_requires_auth(self, session):
        r = session.post(f"{API}/products", json={
            "name": "TEST_NoAuth", "category": "x", "price": 1.0,
            "image_url": "https://x.com/i.jpg", "amazon_url": "https://x.com"
        }, timeout=15)
        assert r.status_code in (401, 403)

    def test_product_crud(self, session, auth_headers):
        payload = {
            "name": f"TEST_Product_{uuid.uuid4().hex[:6]}",
            "category": "Seeds",
            "price": 99.5,
            "currency": "INR",
            "image_url": "https://example.com/i.jpg",
            "amazon_url": "https://amazon.in/abc",
            "description": "test",
        }
        r = session.post(f"{API}/products", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]

        # Update
        upd = {**payload, "price": 149.0}
        r = session.put(f"{API}/products/{pid}", json=upd, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["price"] == 149.0

        # Category filter
        r = session.get(f"{API}/products?category=Seeds", timeout=15)
        assert r.status_code == 200
        assert all(p["category"] == "Seeds" for p in r.json())

        # Delete
        r = session.delete(f"{API}/products/{pid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200

        # Non-existent delete
        r = session.delete(f"{API}/products/{pid}", headers=auth_headers, timeout=15)
        assert r.status_code == 404
