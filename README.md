# Syntax Odoo — Product Catalogue & Pricing (feature/products)

This branch contains the frontend implementation for Member 2's Product Catalogue & Pricing module.

## Included
- Product list with search, type/status filters, add/edit and deactivate/reactivate controls.
- Subscription plans with product association, daily/weekly/monthly/yearly billing, price, minimum quantity, date range and activation status.
- Discounts supporting percentage/fixed values, all/product/plan scope, validity dates and activation status.
- Tax settings with validated 0–100% rates and a preview calculator that applies discounts before tax.
- Responsive catalogue navigation and a dashboard summary.
- Browser `localStorage` persistence for frontend demonstration across reloads.

## Run frontend
```bash
cd frontend
npm install
npm run dev
```

## Important integration notes
The supplied repository ZIP contains frontend source only. It does not include a FastAPI backend, SQLAlchemy models, database migrations, authentication implementation, or server-side APIs. Therefore this implementation is a frontend prototype and stores demo data in the current browser; it is not production persistence.

Before merging into the complete team application:
1. Connect product, plan, discount, and tax operations to the team's backend APIs.
2. Enforce Admin/Staff permissions in the backend; hiding controls in the UI is not authorization.
3. Use backend-authoritative decimal pricing calculations and validate discount scope/date eligibility server-side.
4. Preserve product/plan price and tax snapshots on confirmed quotations, subscriptions, and invoices.
5. Coordinate shared type definitions and API contracts with Member 3 (quotations/subscriptions) and Member 4 (invoices/payments).
6. Add product variants and backend CRUD if they are not already implemented in the shared repository.

The pricing order used in the tax preview is:
- subtotal = unit price × quantity
- discount is capped at eligible subtotal
- taxable amount = subtotal − discount
- tax = taxable amount × rate / 100
- total = taxable amount + tax

All data shown is demo data until API integration is completed.
