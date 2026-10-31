from datetime import date, timedelta

from app.models import Invoice
from app.services.invoice_service import create_invoice


def create_confirmed_invoice(client):
    payload = {
        "customer_id": 1,
        "due_date": (date.today() + timedelta(days=30)).isoformat(),
        "discount_amount": "0.00",
        "tax_rate": "0.00",
        "items": [
            {
                "description": "Payment test subscription",
                "quantity": 1,
                "unit_price": "1000.00",
            }
        ],
    }

    response = client.post("/api/invoices", json=payload)
    assert response.status_code == 201

    invoice_id = response.json()["id"]

    confirm_response = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert confirm_response.status_code == 200

    return invoice_id


def test_record_payment(client):
    invoice_id = create_confirmed_invoice(client)

    payload = {
        "invoice_id": invoice_id,
        "amount": "400.00",
        "payment_method": "card",
        "transaction_reference": "TEST-PAY-001",
    }

    response = client.post("/api/payments", json=payload)

    assert response.status_code == 201

    payment = response.json()

    assert payment["invoice_id"] == invoice_id
    assert payment["amount"] == "400.00"
    assert payment["payment_method"] == "card"
    assert payment["transaction_reference"] == "TEST-PAY-001"
    assert payment["status"] == "completed"

    invoice_response = client.get(f"/api/invoices/{invoice_id}")
    invoice = invoice_response.json()

    assert invoice["paid_amount"] == "400.00"
    assert invoice["outstanding_amount"] == "600.00"
    assert invoice["status"] == "partially_paid"


def test_reject_overpayment(client):
    invoice_id = create_confirmed_invoice(client)

    payload = {
        "invoice_id": invoice_id,
        "amount": "1000.01",
        "payment_method": "card",
        "transaction_reference": "TEST-OVERPAY-001",
    }

    response = client.post("/api/payments", json=payload)

    assert response.status_code == 400
    assert "exceed" in response.json()["detail"].lower()

    invoice_response = client.get(f"/api/invoices/{invoice_id}")
    invoice = invoice_response.json()

    assert invoice["paid_amount"] == "0.00"
    assert invoice["outstanding_amount"] == "1000.00"
    assert invoice["status"] == "confirmed"