import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_pipeline():
    print("=== STARTING FULL BACKEND PIPELINE TEST ===")

    # 1. Test Login with seeded Admin
    print("\n1. Testing Login...")
    res = client.post("/api/auth/login", json={
        "email": "admin@brightloop.com",
        "password": "admin123"
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    auth_data = res.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"   [OK] Logged in as: {auth_data['user']['name']} (Role: {auth_data['user']['role']})")

    # 2. Test Get Me
    res = client.get("/api/users/me", headers=headers)
    assert res.status_code == 200
    print(f"   [OK] /api/users/me returns: {res.json()['email']}")

    # 3. Test Products & Variants
    print("\n2. Testing Products & Variants...")
    res = client.get("/api/products", headers=headers)
    assert res.status_code == 200
    products = res.json()
    print(f"   [OK] Found {len(products)} products in catalogue")
    assert len(products) >= 1

    # 4. Test Plans
    print("\n3. Testing Subscription Plans...")
    res = client.get("/api/plans", headers=headers)
    assert res.status_code == 200
    plans = res.json()
    print(f"   [OK] Found {len(plans)} subscription plans")
    assert len(plans) >= 1

    # 5. Test Customers
    print("\n4. Testing Customers...")
    res = client.get("/api/customers", headers=headers)
    assert res.status_code == 200
    customers = res.json()
    print(f"   [OK] Found {len(customers)} customers")
    target_cust = customers[0]

    # 6. Test Quotation creation and confirmation to subscription
    print("\n5. Testing Quotation -> Subscription Conversion...")
    target_plan = plans[0]
    res = client.post("/api/quotations", headers=headers, json={
        "customer_id": target_cust["id"],
        "plan_id": target_plan["id"],
        "quantity": 2,
        "unit_price": target_plan["price"],
        "discount_amount": 100.0,
        "tax_amount": 180.0,
        "notes": "Automated integration test proposal"
    })
    assert res.status_code == 200, f"Create quotation failed: {res.text}"
    new_qt = res.json()
    print(f"   [OK] Created Quotation: {new_qt['quotation_number']} for INR {new_qt['total_amount']}")

    # Confirm Quotation -> converts to Subscription
    res = client.post(f"/api/quotations/{new_qt['id']}/confirm", headers=headers)
    assert res.status_code == 200, f"Confirm quotation failed: {res.text}"
    new_sub = res.json()
    print(f"   [OK] Quotation confirmed! Generated Subscription: {new_sub['subscription_number']} (Status: {new_sub['status']})")

    # 7. Test Invoices & Due for billing
    print("\n6. Testing Invoices & Auto-generation...")
    res = client.get("/api/subscriptions/due-for-billing", headers=headers)
    assert res.status_code == 200
    print(f"   [OK] Due for billing subscriptions: {len(res.json())}")

    # Generate invoices
    res = client.post("/api/invoices/generate", headers=headers)
    assert res.status_code == 200
    generated_invs = res.json()
    print(f"   [OK] Auto-generated {len(generated_invs)} invoices")

    # List all invoices
    res = client.get("/api/invoices", headers=headers)
    assert res.status_code == 200
    all_invs = res.json()
    print(f"   [OK] Total invoices in system: {len(all_invs)}")
    unpaid_inv = next((i for i in all_invs if i["status"] in ["confirmed", "partially_paid", "overdue", "draft"]), all_invs[0])

    # 8. Test Record Payment
    print("\n7. Testing Payments...")
    if unpaid_inv["status"] == "draft":
        client.post(f"/api/invoices/{unpaid_inv['id']}/confirm", headers=headers)
    
    pay_amount = min(500.0, unpaid_inv["outstanding_amount"] or 500.0)
    res = client.post("/api/payments", headers=headers, json={
        "invoice_id": unpaid_inv["id"],
        "amount": pay_amount,
        "payment_method": "upi",
        "reference": "UPI/TEST-12345",
        "notes": "Automated verification payment"
    })
    assert res.status_code == 200, f"Record payment failed: {res.text}"
    new_pay = res.json()
    print(f"   [OK] Recorded payment {new_pay['payment_number']} for INR {new_pay['amount']}")

    # 9. Test Dashboard Finance KPIs
    print("\n8. Testing Finance Dashboard Stats...")
    res = client.get("/api/dashboard/finance", headers=headers)
    assert res.status_code == 200
    kpis = res.json()
    print(f"   [OK] Total Revenue: INR {kpis['total_revenue']}")
    print(f"   [OK] Outstanding: INR {kpis['outstanding']}")
    print(f"   [OK] Invoices Paid: {kpis['invoices_paid']}")
    print(f"   [OK] Overdue Count: {kpis['overdue_count']}")
    print(f"   [OK] Active Subscriptions: {kpis['active_subscriptions']}")
    print(f"   [OK] Monthly Revenue items: {len(kpis['monthly_revenue'])}")

    print("\n=== ALL BACKEND MODULES AND PIPELINES PASSED! ===")

if __name__ == "__main__":
    test_full_pipeline()
