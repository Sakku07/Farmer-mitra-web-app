from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Constants
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
DATA_GOV_KEY = os.environ['DATA_GOV_KEY']
OPENWEATHER_KEY = os.environ['OPENWEATHER_KEY']

DATA_GOV_MANDI_RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070"
DATA_GOV_URL = f"https://api.data.gov.in/resource/{DATA_GOV_MANDI_RESOURCE}"

app = FastAPI(title="Farmer Helper API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ============ Auth helpers ============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0, "password_hash": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


# ============ Models ============
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AdminOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class LoginOut(BaseModel):
    token: str
    user: AdminOut


class SchemeIn(BaseModel):
    name: str
    benefit: str
    description: str = ""
    eligibility: str = ""
    apply_url: str
    image_url: str = ""
    category: str = "General"


class Scheme(SchemeIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProductIn(BaseModel):
    name: str
    category: str
    price: float
    currency: str = "INR"
    image_url: str
    amazon_url: str
    description: str = ""


class Product(ProductIn):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ============ Seed ============
INITIAL_SCHEMES = [
    {
        "name": "PM Kisan Samman Nidhi",
        "benefit": "₹6,000/year direct income support to small & marginal farmers",
        "description": "Income support of ₹6,000 per year in three equal installments of ₹2,000 directly credited to farmer bank accounts.",
        "eligibility": "All landholding farmer families with cultivable land.",
        "apply_url": "https://pmkisan.gov.in/",
        "image_url": "https://images.pexels.com/photos/31983759/pexels-photo-31983759.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "category": "Income Support",
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "benefit": "Low-premium crop insurance against natural calamities",
        "description": "Comprehensive crop insurance covering pre-sowing to post-harvest losses due to non-preventable natural risks.",
        "eligibility": "All farmers growing notified crops in notified areas.",
        "apply_url": "https://pmfby.gov.in/",
        "image_url": "https://images.unsplash.com/photo-1767880408267-e9f64de1fe7a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBmYXJtZXIlMjBncmVlbiUyMGZpZWxkfGVufDB8fHx8MTc3Njk2ODY4NHww&ixlib=rb-4.1.0&q=85",
        "category": "Insurance",
    },
    {
        "name": "Kisan Credit Card (KCC)",
        "benefit": "Short-term credit at 4% interest for crops & allied activities",
        "description": "Flexible credit facility for farmers to meet the short-term credit requirements for cultivation of crops, post-harvest expenses and farm maintenance.",
        "eligibility": "All farmers, sharecroppers, tenant farmers and SHG members.",
        "apply_url": "https://www.myscheme.gov.in/schemes/kcc",
        "image_url": "https://images.pexels.com/photos/35291342/pexels-photo-35291342.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "category": "Credit",
    },
    {
        "name": "Soil Health Card Scheme",
        "benefit": "Free soil testing & personalised fertilizer recommendations",
        "description": "Every farmer receives a Soil Health Card every 2 years carrying crop-wise recommendations of nutrients & fertilizers.",
        "eligibility": "All farmers across India.",
        "apply_url": "https://soilhealth.dac.gov.in/",
        "image_url": "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMHNlZWRzJTIwcGFja2V0fGVufDB8fHx8MTc3Njk2ODY5OXww&ixlib=rb-4.1.0&q=85",
        "category": "Soil & Input",
    },
    {
        "name": "PM Kisan Maan-Dhan Yojana",
        "benefit": "₹3,000/month pension for small & marginal farmers after 60",
        "description": "Voluntary, contributory pension scheme for all landholding small & marginal farmers between the age of 18 to 40 years.",
        "eligibility": "Small & marginal farmers aged 18-40 with up to 2 hectares of cultivable land.",
        "apply_url": "https://maandhan.in/",
        "image_url": "https://images.pexels.com/photos/31983759/pexels-photo-31983759.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "category": "Pension",
    },
    {
        "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
        "benefit": "₹50,000/hectare support over 3 years for organic farming",
        "description": "Promotion of organic farming through adoption of organic village by cluster approach and PGS certification.",
        "eligibility": "Farmers forming clusters of 50 acres/20 ha for organic farming.",
        "apply_url": "https://pgsindia-ncof.gov.in/",
        "image_url": "https://images.unsplash.com/photo-1767880408267-e9f64de1fe7a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBmYXJtZXIlMjBncmVlbiUyMGZpZWxkfGVufDB8fHx8MTc3Njk2ODY4NHww&ixlib=rb-4.1.0&q=85",
        "category": "Organic",
    },
]

INITIAL_PRODUCTS = [
    {
        "name": "Hybrid Tomato Seeds (10g pack)",
        "category": "Seeds",
        "price": 149.0,
        "image_url": "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMHNlZWRzJTIwcGFja2V0fGVufDB8fHx8MTc3Njk2ODY5OXww&ixlib=rb-4.1.0&q=85",
        "amazon_url": "https://www.amazon.in/s?k=hybrid+tomato+seeds",
        "description": "High-yield hybrid tomato seeds suited for Indian climate.",
    },
    {
        "name": "Heavy Duty Garden Hoe",
        "category": "Tools",
        "price": 399.0,
        "image_url": "https://images.pexels.com/photos/35291342/pexels-photo-35291342.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "amazon_url": "https://www.amazon.in/s?k=garden+hoe",
        "description": "Rust-resistant carbon steel hoe for tilling and weeding.",
    },
    {
        "name": "Neem Oil 1L (Organic Pesticide)",
        "category": "Pesticides",
        "price": 549.0,
        "image_url": "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMHNlZWRzJTIwcGFja2V0fGVufDB8fHx8MTc3Njk2ODY5OXww&ixlib=rb-4.1.0&q=85",
        "amazon_url": "https://www.amazon.in/s?k=neem+oil+pesticide",
        "description": "100% pure cold-pressed neem oil, effective against common crop pests.",
    },
    {
        "name": "Drip Irrigation Kit (50m)",
        "category": "Irrigation",
        "price": 1299.0,
        "image_url": "https://images.pexels.com/photos/31983759/pexels-photo-31983759.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "amazon_url": "https://www.amazon.in/s?k=drip+irrigation+kit",
        "description": "Save up to 70% water. Complete DIY kit for home farms & kitchen gardens.",
    },
    {
        "name": "Organic NPK Fertilizer 5kg",
        "category": "Fertilizer",
        "price": 499.0,
        "image_url": "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMHNlZWRzJTIwcGFja2V0fGVufDB8fHx8MTc3Njk2ODY5OXww&ixlib=rb-4.1.0&q=85",
        "amazon_url": "https://www.amazon.in/s?k=organic+npk+fertilizer",
        "description": "Balanced N-P-K organic fertilizer for all crops. Boosts yield naturally.",
    },
    {
        "name": "Cordless Knapsack Sprayer 16L",
        "category": "Tools",
        "price": 2499.0,
        "image_url": "https://images.pexels.com/photos/35291342/pexels-photo-35291342.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "amazon_url": "https://www.amazon.in/s?k=battery+knapsack+sprayer",
        "description": "Battery-operated backpack sprayer with 16L tank for pesticides & liquid fertilizers.",
    },
]


async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )


async def seed_content():
    if await db.schemes.count_documents({}) == 0:
        docs = [Scheme(**s).model_dump() for s in INITIAL_SCHEMES]
        await db.schemes.insert_many(docs)
    if await db.products.count_documents({}) == 0:
        docs = [Product(**p).model_dump() for p in INITIAL_PRODUCTS]
        await db.products.insert_many(docs)


# ============ Routes ============
@api_router.get("/")
async def root():
    return {"message": "Farmer Helper API is running"}


# ---- Auth ----
@api_router.post("/auth/login", response_model=LoginOut)
async def login(body: LoginIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not an admin account")
    token = create_access_token(user["id"], user["email"])
    return LoginOut(
        token=token,
        user=AdminOut(id=user["id"], email=user["email"], name=user.get("name", "Admin"), role=user["role"]),
    )


@api_router.get("/auth/me", response_model=AdminOut)
async def me(current: dict = Depends(get_current_admin)):
    return AdminOut(id=current["id"], email=current["email"], name=current.get("name", "Admin"), role=current["role"])


# ---- Mandi Bhav (data.gov.in proxy) ----
@api_router.get("/mandi")
async def get_mandi_prices(
    state: Optional[str] = None,
    commodity: Optional[str] = None,
    district: Optional[str] = None,
    market: Optional[str] = None,
    limit: int = 100,
):
    params = {
        "api-key": DATA_GOV_KEY,
        "format": "json",
        "limit": min(max(limit, 1), 500),
    }
    if state:
        params["filters[state.keyword]"] = state
    if commodity:
        params["filters[commodity]"] = commodity
    if district:
        params["filters[district]"] = district
    if market:
        params["filters[market]"] = market

    try:
        r = requests.get(DATA_GOV_URL, params=params, timeout=15)
        r.raise_for_status()
        data = r.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Mandi API error: {str(e)}")

    records = data.get("records", [])
    # Normalise
    normalised = []
    for rec in records:
        normalised.append({
            "state": rec.get("state") or rec.get("State"),
            "district": rec.get("district") or rec.get("District"),
            "market": rec.get("market") or rec.get("Market"),
            "commodity": rec.get("commodity") or rec.get("Commodity"),
            "variety": rec.get("variety") or rec.get("Variety"),
            "grade": rec.get("grade") or rec.get("Grade"),
            "arrival_date": rec.get("arrival_date") or rec.get("Arrival_Date"),
            "min_price": rec.get("min_price") or rec.get("Min_Price") or rec.get("min_x0020_price"),
            "max_price": rec.get("max_price") or rec.get("Max_Price") or rec.get("max_x0020_price"),
            "modal_price": rec.get("modal_price") or rec.get("Modal_Price") or rec.get("modal_x0020_price"),
        })
    return {
        "total": data.get("total", len(normalised)),
        "count": len(normalised),
        "records": normalised,
    }


# ---- Weather (OpenWeather proxy) ----
@api_router.get("/weather")
async def get_weather(lat: float, lon: float, units: str = "metric"):
    try:
        current = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"lat": lat, "lon": lon, "units": units, "appid": OPENWEATHER_KEY},
            timeout=12,
        )
        current.raise_for_status()
        cur = current.json()

        forecast = requests.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            params={"lat": lat, "lon": lon, "units": units, "appid": OPENWEATHER_KEY},
            timeout=12,
        )
        forecast.raise_for_status()
        fc = forecast.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Weather API error: {str(e)}")

    # Build 3-day daily forecast from 3-hourly list (pick entries around 12:00)
    daily = []
    seen_dates = set()
    for item in fc.get("list", []):
        dt_txt = item.get("dt_txt", "")
        date_part = dt_txt.split(" ")[0] if dt_txt else ""
        # pick the midday forecast for each day
        if "12:00:00" in dt_txt and date_part not in seen_dates:
            seen_dates.add(date_part)
            daily.append({
                "date": date_part,
                "temp": item["main"]["temp"],
                "temp_min": item["main"]["temp_min"],
                "temp_max": item["main"]["temp_max"],
                "humidity": item["main"]["humidity"],
                "description": item["weather"][0]["description"] if item.get("weather") else "",
                "icon": item["weather"][0]["icon"] if item.get("weather") else "",
                "main": item["weather"][0]["main"] if item.get("weather") else "",
            })
        if len(daily) >= 3:
            break

    return {
        "location": {
            "name": cur.get("name"),
            "country": cur.get("sys", {}).get("country"),
            "lat": lat,
            "lon": lon,
        },
        "current": {
            "temp": cur["main"]["temp"],
            "feels_like": cur["main"]["feels_like"],
            "humidity": cur["main"]["humidity"],
            "pressure": cur["main"]["pressure"],
            "wind_speed": cur.get("wind", {}).get("speed", 0),
            "description": cur["weather"][0]["description"] if cur.get("weather") else "",
            "main": cur["weather"][0]["main"] if cur.get("weather") else "",
            "icon": cur["weather"][0]["icon"] if cur.get("weather") else "",
        },
        "forecast": daily,
        "units": units,
    }


# ---- Schemes CRUD ----
@api_router.get("/schemes", response_model=List[Scheme])
async def list_schemes():
    items = await db.schemes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/schemes", response_model=Scheme)
async def create_scheme(body: SchemeIn, _: dict = Depends(get_current_admin)):
    scheme = Scheme(**body.model_dump())
    await db.schemes.insert_one(scheme.model_dump())
    return scheme


@api_router.put("/schemes/{scheme_id}", response_model=Scheme)
async def update_scheme(scheme_id: str, body: SchemeIn, _: dict = Depends(get_current_admin)):
    existing = await db.schemes.find_one({"id": scheme_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Scheme not found")
    updated = {**existing, **body.model_dump()}
    await db.schemes.update_one({"id": scheme_id}, {"$set": body.model_dump()})
    return Scheme(**updated)


@api_router.delete("/schemes/{scheme_id}")
async def delete_scheme(scheme_id: str, _: dict = Depends(get_current_admin)):
    result = await db.schemes.delete_one({"id": scheme_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"ok": True}


# ---- Products CRUD ----
@api_router.get("/products", response_model=List[Product])
async def list_products(category: Optional[str] = None):
    query = {"category": category} if category else {}
    items = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.post("/products", response_model=Product)
async def create_product(body: ProductIn, _: dict = Depends(get_current_admin)):
    product = Product(**body.model_dump())
    await db.products.insert_one(product.model_dump())
    return product


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, body: ProductIn, _: dict = Depends(get_current_admin)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    updated = {**existing, **body.model_dump()}
    await db.products.update_one({"id": product_id}, {"$set": body.model_dump()})
    return Product(**updated)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, _: dict = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.schemes.create_index("id", unique=True)
    await db.products.create_index("id", unique=True)
    await seed_admin()
    await seed_content()
    logger.info("Startup: admin seeded, content seeded.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
