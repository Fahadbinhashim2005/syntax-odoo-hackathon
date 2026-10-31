from fastapi.testclient import TestClient
from datetime import date, timedelta
from app.main import app

client = TestClient(app)

def test_member3():
    print("=== TESTING MEMBER 3: QUOTATIONS & SUBSCRIPTION LIFECYCLE ===")
    
    # Login as admin
    login_res = client.post("/api/auth/login", json={"email": "admin@brightloop.com", "password": "admin123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get customer and plan
    cust_res = client.get("/api/customers", headers=headers)
    assert cust_res.status_code == 200
    cust = cust_res.json()[0]

    plan_res = client.get("/api/plans", headers=headers)
    assert plan_res.status_code == 200
    plan = plan_res.json()[0]

    # 1. Create a draft quotation
    print("\n1. Testing Quotation Creation...")
    create_payload = {
        "customer_id": cust["id"],
        "plan_id": plan["id"],
        "quantity": 3,
        "unit_price": plan["price"],
        "discount_amount": 150.0,
        "tax_amount": 250.0,
        "valid_until": str(date.today() + timedelta(days=14)),
        "notes": "Custom pilot quotation test"
    }
    q_res = client.post("/api/quotations", headers=headers, json=create_payload)
    assert q_res.status_code == 200
    q_data = q_res.json()
    q_id = q_data["id"]
    print(f"   [OK] Created {q_data['quotation_number']} (Status: {q_data['status']}, Total: {q_data['total_amount']})")
    assert q_data["status"] == "draft"

    # 2. Mark as sent
    print("\n2. Testing Quotation State: Draft -> Sent...")
    send_res = client.post(f"/api/quotations/{q_id}/send", headers=headers)
    assert send_res.status_code == 200
    assert send_res.json()["status"] == "sent"
    print("   [OK] Quotation status transitioned to 'sent'")

    # 3. Convert quotation to subscription
    print("\n3. Testing Atomic Quotation Conversion...")
    conv_res = client.post(f"/api/quotations/{q_id}/convert", headers=headers, json={
        "start_date": str(date.today()),
        "notes": "Converted during test_member3"
    })
    assert conv_res.status_code == 200
    sub_data = conv_res.json()
    sub_id = sub_data["id"]
    print(f"   [OK] Converted to Subscription: {sub_data['subscription_number']} (Status: {sub_data['status']})")
    assert sub_data["status"] == "confirmed"
    assert sub_data["quotation_id"] == q_id

    # Check quotation is now 'converted' and has subscription reference
    q_check = client.get(f"/api/quotations/{q_id}", headers=headers).json()
    assert q_check["status"] == "converted"
    assert q_check["subscription_id"] == sub_id
    assert q_check["subscription_number"] == sub_data["subscription_number"]
    print(f"   [OK] Quotation verified as 'converted' with linked {q_check['subscription_number']}")

    # 4. Verify duplicate conversion is blocked
    print("\n4. Testing Duplicate Conversion Prevention...")
    dup_res = client.post(f"/api/quotations/{q_id}/convert", headers=headers)
    assert dup_res.status_code == 400
    print(f"   [OK] Duplicate conversion correctly blocked: {dup_res.json()['detail']}")

    # 5. Test Subscription Lifecycle
    print("\n5. Testing Subscription Lifecycle: Activate -> Pause -> Resume -> Renew -> Close...")
    
    # 5a. Activate
    act_res = client.post(f"/api/subscriptions/{sub_id}/activate", headers=headers)
    assert act_res.status_code == 200
    assert act_res.json()["status"] == "active"
    print("   [OK] Status: Active")

    # 5b. Pause
    pause_res = client.post(f"/api/subscriptions/{sub_id}/pause", headers=headers, json={"reason": "Customer seasonal maintenance"})
    assert pause_res.status_code == 200
    assert pause_res.json()["status"] == "paused"
    print("   [OK] Status: Paused")

    # 5c. Resume
    resume_res = client.post(f"/api/subscriptions/{sub_id}/resume", headers=headers, json={"effective_date": str(date.today())})
    assert resume_res.status_code == 200
    assert resume_res.json()["status"] == "active"
    print("   [OK] Status: Resumed -> Active")

    # 5d. Renew
    renew_res = client.post(f"/api/subscriptions/{sub_id}/renew", headers=headers, json={"renewal_periods": 2})
    assert renew_res.status_code == 200
    assert renew_res.json()["status"] == "active"
    print(f"   [OK] Renewed for 2 periods. New End Date: {renew_res.json()['end_date']}")

    # 5e. Close
    close_res = client.post(f"/api/subscriptions/{sub_id}/close", headers=headers, json={"close_reason": "End of contract period"})
    assert close_res.status_code == 200
    assert close_res.json()["status"] == "closed"
    assert close_res.json()["next_billing_date"] is None
    print("   [OK] Status: Closed (next_billing_date halted)")

    # 6. Test Audit Timeline History
    print("\n6. Testing Subscription Audit History Timeline...")
    hist_res = client.get(f"/api/subscriptions/{sub_id}/history", headers=headers)
    assert hist_res.status_code == 200
    events = hist_res.json()
    event_types = [e["event_type"] for e in events]
    print(f"   [OK] History events recorded ({len(events)}): {event_types}")
    assert "converted_from_quotation" in event_types
    assert "activated" in event_types
    assert "paused" in event_types
    assert "resumed" in event_types
    assert "renewed" in event_types
    assert "closed" in event_types

    print("\n=== ALL MEMBER 3 BACKEND SPECIFICATIONS FULLY VERIFIED! ===")

if __name__ == "__main__":
    test_member3()
