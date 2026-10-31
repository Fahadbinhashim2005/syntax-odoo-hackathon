from datetime import date, timedelta

from sqlalchemy import select

from app.main import app
from app.models import Invoice


def create_invoice(client, customer_id=1, amount="1000.00"):
    payload = {
        "customer_id": customer_id,
        "due_date": (date.today() + timedelta(days=30)).isoformat(),
        "discount_amount": "0.00",
        "tax_rate": "0.00",
        "items": [
            {
                "description": "Dashboard test subscription",
                "quantity": 1,
                "unit_price": amount,
            }
        ],
    }

    response = client.post("/api/invoices", json=payload)
    assert response.status_code == 201

    return response.json()


def set_invoice_due_date(invoice_id, due_date):
    """Update an invoice using the isolated test database."""
    TestingSessionLocal = app.state.TestingSessionLocal
    db = TestingSessionLocal()

    try:
        db_invoice = db.scalar(
            select(Invoice).where(Invoice.id == invoice_id)
        )

        assert db_invoice is not None, "Test invoice was not found"

        db_invoice.due_date = due_date
        db.commit()
    finally:
        db.close()


def test_finance_dashboard_empty(client):
    response = client.get("/api/dashboard/finance")

    assert response.status_code == 200

    dashboard = response.json()

    assert dashboard["total_revenue"] == "0.00"
    assert dashboard["total_outstanding"] == "0.00"
    assert dashboard["total_invoices"] == 0
    assert dashboard["paid_invoices"] == 0
    assert dashboard["overdue_invoice_count"] == 0
    assert dashboard["overdue_amount"] == "0.00"


def test_finance_dashboard_with_invoice(client):
    create_invoice(client)

    response = client.get("/api/dashboard/finance")

    assert response.status_code == 200

    dashboard = response.json()

    assert dashboard["total_invoices"] == 1
    assert dashboard["total_revenue"] == "0.00"
    assert dashboard["total_outstanding"] == "0.00"


def test_dashboard_counts_confirmed_invoice(client):
    invoice = create_invoice(client)
    invoice_id = invoice["id"]

    confirm_response = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert confirm_response.status_code == 200

    response = client.get("/api/dashboard/finance")

    assert response.status_code == 200

    dashboard = response.json()

    assert dashboard["total_invoices"] == 1
    assert dashboard["total_outstanding"] == "1000.00"


def test_dashboard_updates_after_partial_payment(client):
    invoice = create_invoice(client)
    invoice_id = invoice["id"]

    confirm_response = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert confirm_response.status_code == 200

    payment_response = client.post(
        "/api/payments",
        json={
            "invoice_id": invoice_id,
            "amount": "400.00",
            "payment_method": "card",
            "transaction_reference": "DASHBOARD-TEST-001",
        },
    )
    assert payment_response.status_code == 201

    response = client.get("/api/dashboard/finance")

    assert response.status_code == 200

    dashboard = response.json()

    assert dashboard["total_revenue"] == "400.00"
    assert dashboard["total_outstanding"] == "600.00"


def test_dashboard_counts_overdue_invoice(client):
    invoice = create_invoice(client)
    invoice_id = invoice["id"]

    # Make the invoice five days overdue in the test database.
    set_invoice_due_date(
        invoice_id,
        date.today() - timedelta(days=5),
    )

    confirm_response = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert confirm_response.status_code == 200

    response = client.get("/api/dashboard/finance")

    assert response.status_code == 200

    dashboard = response.json()

    assert dashboard["overdue_invoice_count"] == 1
    assert dashboard["overdue_amount"] == "1000.00"


def test_overdue_endpoint_returns_overdue_invoice(client):
    invoice = create_invoice(client)
    invoice_id = invoice["id"]

    # Make the invoice five days overdue in the test database.
    set_invoice_due_date(
        invoice_id,
        date.today() - timedelta(days=5),
    )

    confirm_response = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert confirm_response.status_code == 200

    response = client.get("/api/invoices/overdue")

    assert response.status_code == 200

    overdue_invoices = response.json()

    assert len(overdue_invoices) == 1
    assert overdue_invoices[0]["id"] == invoice_id
    assert overdue_invoices[0]["days_overdue"] == 5


def test_cancelled_invoice_not_listed_as_overdue(client):
    invoice = create_invoice(client)
    invoice_id = invoice["id"]

    set_invoice_due_date(
        invoice_id,
        date.today() - timedelta(days=5),
    )

    cancellation = client.post(
        f"/api/invoices/{invoice_id}/cancel"
    )
    assert cancellation.status_code == 200

    response = client.get("/api/invoices/overdue")

    assert response.status_code == 200
    assert all(
        item["id"] != invoice_id
        for item in response.json()
    )


def test_fully_paid_invoice_not_listed_as_overdue(client):
    invoice = create_invoice(client)
    invoice_id = invoice["id"]

    set_invoice_due_date(
        invoice_id,
        date.today() - timedelta(days=5),
    )

    confirmation = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert confirmation.status_code == 200

    payment = client.post(
        "/api/payments",
        json={
            "invoice_id": invoice_id,
            "amount": "1000.00",
            "payment_method": "card",
            "transaction_reference": "TEST-FULL-PAYMENT",
        },
    )
    assert payment.status_code == 201

    response = client.get("/api/invoices/overdue")

    assert response.status_code == 200
    assert all(
        item["id"] != invoice_id
        for item in response.json()
    )
