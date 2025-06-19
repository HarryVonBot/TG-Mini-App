from fastapi import FastAPI, APIRouter, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from eth_account.messages import encode_defunct
from eth_account import Account
import jwt
from datetime import datetime, timedelta
import pymongo
from bson import ObjectId
import uuid
from typing import List, Optional

# Initialize FastAPI app
app = FastAPI(title="VonVault DeFi API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = pymongo.MongoClient(MONGO_URL)
db = client.vonvault

# Environment variables
TELLER_API_KEY = os.getenv("TELLER_API_KEY", "demo_key")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")

# Membership tier definitions
MEMBERSHIP_TIERS = {
    "club": {
        "name": "Club Member",
        "min_amount": 20000,
        "max_amount": 49999,
        "max_per_investment": 50000,
        "emoji": "🥉",
        "benefits": "Entry-level membership with solid returns"
    },
    "premium": {
        "name": "Premium Member", 
        "min_amount": 50000,
        "max_amount": 99999,
        "max_per_investment": 100000,
        "emoji": "🥈",
        "benefits": "Enhanced returns with flexible lock periods"
    },
    "vip": {
        "name": "VIP Member",
        "min_amount": 100000,
        "max_amount": 249999,
        "max_per_investment": 250000,
        "emoji": "🥇",
        "benefits": "Premium rates with exclusive VIP treatment"
    },
    "elite": {
        "name": "Elite Member",
        "min_amount": 250000,
        "max_amount": None,
        "max_per_investment": 250000,
        "emoji": "💎",
        "benefits": "Highest rates with unlimited investment capacity"
    }
}

# Pydantic Models
class WalletVerification(BaseModel):
    message: str
    signature: str
    address: str

class UserPreferences(BaseModel):
    user_id: str
    theme: str = "dark"
    onboarding_complete: bool = False

class Investment(BaseModel):
    id: str = None
    user_id: str
    name: str
    amount: float
    rate: float
    term: int
    membership_level: str = None
    created_at: str = None

class InvestmentPlan(BaseModel):
    id: str = None
    name: str
    description: str = ""
    membership_level: str
    rate: float  # Annual percentage yield
    term_days: int  # Lock period in days
    min_amount: float  # Minimum investment amount
    max_amount: float  # Maximum investment amount per investment
    is_active: bool = True
    created_at: str = None
    updated_at: str = None

class MembershipStatus(BaseModel):
    level: str
    level_name: str
    emoji: str
    total_invested: float
    current_min: float
    current_max: Optional[float]
    next_level: Optional[str] = None
    next_level_name: Optional[str] = None
    amount_to_next: Optional[float] = None
    available_plans: List[InvestmentPlan] = []

# Utility Functions
def generate_jwt(user_id: str):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

import hashlib
import hmac
import json
from urllib.parse import unquote
from datetime import datetime

def validate_telegram_init_data(init_data: str, bot_token: str) -> dict:
    """
    Validate Telegram WebApp init data
    Returns user data if valid, raises exception if invalid
    """
    try:
        # Parse the init data
        data = {}
        for item in init_data.split('&'):
            if '=' in item:
                key, value = item.split('=', 1)
                data[key] = unquote(value)
        
        # Extract hash from data
        received_hash = data.pop('hash', '')
        
        # Create data check string
        data_check_arr = []
        for key, value in sorted(data.items()):
            data_check_arr.append(f"{key}={value}")
        data_check_string = '\n'.join(data_check_arr)
        
        # Create secret key
        secret_key = hmac.new(
            "WebAppData".encode(),
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verify hash
        if calculated_hash != received_hash:
            raise ValueError("Invalid hash")
        
        # Parse user data
        user_data = json.loads(data.get('user', '{}'))
        return user_data
        
    except Exception as e:
        raise ValueError(f"Invalid Telegram data: {str(e)}")

async def create_or_update_telegram_user(db, telegram_data: dict) -> dict:
    """
    Create or update Telegram user in database with membership support
    """
    telegram_id = telegram_data.get('id')
    if not telegram_id:
        raise ValueError("No Telegram ID provided")
    
    # Check if user exists
    existing_user = db.users.find_one({"telegram_id": telegram_id})
    
    user_data = {
        "telegram_id": telegram_id,
        "telegram_username": telegram_data.get("username", ""),
        "first_name": telegram_data.get("first_name", ""),
        "last_name": telegram_data.get("last_name", ""),
        "language_code": telegram_data.get("language_code", "en"),
        "photo_url": telegram_data.get("photo_url", ""),
        "last_login": datetime.utcnow().isoformat(),
        "auth_type": "telegram"
    }
    
    if existing_user:
        # Update existing user
        db.users.update_one(
            {"telegram_id": telegram_id},
            {"$set": user_data}
        )
        updated_user = db.users.find_one({"telegram_id": telegram_id})
        updated_user["_id"] = str(updated_user["_id"])
        return updated_user
    else:
        # Create new user with default membership status
        user_data.update({
            "id": str(uuid.uuid4()),
            "email": f"telegram_{telegram_id}@vonvault.app",
            "membership_level": "none",  # Start with no membership
            "total_invested": 0.0,
            "created_at": datetime.utcnow().isoformat(),
            "onboarding_complete": False
        })
        
        result = db.users.insert_one(user_data)
        user_data["_id"] = str(result.inserted_id)
        return user_data

def verify_jwt(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def require_auth(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload["user_id"]
    except Exception:
        raise HTTPException(status_code=401, detail="Authorization required")

def calculate_total_investment(user_id: str) -> float:
    """Calculate total investment amount for a user"""
    investments = list(db.investments.find({"user_id": user_id}))
    return sum(inv.get("amount", 0) for inv in investments)

def get_membership_level(total_invested: float) -> str:
    """Determine membership level based on total investment"""
    if total_invested >= MEMBERSHIP_TIERS["elite"]["min_amount"]:
        return "elite"
    elif total_invested >= MEMBERSHIP_TIERS["vip"]["min_amount"]:
        return "vip"
    elif total_invested >= MEMBERSHIP_TIERS["premium"]["min_amount"]:
        return "premium"
    elif total_invested >= MEMBERSHIP_TIERS["club"]["min_amount"]:
        return "club"
    else:
        return "none"

def get_membership_status(user_id: str) -> MembershipStatus:
    """Get detailed membership status for a user"""
    total_invested = calculate_total_investment(user_id)
    current_level = get_membership_level(total_invested)
    
    if current_level == "none":
        return MembershipStatus(
            level="none",
            level_name="Not a Member",
            emoji="📊",
            total_invested=total_invested,
            current_min=MEMBERSHIP_TIERS["club"]["min_amount"],
            current_max=None,
            next_level="club",
            next_level_name=MEMBERSHIP_TIERS["club"]["name"],
            amount_to_next=MEMBERSHIP_TIERS["club"]["min_amount"] - total_invested,
            available_plans=[]
        )
    
    tier_info = MEMBERSHIP_TIERS[current_level]
    
    # Determine next level
    next_level = None
    next_level_name = None
    amount_to_next = None
    
    level_order = ["club", "premium", "vip", "elite"]
    current_index = level_order.index(current_level)
    
    if current_index < len(level_order) - 1:
        next_level = level_order[current_index + 1]
        next_tier = MEMBERSHIP_TIERS[next_level]
        next_level_name = next_tier["name"]
        amount_to_next = next_tier["min_amount"] - total_invested
    
    # Get available investment plans for current level
    available_plans = get_plans_for_membership_level(current_level)
    
    return MembershipStatus(
        level=current_level,
        level_name=tier_info["name"],
        emoji=tier_info["emoji"],
        total_invested=total_invested,
        current_min=tier_info["min_amount"],
        current_max=tier_info.get("max_amount"),
        next_level=next_level,
        next_level_name=next_level_name,
        amount_to_next=amount_to_next,
        available_plans=available_plans
    )

def get_plans_for_membership_level(membership_level: str) -> List[InvestmentPlan]:
    """Get investment plans available for a specific membership level"""
    plans = []
    
    if membership_level == "none":
        return plans
    
    tier_info = MEMBERSHIP_TIERS[membership_level]
    
    if membership_level == "club":
        # Club member only has 365-day option
        plans.append(InvestmentPlan(
            id=f"{membership_level}_365",
            name=f"{tier_info['emoji']} {tier_info['name']} - 1 Year",
            description=f"6% APY locked for 1 year",
            membership_level=membership_level,
            rate=6.0,
            term_days=365,
            min_amount=tier_info["min_amount"],
            max_amount=tier_info["max_per_investment"],
            is_active=True
        ))
    else:
        # Premium, VIP, Elite have both 180 and 365 day options
        rates = {
            "premium": {"180": 8.0, "365": 10.0},
            "vip": {"180": 12.0, "365": 14.0},
            "elite": {"180": 16.0, "365": 20.0}
        }
        
        level_rates = rates[membership_level]
        
        # 180-day plan
        plans.append(InvestmentPlan(
            id=f"{membership_level}_180",
            name=f"{tier_info['emoji']} {tier_info['name']} - 6 Months",
            description=f"{level_rates['180']}% APY locked for 6 months",
            membership_level=membership_level,
            rate=level_rates['180'],
            term_days=180,
            min_amount=tier_info["min_amount"],
            max_amount=tier_info["max_per_investment"],
            is_active=True
        ))
        
        # 365-day plan
        plans.append(InvestmentPlan(
            id=f"{membership_level}_365",
            name=f"{tier_info['emoji']} {tier_info['name']} - 1 Year",
            description=f"{level_rates['365']}% APY locked for 1 year",
            membership_level=membership_level,
            rate=level_rates['365'],
            term_days=365,
            min_amount=tier_info["min_amount"],
            max_amount=tier_info["max_per_investment"],
            is_active=True
        ))
    
    return plans

def init_membership_investment_plans():
    """Initialize membership-based investment plans and clear old ones"""
    # Clear existing plans
    db.investment_plans.delete_many({})
    
    # Create membership-based plans
    all_plans = []
    
    for level in ["club", "premium", "vip", "elite"]:
        plans = get_plans_for_membership_level(level)
        for plan in plans:
            plan_data = {
                "id": plan.id,
                "name": plan.name,
                "description": plan.description,
                "membership_level": plan.membership_level,
                "rate": plan.rate,
                "term_days": plan.term_days,
                "min_amount": plan.min_amount,
                "max_amount": plan.max_amount,
                "is_active": plan.is_active,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            all_plans.append(plan_data)
    
    if all_plans:
        db.investment_plans.insert_many(all_plans)
        print(f"Initialized {len(all_plans)} membership-based investment plans")

# Initialize membership plans on startup
@app.on_event("startup")
async def startup_event():
    init_membership_investment_plans()

# Root endpoint
@app.get("/")
def root():
    return {"message": "VonVault DeFi API - Membership Investment System", "status": "running"}

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Authentication Endpoints
@app.post("/api/auth/telegram")
def telegram_auth(payload: dict):
    """Authenticate user via Telegram WebApp"""
    user_id = payload.get("user_id", str(uuid.uuid4()))
    token = generate_jwt(user_id)
    return {"token": token, "user_id": user_id}

@app.post("/api/auth/telegram/webapp")
async def telegram_webapp_auth(request: dict):
    """Authenticate Telegram WebApp user with validation"""
    try:
        init_data = request.get("initData", "")
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        
        if not bot_token:
            raise HTTPException(status_code=500, detail="Telegram bot token not configured")
        
        # Validate Telegram data
        telegram_user = validate_telegram_init_data(init_data, bot_token)
        
        # Create or update user in database
        user = await create_or_update_telegram_user(db, telegram_user)
        
        # Generate JWT token
        token = generate_jwt(user["id"])
        
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "telegram_id": user["telegram_id"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "username": user.get("telegram_username", ""),
                "auth_type": "telegram"
            },
            "authenticated": True
        }
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Authentication failed")

# Membership Endpoints
@app.get("/api/membership/status")
def get_membership_status_endpoint(authorization: str = Header(...)):
    """Get user's current membership status and available plans"""
    user_id = require_auth(authorization)
    status = get_membership_status(user_id)
    return status

@app.get("/api/membership/tiers")
def get_membership_tiers():
    """Get information about all membership tiers"""
    return {"tiers": MEMBERSHIP_TIERS}

# Investment Plan Endpoints
@app.get("/api/investment-plans")
def get_investment_plans_for_user(authorization: str = Header(...)):
    """Get investment plans available for the current user based on their membership level"""
    user_id = require_auth(authorization)
    membership_status = get_membership_status(user_id)
    
    # Convert plans to dict format for JSON response
    plans_dict = []
    for plan in membership_status.available_plans:
        plan_dict = {
            "id": plan.id,
            "name": plan.name,
            "description": plan.description,
            "membership_level": plan.membership_level,
            "rate": plan.rate,
            "term_days": plan.term_days,
            "min_amount": plan.min_amount,
            "max_amount": plan.max_amount,
            "is_active": plan.is_active,
            "term": plan.term_days // 30  # Backward compatibility
        }
        plans_dict.append(plan_dict)
    
    return {"plans": plans_dict, "membership": membership_status}

@app.get("/api/investment-plans/all")
def get_all_investment_plans():
    """Get all investment plans (for admin purposes)"""
    plans = list(db.investment_plans.find({}))
    for plan in plans:
        plan["_id"] = str(plan["_id"])
        plan["term"] = plan["term_days"] // 30  # Backward compatibility
    return {"plans": plans}

# Wallet Endpoints
@app.post("/api/wallet/verify-signature")
def verify_signature(payload: WalletVerification):
    """Verify Ethereum wallet signature"""
    try:
        msg = encode_defunct(text=payload.message)
        recovered = Account.recover_message(msg, signature=payload.signature)
        is_valid = recovered.lower() == payload.address.lower()
        
        if is_valid:
            token = generate_jwt(payload.address)
            return {
                "valid": True,
                "address": recovered,
                "token": token
            }
        else:
            return {"valid": False, "error": "Invalid signature"}
    except Exception as e:
        return {"valid": False, "error": str(e)}

@app.get("/api/wallet/balance/{address}")
def get_crypto_balance(address: str):
    """Get crypto balance for an address"""
    return {
        "address": address,
        "balances": [
            {"token": "ETH", "balance": "1.234", "usd_value": 2468.50},
            {"token": "USDC", "balance": "1500.00", "usd_value": 1500.00},
            {"token": "WBTC", "balance": "0.05", "usd_value": 3250.00}
        ],
        "total_usd": 7218.50
    }

# Bank Endpoints
@app.get("/api/bank/accounts")
def get_bank_accounts(user_id: str = Header(..., alias="X-User-ID")):
    """Get user's bank accounts via Teller API"""
    try:
        response = requests.get("https://api.teller.io/accounts", headers={"Authorization": f"Basic {TELLER_API_KEY}", "Accept": "application/json"})
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "accounts": [
                    {"id": "acc_1", "name": "Checking Account", "balance": {"available": "5250.00"}},
                    {"id": "acc_2", "name": "Savings Account", "balance": {"available": "12480.00"}}
                ]
            }
    except Exception as e:
        return {"error": str(e), "mock_data": True}

@app.get("/api/bank/balance")
def get_bank_balance(user_id: str = Header(..., alias="X-User-ID")):
    """Get total bank balance"""
    try:
        response = requests.get("https://api.teller.io/accounts", headers={"Authorization": f"Basic {TELLER_API_KEY}", "Accept": "application/json"})
        if response.status_code == 200:
            accounts = response.json()
            return {"accounts": [acc for acc in accounts if "balance" in acc]}
        else:
            return {"total_balance": 17730.00, "accounts": 2}
    except Exception:
        return {"total_balance": 17730.00, "accounts": 2}

# Investment Endpoints
@app.get("/api/investments")
def get_investments(authorization: str = Header(...)):
    """Get user's investments"""
    user_id = require_auth(authorization)
    
    investments = list(db.investments.find({"user_id": user_id}))
    
    for inv in investments:
        inv["_id"] = str(inv["_id"])
    
    return {"investments": investments}

@app.post("/api/investments")
def create_investment(investment: Investment, authorization: str = Header(...)):
    """Create new investment with membership validation"""
    user_id = require_auth(authorization)
    
    # Get current membership status
    membership_status = get_membership_status(user_id)
    
    # Validate investment amount against membership level
    if membership_status.level == "none":
        raise HTTPException(status_code=400, detail="Minimum investment required is $20,000 to become a Club Member")
    
    # Find the specific plan being invested in
    selected_plan = None
    for plan in membership_status.available_plans:
        if (plan.rate == investment.rate and 
            plan.term_days == (investment.term * 30)):  # Convert term back to days
            selected_plan = plan
            break
    
    if not selected_plan:
        raise HTTPException(status_code=400, detail="Invalid investment plan for your membership level")
    
    # Validate investment amount
    if investment.amount < selected_plan.min_amount:
        raise HTTPException(status_code=400, detail=f"Minimum investment for your membership level is ${selected_plan.min_amount:,.0f}")
    
    if investment.amount > selected_plan.max_amount:
        raise HTTPException(status_code=400, detail=f"Maximum investment per transaction is ${selected_plan.max_amount:,.0f}")
    
    investment_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": investment.name,
        "amount": investment.amount,
        "rate": investment.rate,
        "term": investment.term,
        "membership_level": membership_status.level,
        "created_at": datetime.utcnow().isoformat(),
        "status": "active"
    }
    
    result = db.investments.insert_one(investment_data)
    investment_data["_id"] = str(result.inserted_id)
    
    return {"investment": investment_data, "message": "Investment created successfully"}

# Profile Endpoints
@app.post("/api/profile")
def save_preferences(prefs: UserPreferences, authorization: str = Header(...)):
    """Save user preferences"""
    user_id = require_auth(authorization)
    
    pref_data = {
        "user_id": user_id,
        "theme": prefs.theme,
        "onboarding_complete": prefs.onboarding_complete,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    db.user_preferences.update_one(
        {"user_id": user_id},
        {"$set": pref_data},
        upsert=True
    )
    
    return {"status": "saved", "preferences": pref_data}

@app.get("/api/profile/{user_id}")
def get_preferences(user_id: str, authorization: str = Header(...)):
    """Get user preferences"""
    auth_user_id = require_auth(authorization)
    
    if auth_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    preferences = db.user_preferences.find_one({"user_id": user_id})
    
    if preferences:
        preferences["_id"] = str(preferences["_id"])
        return preferences
    else:
        return {"user_id": user_id, "theme": "dark", "onboarding_complete": False}

# Crypto Price Endpoints
@app.get("/api/prices")
def get_crypto_prices():
    """Get current crypto prices"""
    try:
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            "ids": "ethereum,bitcoin,usd-coin,chainlink,uniswap",
            "vs_currencies": "usd",
            "include_24hr_change": "true"
        }
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "ethereum": {"usd": 2000.50, "usd_24h_change": 2.3},
                "bitcoin": {"usd": 65000.25, "usd_24h_change": -1.5},
                "usd-coin": {"usd": 1.00, "usd_24h_change": 0.01}
            }
    except Exception as e:
        return {"error": "Unable to fetch prices", "message": str(e)}

# Portfolio Endpoints
@app.get("/api/portfolio")
def get_portfolio(authorization: str = Header(...)):
    """Get user's complete portfolio with membership information"""
    user_id = require_auth(authorization)
    
    # Get membership status
    membership_status = get_membership_status(user_id)
    
    # Get investments
    investments = list(db.investments.find({"user_id": user_id}))
    total_invested = sum(inv.get("amount", 0) for inv in investments)
    
    # Mock crypto balance (will be real API later)
    crypto_balance = 7218.50
    
    # Mock bank balance
    bank_balance = 17730.00
    
    return {
        "user_id": user_id,
        "membership": membership_status,
        "total_portfolio": total_invested + crypto_balance + bank_balance,
        "investments": {
            "total": total_invested,
            "count": len(investments)
        },
        "crypto": {
            "total": crypto_balance
        },
        "bank": {
            "total": bank_balance
        },
        "breakdown": {
            "investments_percentage": (total_invested / (total_invested + crypto_balance + bank_balance)) * 100 if total_invested > 0 else 0,
            "crypto_percentage": (crypto_balance / (total_invested + crypto_balance + bank_balance)) * 100,
            "cash_percentage": (bank_balance / (total_invested + crypto_balance + bank_balance)) * 100
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)