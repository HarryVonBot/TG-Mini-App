#!/usr/bin/env python3
import requests
import json
import jwt
import time
import uuid
import hmac
import hashlib
from urllib.parse import quote
from datetime import datetime, timedelta

# Configuration
BACKEND_URL = "https://vonvault-backend.onrender.com"
API_BASE = f"{BACKEND_URL}/api"
JWT_SECRET = "your-secret-key"  # Same as in server.py
TELEGRAM_BOT_TOKEN = "7100184573:AAGaQbQNMXk62tGZdKXWmUwqqm9WyhtS9z0"  # From review request

# Test results tracking
test_results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}

# Helper functions
def generate_test_jwt(user_id="test_admin"):
    """Generate a JWT token for testing"""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def generate_telegram_init_data(user_id=12345678, username="test_user", first_name="Test", last_name="User"):
    """Generate Telegram WebApp init data for testing"""
    # Create user data
    user_data = {
        "id": user_id,
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "language_code": "en"
    }
    
    # Create init data parameters
    init_params = {
        "query_id": "AAHdF6IQAAAAAN0XohDhrOan",
        "user": json.dumps(user_data),
        "auth_date": str(int(time.time()))
    }
    
    # Sort parameters
    sorted_params = sorted(init_params.items())
    
    # Create data check string
    data_check_arr = []
    for key, value in sorted_params:
        data_check_arr.append(f"{key}={value}")
    data_check_string = '\n'.join(data_check_arr)
    
    # Create secret key
    secret_key = hmac.new(
        "WebAppData".encode(),
        TELEGRAM_BOT_TOKEN.encode(),
        hashlib.sha256
    ).digest()
    
    # Calculate hash
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Add hash to parameters
    init_params["hash"] = calculated_hash
    
    # Convert to URL parameters
    init_data = "&".join([f"{key}={quote(value)}" for key, value in init_params.items()])
    
    return init_data

def log_test(name, passed, details=""):
    """Log test results"""
    test_results["total"] += 1
    if passed:
        test_results["passed"] += 1
        status = "PASSED"
    else:
        test_results["failed"] += 1
        status = "FAILED"
    
    test_results["tests"].append({
        "name": name,
        "status": status,
        "details": details
    })
    
    print(f"[{status}] {name}")
    if details:
        print(f"  Details: {details}")

def print_summary():
    """Print test summary"""
    print("\n===== TEST SUMMARY =====")
    print(f"Total tests: {test_results['total']}")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    
    if test_results["failed"] > 0:
        print("\nFailed tests:")
        for test in test_results["tests"]:
            if test["status"] == "FAILED":
                print(f"- {test['name']}: {test['details']}")

# Test functions
def test_health_check():
    """Test the health check endpoint"""
    response = requests.get(f"{API_BASE}/health")
    
    if response.status_code == 200 and response.json().get("status") == "healthy":
        log_test("Health Check Endpoint", True)
    else:
        log_test("Health Check Endpoint", False, f"Status code: {response.status_code}, Response: {response.text}")

# Membership Tier Tests
def test_membership_tiers_api():
    """Test the membership tiers API endpoint"""
    response = requests.get(f"{API_BASE}/membership/tiers")
    
    if response.status_code != 200:
        log_test("Membership Tiers API", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    data = response.json()
    tiers = data.get("tiers", {})
    
    # Check if all expected tiers are present
    expected_tiers = ["club", "premium", "vip", "elite"]
    if all(tier in tiers for tier in expected_tiers):
        log_test("Membership Tiers API - Tier Names", True, f"All expected tiers found: {', '.join(expected_tiers)}")
    else:
        log_test("Membership Tiers API - Tier Names", False, f"Not all expected tiers found. Expected: {expected_tiers}, Got: {list(tiers.keys())}")
        return
    
    # Verify tier ranges
    tier_ranges_correct = (
        tiers["club"]["min_amount"] == 20000 and tiers["club"]["max_amount"] == 49999 and
        tiers["premium"]["min_amount"] == 50000 and tiers["premium"]["max_amount"] == 99999 and
        tiers["vip"]["min_amount"] == 100000 and tiers["vip"]["max_amount"] == 249999 and
        tiers["elite"]["min_amount"] == 250000 and tiers["elite"]["max_amount"] is None
    )
    
    if tier_ranges_correct:
        log_test("Membership Tiers API - Tier Ranges", True, "All tier ranges are correct")
    else:
        log_test("Membership Tiers API - Tier Ranges", False, "Tier ranges do not match expected values")
    
    # Verify investment limits
    investment_limits_correct = (
        tiers["club"]["max_per_investment"] == 50000 and
        tiers["premium"]["max_per_investment"] == 100000 and
        tiers["vip"]["max_per_investment"] == 250000 and
        tiers["elite"]["max_per_investment"] == 250000
    )
    
    if investment_limits_correct:
        log_test("Membership Tiers API - Investment Limits", True, "All investment limits are correct")
    else:
        log_test("Membership Tiers API - Investment Limits", False, "Investment limits do not match expected values")

def test_membership_status_api():
    """Test the membership status API endpoint"""
    # Create a user with investments to test membership status
    user_id = f"test_user_{uuid.uuid4()}"
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test with no investments (should be "none" level)
    response = requests.get(f"{API_BASE}/membership/status", headers=headers)
    
    if response.status_code != 200:
        log_test("Membership Status API - No Investments", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    data = response.json()
    if data.get("level") == "none" and data.get("level_name") == "Not a Member":
        log_test("Membership Status API - No Investments", True, "Correctly identified as not a member")
    else:
        log_test("Membership Status API - No Investments", False, f"Expected level 'none', got '{data.get('level')}'")
    
    # Create investments to reach Club level
    investment_data = {
        "user_id": user_id,
        "name": "Test Investment",
        "amount": 25000,
        "rate": 6.0,
        "term": 12  # 12 months (365 days)
    }
    
    create_response = requests.post(f"{API_BASE}/investments", json=investment_data, headers=headers)
    if create_response.status_code != 200:
        log_test("Membership Status API - Club Level", False, f"Failed to create test investment: {create_response.text}")
        return
    
    # Check membership status again (should be "club" level)
    response = requests.get(f"{API_BASE}/membership/status", headers=headers)
    
    if response.status_code != 200:
        log_test("Membership Status API - Club Level", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    data = response.json()
    if data.get("level") == "club" and data.get("level_name") == "Club Member":
        log_test("Membership Status API - Club Level", True, "Correctly identified as Club member")
    else:
        log_test("Membership Status API - Club Level", False, f"Expected level 'club', got '{data.get('level')}'")
    
    # Create more investments to reach Premium level
    investment_data = {
        "user_id": user_id,
        "name": "Test Investment 2",
        "amount": 30000,
        "rate": 6.0,
        "term": 12  # 12 months (365 days)
    }
    
    create_response = requests.post(f"{API_BASE}/investments", json=investment_data, headers=headers)
    if create_response.status_code != 200:
        log_test("Membership Status API - Premium Level", False, f"Failed to create test investment: {create_response.text}")
        return
    
    # Check membership status again (should be "premium" level)
    response = requests.get(f"{API_BASE}/membership/status", headers=headers)
    
    if response.status_code != 200:
        log_test("Membership Status API - Premium Level", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    data = response.json()
    if data.get("level") == "premium" and data.get("level_name") == "Premium Member":
        log_test("Membership Status API - Premium Level", True, "Correctly identified as Premium member")
    else:
        log_test("Membership Status API - Premium Level", False, f"Expected level 'premium', got '{data.get('level')}'")
    
    # Check available plans for Premium level
    available_plans = data.get("available_plans", [])
    if len(available_plans) == 2:  # Premium should have 180-day and 365-day plans
        plan_terms = sorted([plan.get("term_days") for plan in available_plans])
        if plan_terms == [180, 365]:
            log_test("Membership Status API - Premium Plans", True, "Premium member has correct available plans")
        else:
            log_test("Membership Status API - Premium Plans", False, f"Expected plans with terms [180, 365], got {plan_terms}")
    else:
        log_test("Membership Status API - Premium Plans", False, f"Expected 2 available plans, got {len(available_plans)}")

def test_dynamic_investment_plans():
    """Test the dynamic investment plans based on membership level"""
    # Create users with different membership levels
    user_ids = {
        "club": f"club_user_{uuid.uuid4()}",
        "premium": f"premium_user_{uuid.uuid4()}",
        "vip": f"vip_user_{uuid.uuid4()}",
        "elite": f"elite_user_{uuid.uuid4()}"
    }
    
    tokens = {level: generate_test_jwt(user_id) for level, user_id in user_ids.items()}
    
    # Create investments to reach each membership level
    investment_amounts = {
        "club": 25000,
        "premium": 60000,
        "vip": 150000,
        "elite": 300000
    }
    
    for level, user_id in user_ids.items():
        headers = {"Authorization": f"Bearer {tokens[level]}"}
        
        investment_data = {
            "user_id": user_id,
            "name": f"Test {level.capitalize()} Investment",
            "amount": investment_amounts[level],
            "rate": 6.0,
            "term": 12  # 12 months (365 days)
        }
        
        create_response = requests.post(f"{API_BASE}/investments", json=investment_data, headers=headers)
        if create_response.status_code != 200:
            log_test(f"Dynamic Investment Plans - {level.capitalize()} Setup", False, f"Failed to create test investment: {create_response.text}")
            continue
        
        # Get investment plans for this user
        response = requests.get(f"{API_BASE}/investment-plans", headers=headers)
        
        if response.status_code != 200:
            log_test(f"Dynamic Investment Plans - {level.capitalize()} Plans", False, f"Status code: {response.status_code}, Response: {response.text}")
            continue
        
        data = response.json()
        plans = data.get("plans", [])
        
        # Verify the correct number of plans
        expected_plan_count = 1 if level == "club" else 2
        if len(plans) == expected_plan_count:
            log_test(f"Dynamic Investment Plans - {level.capitalize()} Plan Count", True, f"Found {len(plans)} plans as expected")
        else:
            log_test(f"Dynamic Investment Plans - {level.capitalize()} Plan Count", False, f"Expected {expected_plan_count} plans, got {len(plans)}")
            continue
        
        # Verify APY rates
        expected_rates = {
            "club": {"365": 6.0},
            "premium": {"180": 8.0, "365": 10.0},
            "vip": {"180": 12.0, "365": 14.0},
            "elite": {"180": 16.0, "365": 20.0}
        }
        
        rates_correct = True
        for plan in plans:
            term_days = plan.get("term_days")
            term_key = str(term_days)
            if term_key not in expected_rates[level]:
                rates_correct = False
                break
            
            if plan.get("rate") != expected_rates[level][term_key]:
                rates_correct = False
                break
        
        if rates_correct:
            log_test(f"Dynamic Investment Plans - {level.capitalize()} APY Rates", True, f"APY rates match expected values")
        else:
            log_test(f"Dynamic Investment Plans - {level.capitalize()} APY Rates", False, f"APY rates do not match expected values")
        
        # Verify membership level in plans
        if all(plan.get("membership_level") == level for plan in plans):
            log_test(f"Dynamic Investment Plans - {level.capitalize()} Membership Level", True, "All plans have correct membership level")
        else:
            log_test(f"Dynamic Investment Plans - {level.capitalize()} Membership Level", False, "Not all plans have correct membership level")

def test_investment_creation_with_membership_validation():
    """Test creating investments with membership validation"""
    # Create a user with Club level membership
    user_id = f"validation_user_{uuid.uuid4()}"
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # First investment to reach Club level
    initial_investment = {
        "user_id": user_id,
        "name": "Initial Club Investment",
        "amount": 25000,
        "rate": 6.0,
        "term": 12  # 12 months (365 days)
    }
    
    create_response = requests.post(f"{API_BASE}/investments", json=initial_investment, headers=headers)
    if create_response.status_code != 200:
        log_test("Investment Creation Validation - Setup", False, f"Failed to create initial investment: {create_response.text}")
        return
    
    # Test minimum amount validation
    below_min_investment = {
        "user_id": user_id,
        "name": "Below Minimum Investment",
        "amount": 15000,  # Below Club minimum of 20000
        "rate": 6.0,
        "term": 12
    }
    
    response = requests.post(f"{API_BASE}/investments", json=below_min_investment, headers=headers)
    if response.status_code == 400 and "minimum investment" in response.text.lower():
        log_test("Investment Creation Validation - Minimum Amount", True, "Correctly rejected investment below minimum amount")
    else:
        log_test("Investment Creation Validation - Minimum Amount", False, f"Expected 400 error for below minimum amount, got {response.status_code}: {response.text}")
    
    # Test maximum amount validation
    above_max_investment = {
        "user_id": user_id,
        "name": "Above Maximum Investment",
        "amount": 60000,  # Above Club maximum per investment of 50000
        "rate": 6.0,
        "term": 12
    }
    
    response = requests.post(f"{API_BASE}/investments", json=above_max_investment, headers=headers)
    if response.status_code == 400 and "maximum investment" in response.text.lower():
        log_test("Investment Creation Validation - Maximum Amount", True, "Correctly rejected investment above maximum amount")
    else:
        log_test("Investment Creation Validation - Maximum Amount", False, f"Expected 400 error for above maximum amount, got {response.status_code}: {response.text}")
    
    # Test valid investment within limits
    valid_investment = {
        "user_id": user_id,
        "name": "Valid Club Investment",
        "amount": 30000,
        "rate": 6.0,
        "term": 12
    }
    
    response = requests.post(f"{API_BASE}/investments", json=valid_investment, headers=headers)
    if response.status_code == 200:
        investment = response.json().get("investment", {})
        if investment.get("membership_level") == "club":
            log_test("Investment Creation Validation - Valid Investment", True, "Successfully created valid investment with correct membership level")
        else:
            log_test("Investment Creation Validation - Valid Investment", False, f"Investment created but with wrong membership level: {investment.get('membership_level')}")
    else:
        log_test("Investment Creation Validation - Valid Investment", False, f"Failed to create valid investment: {response.text}")
    
    # Test tier boundary (create more investments to reach Premium level)
    boundary_investment = {
        "user_id": user_id,
        "name": "Boundary Investment",
        "amount": 20000,  # This should push total to 75000 (Premium level)
        "rate": 6.0,
        "term": 12
    }
    
    response = requests.post(f"{API_BASE}/investments", json=boundary_investment, headers=headers)
    if response.status_code != 200:
        log_test("Investment Creation Validation - Tier Boundary", False, f"Failed to create boundary investment: {response.text}")
        return
    
    # Check membership status (should now be Premium)
    status_response = requests.get(f"{API_BASE}/membership/status", headers=headers)
    if status_response.status_code == 200:
        status = status_response.json()
        if status.get("level") == "premium":
            log_test("Investment Creation Validation - Tier Boundary", True, "Successfully upgraded to Premium level after boundary investment")
        else:
            log_test("Investment Creation Validation - Tier Boundary", False, f"Expected Premium level after boundary investment, got {status.get('level')}")
    else:
        log_test("Investment Creation Validation - Tier Boundary", False, f"Failed to get membership status after boundary investment: {status_response.text}")

def test_portfolio_integration():
    """Test portfolio integration with membership information"""
    # Create a user with investments
    user_id = f"portfolio_user_{uuid.uuid4()}"
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create an investment
    investment_data = {
        "user_id": user_id,
        "name": "Portfolio Test Investment",
        "amount": 25000,
        "rate": 6.0,
        "term": 12
    }
    
    create_response = requests.post(f"{API_BASE}/investments", json=investment_data, headers=headers)
    if create_response.status_code != 200:
        log_test("Portfolio Integration - Setup", False, f"Failed to create test investment: {create_response.text}")
        return
    
    # Get portfolio
    response = requests.get(f"{API_BASE}/portfolio", headers=headers)
    
    if response.status_code != 200:
        log_test("Portfolio Integration - Get Portfolio", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    portfolio = response.json()
    
    # Check if membership information is included
    if "membership" in portfolio:
        membership = portfolio.get("membership", {})
        if membership.get("level") == "club" and membership.get("level_name") == "Club Member":
            log_test("Portfolio Integration - Membership Info", True, "Portfolio includes correct membership information")
        else:
            log_test("Portfolio Integration - Membership Info", False, f"Portfolio has incorrect membership information: {membership}")
    else:
        log_test("Portfolio Integration - Membership Info", False, "Portfolio does not include membership information")
    
    # Check if total investment calculation is correct
    if "investments" in portfolio:
        investments = portfolio.get("investments", {})
        if investments.get("total") == 25000:
            log_test("Portfolio Integration - Investment Total", True, "Portfolio has correct total investment amount")
        else:
            log_test("Portfolio Integration - Investment Total", False, f"Portfolio has incorrect total investment amount: {investments.get('total')}")
    else:
        log_test("Portfolio Integration - Investment Total", False, "Portfolio does not include investments information")
    
    # Create another investment to test membership level change
    second_investment = {
        "user_id": user_id,
        "name": "Second Portfolio Investment",
        "amount": 30000,
        "rate": 6.0,
        "term": 12
    }
    
    create_response = requests.post(f"{API_BASE}/investments", json=second_investment, headers=headers)
    if create_response.status_code != 200:
        log_test("Portfolio Integration - Level Change", False, f"Failed to create second investment: {create_response.text}")
        return
    
    # Get portfolio again
    response = requests.get(f"{API_BASE}/portfolio", headers=headers)
    
    if response.status_code != 200:
        log_test("Portfolio Integration - Level Change", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    portfolio = response.json()
    
    # Check if membership level changed
    if "membership" in portfolio:
        membership = portfolio.get("membership", {})
        if membership.get("level") == "premium" and membership.get("level_name") == "Premium Member":
            log_test("Portfolio Integration - Level Change", True, "Membership level correctly updated to Premium after second investment")
        else:
            log_test("Portfolio Integration - Level Change", False, f"Expected Premium level after second investment, got {membership.get('level')}")
    else:
        log_test("Portfolio Integration - Level Change", False, "Portfolio does not include membership information after second investment")

def test_investment_limits():
    """Test investment limits for different membership levels"""
    # Create users for each membership level
    user_ids = {
        "club": f"limits_club_{uuid.uuid4()}",
        "premium": f"limits_premium_{uuid.uuid4()}",
        "vip": f"limits_vip_{uuid.uuid4()}",
        "elite": f"limits_elite_{uuid.uuid4()}"
    }
    
    tokens = {level: generate_test_jwt(user_id) for level, user_id in user_ids.items()}
    
    # Initial investments to reach each membership level
    initial_investments = {
        "club": 25000,
        "premium": 60000,
        "vip": 150000,
        "elite": 300000
    }
    
    for level, user_id in user_ids.items():
        headers = {"Authorization": f"Bearer {tokens[level]}"}
        
        # Create initial investment to reach membership level
        investment_data = {
            "user_id": user_id,
            "name": f"Initial {level.capitalize()} Investment",
            "amount": initial_investments[level],
            "rate": 6.0 if level == "club" else 10.0,  # Club only has 6% rate
            "term": 12
        }
        
        create_response = requests.post(f"{API_BASE}/investments", json=investment_data, headers=headers)
        if create_response.status_code != 200:
            log_test(f"Investment Limits - {level.capitalize()} Setup", False, f"Failed to create initial investment: {create_response.text}")
            continue
        
        # Test per-transaction limits
        max_per_transaction = {
            "club": 50000,
            "premium": 100000,
            "vip": 250000,
            "elite": 250000
        }
        
        # Test valid transaction at max limit
        max_investment = {
            "user_id": user_id,
            "name": f"Max {level.capitalize()} Investment",
            "amount": max_per_transaction[level],
            "rate": 6.0 if level == "club" else 10.0,
            "term": 12
        }
        
        response = requests.post(f"{API_BASE}/investments", json=max_investment, headers=headers)
        if response.status_code == 200:
            log_test(f"Investment Limits - {level.capitalize()} Max Transaction", True, f"Successfully created investment at max limit of {max_per_transaction[level]}")
        else:
            log_test(f"Investment Limits - {level.capitalize()} Max Transaction", False, f"Failed to create investment at max limit: {response.text}")
        
        # Test transaction above limit
        above_max = {
            "user_id": user_id,
            "name": f"Above Max {level.capitalize()} Investment",
            "amount": max_per_transaction[level] + 1000,
            "rate": 6.0 if level == "club" else 10.0,
            "term": 12
        }
        
        response = requests.post(f"{API_BASE}/investments", json=above_max, headers=headers)
        if response.status_code == 400 and "maximum investment" in response.text.lower():
            log_test(f"Investment Limits - {level.capitalize()} Above Max", True, "Correctly rejected investment above maximum limit")
        else:
            log_test(f"Investment Limits - {level.capitalize()} Above Max", False, f"Expected 400 error for above maximum limit, got {response.status_code}: {response.text}")
    
    # Special test for Elite member multiple investments
    elite_headers = {"Authorization": f"Bearer {tokens['elite']}"}
    
    # Elite members should be able to make multiple max investments
    for i in range(2):
        elite_investment = {
            "user_id": user_id,
            "name": f"Elite Multiple Investment {i+1}",
            "amount": 250000,
            "rate": 20.0,
            "term": 12
        }
        
        response = requests.post(f"{API_BASE}/investments", json=elite_investment, headers=elite_headers)
        if response.status_code == 200:
            log_test(f"Investment Limits - Elite Multiple {i+1}", True, "Successfully created multiple max investments for Elite member")
        else:
            log_test(f"Investment Limits - Elite Multiple {i+1}", False, f"Failed to create multiple max investment for Elite member: {response.text}")

def test_get_investment_plans_default():
    """Test fetching investment plans with default active_only=true"""
    token = generate_test_jwt()
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{API_BASE}/investment-plans", headers=headers)
    
    if response.status_code != 200:
        log_test("GET Investment Plans (Default)", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    data = response.json()
    plans = data.get("plans", [])
    
    # Check if we have plans and they're all active
    if len(plans) > 0 and all(plan.get("is_active", False) for plan in plans):
        log_test("GET Investment Plans (Default)", True, f"Found {len(plans)} active plans")
    else:
        log_test("GET Investment Plans (Default)", False, f"Expected active plans, got {len(plans)} plans with some inactive")

def test_get_investment_plans_all():
    """Test fetching all investment plans with active_only=false"""
    response = requests.get(f"{API_BASE}/investment-plans/all")
    
    if response.status_code != 200:
        log_test("GET Investment Plans (All)", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    data = response.json()
    plans = data.get("plans", [])
    
    # Check if we have plans
    if len(plans) > 0:
        log_test("GET Investment Plans (All)", True, f"Found {len(plans)} total plans")
    else:
        log_test("GET Investment Plans (All)", False, "No plans found")

def test_term_days_conversion():
    """Test the conversion between term_days and term (months)"""
    response = requests.get(f"{API_BASE}/investment-plans/all")
    
    if response.status_code != 200:
        log_test("Term Days Conversion", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    data = response.json()
    plans = data.get("plans", [])
    
    # Check if all plans have both term_days and term
    conversion_correct = True
    for plan in plans:
        if "term_days" not in plan or "term" not in plan:
            conversion_correct = False
            break
        
        # Check if term is approximately term_days / 30
        expected_term = plan["term_days"] // 30
        if plan["term"] != expected_term:
            conversion_correct = False
            break
    
    if conversion_correct:
        log_test("Term Days Conversion", True, "Term days correctly converted to months")
    else:
        log_test("Term Days Conversion", False, "Term days not correctly converted to months")

def test_create_investment_plan():
    """Test creating a new investment plan"""
    log_test("Create Investment Plan", False, "POST /api/investment-plans endpoint not implemented")
    return  # Skip this test

def test_update_investment_plan():
    """Test updating an existing investment plan"""
    log_test("Update Investment Plan", False, "PUT /api/investment-plans/{plan_id} endpoint not implemented")
    return  # Skip this test

def test_delete_investment_plan():
    """Test deactivating an investment plan"""
    log_test("Delete Investment Plan", False, "DELETE /api/investment-plans/{plan_id} endpoint not implemented")
    return  # Skip this test

# Telegram Integration Tests
def test_telegram_webapp_auth():
    """Test Telegram WebApp authentication"""
    # Generate Telegram init data
    init_data = generate_telegram_init_data()
    
    # Send authentication request
    payload = {"initData": init_data}
    response = requests.post(f"{API_BASE}/auth/telegram/webapp", json=payload)
    
    if response.status_code != 200:
        log_test("Telegram WebApp Authentication", False, f"Status code: {response.status_code}, Response: {response.text}")
        return
    
    data = response.json()
    
    # Check if authentication was successful
    if data.get("authenticated") and data.get("token") and data.get("user"):
        user = data.get("user", {})
        if user.get("telegram_id") and user.get("auth_type") == "telegram":
            log_test("Telegram WebApp Authentication", True, "Successfully authenticated with Telegram WebApp")
        else:
            log_test("Telegram WebApp Authentication", False, "Authentication response missing user details")
    else:
        log_test("Telegram WebApp Authentication", False, f"Authentication failed: {data}")

def test_telegram_webapp_auth_invalid():
    """Test Telegram WebApp authentication with invalid data"""
    # Send authentication request with invalid init data
    payload = {"initData": "invalid_data"}
    response = requests.post(f"{API_BASE}/auth/telegram/webapp", json=payload)
    
    # Should return 401 Unauthorized
    if response.status_code == 401:
        log_test("Telegram WebApp Authentication - Invalid Data", True, "Correctly rejected invalid Telegram data")
    else:
        log_test("Telegram WebApp Authentication - Invalid Data", False, f"Expected 401 error, got {response.status_code}: {response.text}")

# MongoDB Connection Test
def test_mongodb_connection():
    """Test MongoDB Atlas connection by creating and retrieving data"""
    # Create a unique user ID for this test
    user_id = f"mongo_test_{uuid.uuid4()}"
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a test investment
    investment_data = {
        "user_id": user_id,
        "name": "MongoDB Test Investment",
        "amount": 25000,
        "rate": 6.0,
        "term": 12
    }
    
    create_response = requests.post(f"{API_BASE}/investments", json=investment_data, headers=headers)
    if create_response.status_code != 200:
        log_test("MongoDB Connection", False, f"Failed to create test investment: {create_response.text}")
        return
    
    # Get the created investment
    response = requests.get(f"{API_BASE}/investments", headers=headers)
    
    if response.status_code != 200:
        log_test("MongoDB Connection", False, f"Failed to retrieve investments: {response.text}")
        return
    
    data = response.json()
    investments = data.get("investments", [])
    
    # Check if the investment was stored and retrieved correctly
    if len(investments) > 0 and any(inv.get("name") == "MongoDB Test Investment" for inv in investments):
        log_test("MongoDB Connection", True, "Successfully created and retrieved data from MongoDB")
    else:
        log_test("MongoDB Connection", False, "Failed to retrieve the created investment from MongoDB")

# CORS Configuration Test
def test_cors_configuration():
    """Test CORS configuration"""
    headers = {
        "Origin": "https://vonartis.app",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Authorization"
    }
    
    # Send preflight request
    response = requests.options(f"{API_BASE}/health", headers=headers)
    
    # Check if CORS headers are present
    if response.status_code == 200 and "access-control-allow-origin" in response.headers:
        cors_origin = response.headers.get("access-control-allow-origin")
        if cors_origin == "*" or cors_origin == "https://vonartis.app":
            log_test("CORS Configuration", True, f"CORS is properly configured with Access-Control-Allow-Origin: {cors_origin}")
        else:
            log_test("CORS Configuration", False, f"CORS origin is not properly configured: {cors_origin}")
    else:
        log_test("CORS Configuration", False, f"CORS headers not found in response: {response.headers}")

# JWT Authentication Test
def test_jwt_authentication():
    """Test JWT authentication"""
    # Test with valid token
    user_id = f"jwt_test_{uuid.uuid4()}"
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{API_BASE}/membership/status", headers=headers)
    
    if response.status_code == 200:
        log_test("JWT Authentication - Valid Token", True, "Successfully authenticated with valid JWT token")
    else:
        log_test("JWT Authentication - Valid Token", False, f"Failed to authenticate with valid token: {response.text}")
    
    # Test with invalid token
    headers = {"Authorization": "Bearer invalid_token"}
    response = requests.get(f"{API_BASE}/membership/status", headers=headers)
    
    if response.status_code == 401:
        log_test("JWT Authentication - Invalid Token", True, "Correctly rejected invalid JWT token")
    else:
        log_test("JWT Authentication - Invalid Token", False, f"Expected 401 error, got {response.status_code}: {response.text}")
    
    # Test with expired token
    expired_payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() - timedelta(hours=1)  # Expired 1 hour ago
    }
    expired_token = jwt.encode(expired_payload, JWT_SECRET, algorithm="HS256")
    headers = {"Authorization": f"Bearer {expired_token}"}
    
    response = requests.get(f"{API_BASE}/membership/status", headers=headers)
    
    if response.status_code == 401:
        log_test("JWT Authentication - Expired Token", True, "Correctly rejected expired JWT token")
    else:
        log_test("JWT Authentication - Expired Token", False, f"Expected 401 error, got {response.status_code}: {response.text}")

# API Rate Limiting and Performance Test
def test_api_performance():
    """Test API rate limiting and performance"""
    start_time = time.time()
    
    # Make 10 requests in quick succession
    success_count = 0
    for i in range(10):
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            success_count += 1
    
    end_time = time.time()
    total_time = end_time - start_time
    avg_time = total_time / 10
    
    if success_count == 10:
        log_test("API Performance", True, f"Successfully made 10 requests in {total_time:.2f}s (avg: {avg_time:.2f}s per request)")
    else:
        log_test("API Performance", False, f"Only {success_count}/10 requests succeeded in {total_time:.2f}s")

# Error Handling Test
def test_error_handling():
    """Test error handling and responses"""
    # Test 404 Not Found
    response = requests.get(f"{API_BASE}/nonexistent_endpoint")
    
    if response.status_code == 404:
        log_test("Error Handling - 404 Not Found", True, "Correctly returned 404 for nonexistent endpoint")
    else:
        log_test("Error Handling - 404 Not Found", False, f"Expected 404 error, got {response.status_code}: {response.text}")
    
    # Test 422 Validation Error
    user_id = f"error_test_{uuid.uuid4()}"
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Invalid investment data (missing required fields)
    invalid_data = {"user_id": user_id}
    response = requests.post(f"{API_BASE}/investments", json=invalid_data, headers=headers)
    
    if response.status_code == 422:  # FastAPI returns 422 for validation errors
        log_test("Error Handling - 422 Validation Error", True, "Correctly returned 422 for invalid request data")
    else:
        log_test("Error Handling - 422 Validation Error", False, f"Expected 422 error, got {response.status_code}: {response.text}")

def run_all_tests():
    """Run all test functions"""
    print("===== STARTING VONVAULT DEFI API TESTS =====")
    
    # Basic health check
    test_health_check()
    
    # Membership Tier Tests
    test_membership_tiers_api()
    
    # Get a valid token using Telegram authentication
    print("\nAttempting to get a valid authentication token via Telegram...")
    init_data = generate_telegram_init_data()
    payload = {"initData": init_data}
    auth_response = requests.post(f"{API_BASE}/auth/telegram/webapp", json=payload)
    
    if auth_response.status_code == 200:
        auth_data = auth_response.json()
        valid_token = auth_data.get("token")
        user_id = auth_data.get("user", {}).get("id")
        print(f"Successfully obtained token for user ID: {user_id}")
        
        # Use this token for all subsequent tests
        valid_headers = {"Authorization": f"Bearer {valid_token}"}
        
        # Test GET /api/membership/status with valid token
        response = requests.get(f"{API_BASE}/membership/status", headers=valid_headers)
        if response.status_code == 200:
            log_test("Membership Status API with Valid Token", True, "Successfully retrieved membership status with valid token")
            membership_data = response.json()
            print(f"Current membership level: {membership_data.get('level_name')}")
        else:
            log_test("Membership Status API with Valid Token", False, f"Failed to retrieve membership status: {response.text}")
        
        # Test GET /api/investment-plans with valid token
        response = requests.get(f"{API_BASE}/investment-plans", headers=valid_headers)
        if response.status_code == 200:
            log_test("Investment Plans API with Valid Token", True, "Successfully retrieved investment plans with valid token")
            plans_data = response.json()
            plans = plans_data.get("plans", [])
            print(f"Available plans: {len(plans)}")
        else:
            log_test("Investment Plans API with Valid Token", False, f"Failed to retrieve investment plans: {response.text}")
        
        # Test GET /api/portfolio with valid token
        response = requests.get(f"{API_BASE}/portfolio", headers=valid_headers)
        if response.status_code == 200:
            log_test("Portfolio API with Valid Token", True, "Successfully retrieved portfolio with valid token")
            portfolio_data = response.json()
            print(f"Total portfolio value: ${portfolio_data.get('total_portfolio', 0):,.2f}")
        else:
            log_test("Portfolio API with Valid Token", False, f"Failed to retrieve portfolio: {response.text}")
        
        # First, get all available plans to find a valid plan ID
        response = requests.get(f"{API_BASE}/investment-plans/all")
        if response.status_code == 200:
            all_plans = response.json().get("plans", [])
            club_plans = [p for p in all_plans if p.get("membership_level") == "club"]
            
            if club_plans:
                club_plan = club_plans[0]
                plan_id = club_plan.get("id")
                plan_rate = club_plan.get("rate")
                plan_term = club_plan.get("term")
                
                # Test creating an investment with valid token and plan details
                investment_data = {
                    "user_id": user_id,
                    "name": "Test Investment via API",
                    "amount": 20001,  # Slightly above minimum amount for Club membership
                    "rate": plan_rate,
                    "term": plan_term
                }
                
                response = requests.post(f"{API_BASE}/investments", json=investment_data, headers=valid_headers)
                if response.status_code == 200:
                    log_test("Create Investment with Valid Token", True, "Successfully created investment with valid token")
                    investment = response.json().get("investment", {})
                    print(f"Created investment: ${investment.get('amount', 0):,.2f} at {investment.get('rate')}% APY")
                    
                    # Now check if membership level has changed
                    response = requests.get(f"{API_BASE}/membership/status", headers=valid_headers)
                    if response.status_code == 200:
                        membership_data = response.json()
                        new_level = membership_data.get("level")
                        if new_level == "club":
                            log_test("Membership Level Change", True, f"Successfully upgraded to {membership_data.get('level_name')}")
                            print(f"New membership level: {membership_data.get('level_name')}")
                            
                            # Now check available plans for Club member
                            response = requests.get(f"{API_BASE}/investment-plans", headers=valid_headers)
                            if response.status_code == 200:
                                plans_data = response.json()
                                plans = plans_data.get("plans", [])
                                if len(plans) == 1:  # Club should have 1 plan
                                    plan = plans[0]
                                    if plan.get("rate") == 6.0 and plan.get("term_days") == 365:
                                        log_test("Club Member Investment Plans", True, "Club member has correct plan (6% APY for 365 days)")
                                    else:
                                        log_test("Club Member Investment Plans", False, f"Club member has incorrect plan: {plan}")
                                else:
                                    log_test("Club Member Investment Plans", False, f"Expected 1 plan for Club member, got {len(plans)}")
                        else:
                            log_test("Membership Level Change", False, f"Expected 'club' level, got '{new_level}'")
                    else:
                        log_test("Membership Level Change", False, f"Failed to retrieve updated membership status: {response.text}")
                else:
                    log_test("Create Investment with Valid Token", False, f"Failed to create investment: {response.text}")
            else:
                log_test("Create Investment with Valid Token", False, "No Club level plans found")
        else:
            log_test("Create Investment with Valid Token", False, f"Failed to retrieve investment plans: {response.text}")
    else:
        print(f"Failed to obtain valid token: {auth_response.status_code} - {auth_response.text}")
    
    # Test GET /api/investment-plans/all to check all membership tiers and plans
    response = requests.get(f"{API_BASE}/investment-plans/all")
    if response.status_code == 200:
        log_test("GET All Investment Plans", True, "Successfully retrieved all investment plans")
        plans_data = response.json()
        plans = plans_data.get("plans", [])
        
        # Check if we have plans for all membership levels
        membership_levels = set(plan.get("membership_level") for plan in plans)
        expected_levels = {"club", "premium", "vip", "elite"}
        if expected_levels.issubset(membership_levels):
            log_test("Investment Plans - All Membership Levels", True, f"Found plans for all membership levels: {', '.join(expected_levels)}")
        else:
            log_test("Investment Plans - All Membership Levels", False, f"Missing plans for some membership levels. Expected: {expected_levels}, Got: {membership_levels}")
        
        # Check APY rates for each membership level and term
        expected_rates = {
            "club": {"365": 6.0},
            "premium": {"180": 8.0, "365": 10.0},
            "vip": {"180": 12.0, "365": 14.0},
            "elite": {"180": 16.0, "365": 20.0}
        }
        
        for level in expected_levels:
            level_plans = [p for p in plans if p.get("membership_level") == level]
            for plan in level_plans:
                term_days = plan.get("term_days")
                term_key = str(term_days)
                rate = plan.get("rate")
                expected_rate = expected_rates.get(level, {}).get(term_key)
                
                if expected_rate is not None and rate == expected_rate:
                    log_test(f"APY Rate - {level.capitalize()} {term_days} days", True, f"Correct APY rate: {rate}%")
                else:
                    log_test(f"APY Rate - {level.capitalize()} {term_days} days", False, f"Expected {expected_rate}%, got {rate}%")
    else:
        log_test("GET All Investment Plans", False, f"Failed to retrieve all investment plans: {response.text}")
    
    # Test term days conversion
    test_term_days_conversion()
    
    # Test Telegram integration
    test_telegram_webapp_auth()
    test_telegram_webapp_auth_invalid()
    
    # Test CORS configuration
    test_cors_configuration()
    
    # Test API performance
    test_api_performance()
    
    # Test error handling
    test_error_handling()
    
    # Print summary
    print_summary()

if __name__ == "__main__":
    run_all_tests()