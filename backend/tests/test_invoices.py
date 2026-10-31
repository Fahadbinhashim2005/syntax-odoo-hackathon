from datetime import date, timedelta


def create_invoice(client, customer_id=1):
    payload = {
        "customer_id": customer_id,
        "due_date": (date.today() + timedelta(days=30)).isoformat(),
        "discount_amount": "0.00",
        "tax_rate": "10.00",
        "items": [
            {
                "description": "Test subscription",
                "quantity": 2,
                "unit_price": "100.00",
            }
        ],
    }

    return client.post("/api/invoices", json=payload)


def test_list_invoices(client):
    response = client.get("/api/invoices")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json() == []


def test_get_existing_invoice(client):
    create_response = create_invoice(client)
    assert create_response.status_code == 201

    invoice_id = create_response.json()["id"]

    response = client.get(f"/api/invoices/{invoice_id}")

    assert response.status_code == 200

    invoice = response.json()

    assert invoice["id"] == invoice_id
    assert "invoice_number" in invoice
    assert "total_amount" in invoice
    assert "outstanding_amount" in invoice


def test_get_nonexistent_invoice(client):
    response = client.get("/api/invoices/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Invoice not found."


def test_create_invoice(client):
    response = create_invoice(client, customer_id=999)

    assert response.status_code == 201

    invoice = response.json()

    assert invoice["customer_id"] == 999
    assert invoice["subtotal"] == "200.00"
    assert invoice["tax_amount"] == "20.00"
    assert invoice["total_amount"] == "220.00"
    assert invoice["status"] == "draft"
    assert invoice["outstanding_amount"] == "220.00"
    assert len(invoice["items"]) == 1


def test_create_invoice_without_items(client):
    payload = {
        "customer_id": 999,
        "due_date": (date.today() + timedelta(days=30)).isoformat(),
        "discount_amount": "0.00",
        "tax_rate": "0.00",
        "items": [],
    }

    response = client.post("/api/invoices", json=payload)

    assert response.status_code == 422


def test_cannot_confirm_already_confirmed_invoice(client):
    invoice_response = create_invoice(client)
    invoice_id = invoice_response.json()["id"]

    first_confirmation = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert first_confirmation.status_code == 200

    second_confirmation = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert second_confirmation.status_code == 400


def test_cannot_cancel_confirmed_invoice(client):
    invoice_response = create_invoice(client)
    invoice_id = invoice_response.json()["id"]

    confirmation = client.post(
        f"/api/invoices/{invoice_id}/confirm"
    )
    assert confirmation.status_code == 200

    cancellation = client.post(
        f"/api/invoices/{invoice_id}/cancel"
    )
    assert cancellation.status_code == 400
