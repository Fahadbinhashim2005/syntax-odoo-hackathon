# 🚀 Brightloop — Master Build Specification
### Team Syntax | Odoo Hackathon
> **How to use this file:** Each member copies their own section (Member 1 / 2 / 3 / 4) and pastes it into any AI chatbot (Gemini, Claude, ChatGPT). The chatbot will build the complete full-stack module for that member.

---

# ⚙️ SHARED CONTEXT (Read before all member sections)

## Project Overview
**Brightloop** is a SaaS Subscription Management System built for the Odoo Hackathon by Team Syntax.
It allows businesses to manage products, plans, customers, quotations, subscriptions, invoices and payments — all in one place.

## Tech Stack (Same for all members)

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS v4 (already configured via `@tailwindcss/vite`)
- **Routing:** React Router DOM v7
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query v5)
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** Sonner (toast)
- **Utilities:** clsx, tailwind-merge, date-fns

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (dev) via SQLAlchemy ORM
- **Auth:** JWT (python-jose), bcrypt (passlib)
- **Migrations:** Alembic (optional, auto-create tables via SQLAlchemy)
- **CORS:** Configured for `http://localhost:5173`
- **Server:** Uvicorn

## Design System (Same for all members)

### Color Palette
```
Primary:    #7c3aed  (violet-600)
Primary Hover: #6d28d9 (violet-700)
Primary Light: #ede9fe (violet-50)
Primary Text:  #5b21b6 (violet-800)

Background: #f8fafc (slate-50)
Surface:    #ffffff (white)
Border:     #e2e8f0 (slate-200)
Text Main:  #0f172a (slate-900)
Text Muted: #64748b (slate-500)
Text Light: #94a3b8 (slate-400)

Success:    #059669 (emerald-600) / bg: #ecfdf5 (emerald-50)
Warning:    #d97706 (amber-600)  / bg: #fffbeb (amber-50)
Danger:     #dc2626 (rose-600)   / bg: #fff1f2 (rose-50)
Info:       #0284c7 (sky-600)    / bg: #f0f9ff (sky-50)
```

### Typography
```
Font: 'Inter', sans-serif (import from Google Fonts)
Heading XL: text-2xl font-bold tracking-tight text-slate-900
Heading LG: text-lg font-bold text-slate-900
Subheading: text-sm text-slate-500
Body:       text-sm text-slate-700
Caption:    text-xs text-slate-400
```

### Common Component Classes (TailwindCSS v4)
```
Card:        rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
Button Primary: rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition
Button Ghost: rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50
Badge Active:   rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700
Badge Pending:  rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700
Badge Inactive: rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700
Badge Info:     rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700
Input:       w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100
Table Header: bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400 px-6 py-4
Table Cell:  px-6 py-4 text-sm text-slate-700
Sidebar:     fixed inset-y-0 left-0 w-64 bg-[#1e1b4b] text-white flex flex-col
```

### Sidebar Navigation (dark, same for all members)
```tsx
// Sidebar background: #1e1b4b (dark indigo)
// Active item: bg-white/10 text-white rounded-xl
// Inactive item: text-white/60 hover:bg-white/5 hover:text-white rounded-xl
// Logo: "Brightloop" in white with a violet square icon
```

## Folder Structure (Each member follows this in their branch)
```
frontend/src/
  pages/
    auth/           ← Member 1 only
    catalogue/      ← Member 2 only
    subscriptions/  ← Member 3 only
    finance/        ← Member 4 only
  components/
    ui/             ← shared: Button, Badge, Input, Modal, Table, Card
    layout/         ← Sidebar, Header, Layout wrapper
  hooks/            ← useAuth, useCustomers, etc.
  api/
    client.ts       ← axios instance with baseURL + auth header
    auth.ts         ← Member 1
    catalogue.ts    ← Member 2
    subscriptions.ts ← Member 3
    finance.ts      ← Member 4
  store/
    authStore.ts    ← Zustand: token, user, role
  types/
    index.ts        ← all shared TypeScript interfaces

backend/app/
  api/
    auth.py         ← Member 1
    users.py        ← Member 1
    customers.py    ← Member 1
    products.py     ← Member 2
    plans.py        ← Member 2
    discounts.py    ← Member 2
    taxes.py        ← Member 2
    quotations.py   ← Member 3
    subscriptions.py ← Member 3
    invoices.py     ← Member 4
    payments.py     ← Member 4
    dashboard.py    ← Member 4
  models/           ← SQLAlchemy models
  schemas/          ← Pydantic schemas
  services/         ← Business logic
  database.py       ← DB connection
  main.py           ← FastAPI app + router registration + CORS
```

---

---

# 👤 MEMBER 1 — Authentication & User Management
## Chatbot Prompt — Copy everything below this line

---

## YOUR TASK
Build the complete **Authentication & User Management** module for **Brightloop**, a SaaS Subscription Management System. You are building both the frontend (React + TypeScript + TailwindCSS v4) and the backend (FastAPI + SQLAlchemy + JWT).

## Tech Stack
- Frontend: React 19, TypeScript, Vite, TailwindCSS v4, React Router DOM v7, Zustand, TanStack Query v5, Axios, React Hook Form, Zod, Lucide React, Sonner
- Backend: FastAPI, SQLAlchemy, SQLite, JWT (python-jose), bcrypt (passlib), Pydantic v2

## Design System
- Primary color: violet-600 (#7c3aed)
- Background: slate-50 (#f8fafc)
- Sidebar: dark indigo (#1e1b4b)
- Cards: white, rounded-2xl, shadow-sm, border-slate-200
- Font: Inter from Google Fonts
- Status badges: emerald=Active, rose=Inactive, amber=Pending

---

## BACKEND — Build these files

### `backend/app/database.py`
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./brightloop.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### `backend/app/models/user.py`
Create a SQLAlchemy `User` model with:
- `id` (Integer, primary key)
- `name` (String)
- `email` (String, unique, indexed)
- `hashed_password` (String)
- `role` (String: "admin", "staff", "customer")
- `is_active` (Boolean, default True)
- `created_at` (DateTime)

### `backend/app/models/customer.py`
Create a SQLAlchemy `Customer` model with:
- `id` (Integer, primary key)
- `user_id` (ForeignKey to users.id, nullable)
- `name` (String)
- `email` (String, unique)
- `phone` (String, nullable)
- `company` (String, nullable)
- `address` (String, nullable)
- `is_active` (Boolean, default True)
- `created_at` (DateTime)

### `backend/app/schemas/auth.py`
Pydantic v2 schemas:
- `RegisterRequest`: name, email, password, role (default "staff")
- `LoginRequest`: email, password
- `TokenResponse`: access_token, token_type, user (UserOut)
- `UserOut`: id, name, email, role, is_active

### `backend/app/schemas/customer.py`
- `CustomerCreate`: name, email, phone, company, address
- `CustomerUpdate`: all optional
- `CustomerOut`: all fields + id + created_at

### `backend/app/core/security.py`
Implement:
- `hash_password(password)` using passlib bcrypt
- `verify_password(plain, hashed)` 
- `create_access_token(data: dict, expires_delta)` using python-jose JWT
- `get_current_user(token)` dependency — decodes JWT, returns user from DB
- `require_admin(current_user)` — raises 403 if not admin
- Secret key: use `SECRET_KEY = "brightloop-secret-key-2026"`, algorithm `HS256`, token expiry 24h

### `backend/app/api/auth.py`
Implement these endpoints:
```
POST /api/auth/register   → Register new user, hash password, return token
POST /api/auth/login      → Verify credentials, return JWT token
POST /api/auth/forgot-password → (stub) accept email, return success message
POST /api/auth/reset-password  → (stub) accept token+new password, return success
GET  /api/users/me        → Return current logged-in user (requires auth)
PUT  /api/users/me        → Update own profile
```

### `backend/app/api/users.py` (Staff management)
```
GET  /api/staff           → List all staff users (admin only)
POST /api/staff           → Create staff user (admin only)
PUT  /api/staff/:id       → Update staff (admin only)
PATCH /api/staff/:id/deactivate → Soft deactivate (admin only)
```

### `backend/app/api/customers.py`
```
GET  /api/customers       → List all customers (admin/staff)
POST /api/customers       → Create customer
GET  /api/customers/:id   → Get single customer
PUT  /api/customers/:id   → Update customer
PATCH /api/customers/:id/deactivate → Soft deactivate
```

### `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.api import auth, users, customers

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Brightloop Auth API", version="1.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(customers.router)
```

### `backend/requirements.txt`
```
fastapi==0.111.0
uvicorn==0.30.1
sqlalchemy==2.0.30
pydantic==2.7.4
pydantic-settings==2.3.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
```

---

## FRONTEND — Build these files

### `frontend/src/api/client.ts`
Axios instance with:
- `baseURL: 'http://localhost:8000'`
- Request interceptor: attach `Authorization: Bearer <token>` from localStorage
- Response interceptor: if 401, clear token and redirect to `/login`

### `frontend/src/store/authStore.ts`
Zustand store with:
- `user`: `{ id, name, email, role } | null`
- `token`: `string | null`
- `setAuth(user, token)`: save to store + localStorage
- `logout()`: clear store + localStorage
- `isAdmin()`: returns `role === 'admin'`

### `frontend/src/types/index.ts`
TypeScript interfaces:
```ts
interface User { id: number; name: string; email: string; role: 'admin' | 'staff' | 'customer'; is_active: boolean }
interface Customer { id: number; name: string; email: string; phone?: string; company?: string; is_active: boolean; created_at: string }
interface AuthResponse { access_token: string; token_type: string; user: User }
```

### Pages to build (all in `frontend/src/pages/auth/`)

#### 1. `LoginPage.tsx`
- Full-page dark gradient background (`from-slate-950 to-violet-950`)
- Centered frosted-glass card (white/10 backdrop-blur)
- Brightloop logo at top
- "Welcome back" heading
- Email + Password inputs (React Hook Form + Zod)
- "Forgot password?" link
- "Sign In" violet button (shows spinner on loading)
- "Don't have an account? Register" link
- On success: save to Zustand + navigate to `/dashboard`
- Show error toast (Sonner) on wrong credentials

#### 2. `RegisterPage.tsx`
- Same design as login
- Fields: Full Name, Email, Password, Confirm Password
- Role selector: Staff / Admin (dropdown)
- Zod validation (email format, passwords match, min 8 chars)
- On success: auto-login + navigate to `/dashboard`

#### 3. `ForgotPasswordPage.tsx`
- Simple centered card
- Email input
- "Send Reset Link" button
- Success state shows confirmation message
- "Back to Login" link

#### 4. `ResetPasswordPage.tsx`
- New Password + Confirm Password inputs
- Reads token from URL params
- On success: redirect to login

#### 5. `StaffManagementPage.tsx` (Admin only)
Layout: Sidebar + Header + main content
- Page title "Staff Management" + "Add Staff" button
- Stats bar: Total Staff count, Active count
- Searchable, filterable table:
  - Columns: Name, Email, Role, Status (badge), Created, Actions
  - Actions: Edit (pencil icon), Deactivate (toggle)
- "Add Staff" opens a right-side slide-over panel (not modal) with form:
  - Name, Email, Password, Role (admin/staff) inputs
  - Save + Cancel buttons

#### 6. `CustomerListPage.tsx`
- "Customer Management" title + "Add Customer" violet button
- Stats: Total Customers, Active
- Search bar + filter by status
- Table: Name, Email, Phone, Company, Status (badge), Actions
- Click row → navigate to `/customers/:id`
- "Add Customer" slide-over with: Name, Email, Phone, Company, Address fields

#### 7. `CustomerProfilePage.tsx`
- Breadcrumb: Customers → Customer Name
- Profile card: avatar initials circle (violet), name, email, phone, company
- Two tabs: Details | Subscription History (subscription history = placeholder)
- Edit button opens inline edit form
- "Deactivate Account" button with confirm dialog

#### 8. `AccountSettingsPage.tsx`
- "My Account" heading
- Profile section: name, email (read-only), role badge
- "Update Profile" form: name field
- "Change Password" section: current password, new password, confirm
- Save changes with success toast

### `frontend/src/components/layout/ProtectedRoute.tsx`
```tsx
// Redirect to /login if no token in authStore
// Redirect to /unauthorized if role doesn't match required role
```

### `frontend/src/App.tsx` (routing)
```tsx
Routes:
/login           → LoginPage (public)
/register        → RegisterPage (public)
/forgot-password → ForgotPasswordPage (public)
/reset-password  → ResetPasswordPage (public)
/                → redirect to /dashboard
/dashboard       → DashboardPage (protected) ← placeholder, Member 1 shows welcome message
/staff           → StaffManagementPage (admin only)
/customers       → CustomerListPage (admin/staff)
/customers/:id   → CustomerProfilePage (admin/staff)
/settings        → AccountSettingsPage (any role)
```

---

---

# 📦 MEMBER 2 — Product Catalogue & Pricing
## Chatbot Prompt — Copy everything below this line

---

## YOUR TASK
Build the complete **Product Catalogue & Pricing** module for **Brightloop**, a SaaS Subscription Management System. You are building both the frontend (React + TypeScript + TailwindCSS v4) and the backend (FastAPI + SQLAlchemy).

## Tech Stack
Same as shared context above. Auth is handled by Member 1 — assume a valid JWT token exists in localStorage under `authToken`. Your axios client attaches it to every request.

## Design System
Same as shared context. Use violet for primary actions, amber for pricing/plan highlights, emerald for active status badges.

---

## BACKEND — Build these files

### Models

#### `backend/app/models/product.py`
```python
# Product model with:
# id, name, description, product_type (enum: 'service', 'consumable', 'storable'),
# sales_price (Float), cost_price (Float), is_active (Boolean), created_at (DateTime)
```

#### `backend/app/models/variant.py`
```python
# ProductVariant model with:
# id, product_id (FK → products.id), name (e.g. "Monthly", "Annual"),
# additional_price (Float, default 0), is_active (Boolean)
```

#### `backend/app/models/plan.py`
```python
# Plan model with:
# id, name, description, product_id (FK → products.id),
# billing_frequency (enum: 'daily','weekly','monthly','yearly'),
# price (Float), min_quantity (Integer, default 1),
# available_from (Date, nullable), available_to (Date, nullable),
# is_active (Boolean), created_at (DateTime)
```

#### `backend/app/models/discount.py`
```python
# Discount model with:
# id, name, discount_type (enum: 'percentage', 'fixed'),
# value (Float), applicable_to (enum: 'all', 'plan', 'product'),
# applicable_id (Integer, nullable — plan_id or product_id),
# valid_from (Date, nullable), valid_to (Date, nullable),
# is_active (Boolean), created_at (DateTime)
```

#### `backend/app/models/tax.py`
```python
# Tax model with:
# id, name, percentage (Float), is_active (Boolean), created_at (DateTime)
```

### Schemas (Pydantic v2)
For each model, create:
- `XxxCreate`: required fields for creation
- `XxxUpdate`: all optional for partial updates
- `XxxOut`: all fields + id + timestamps

### API Endpoints

#### `backend/app/api/products.py`
```
GET    /api/products              → list all active products (with variants)
POST   /api/products              → create product
GET    /api/products/:id          → get single product with variants
PUT    /api/products/:id          → update product
DELETE /api/products/:id          → soft delete (set is_active=False)
GET    /api/products/:id/variants → list variants for product
POST   /api/products/:id/variants → add variant
PUT    /api/variants/:id          → update variant
```

#### `backend/app/api/plans.py`
```
GET    /api/plans                 → list all plans (with linked product info)
POST   /api/plans                 → create plan
GET    /api/plans/:id             → get plan details
PUT    /api/plans/:id             → update plan
DELETE /api/plans/:id             → soft delete
```

#### `backend/app/api/discounts.py`
```
GET    /api/discounts             → list discounts
POST   /api/discounts             → create discount
PUT    /api/discounts/:id         → update discount
DELETE /api/discounts/:id         → soft delete
```

#### `backend/app/api/taxes.py`
```
GET    /api/taxes                 → list taxes
POST   /api/taxes                 → create tax
PUT    /api/taxes/:id             → update tax
```

---

## FRONTEND — Build these pages

All pages use the shared Sidebar (dark #1e1b4b) + Header layout.
Sidebar nav items for Member 2: Products, Plans, Discounts, Taxes

### `frontend/src/pages/catalogue/ProductListPage.tsx`
- Header: "Products" + "+ Add Product" violet button
- Stats cards: Total Products, Active Products, Total Variants
- Search input + Type filter dropdown (All / Service / Consumable / Storable)
- Table columns: Product Name, Type (badge), Sales Price, Cost Price, Variants count, Status, Actions
- Actions: Edit (pencil), View variants (eye), Deactivate
- Empty state: illustration + "No products yet. Add your first product."
- Row click navigates to `/products/:id`

### `frontend/src/pages/catalogue/AddEditProductPage.tsx`
- "Add Product" / "Edit Product" heading with breadcrumb
- Form fields (React Hook Form + Zod):
  - Product Name (required)
  - Description (textarea)
  - Product Type (select: Service / Consumable / Storable)
  - Sales Price (number, ₹)
  - Cost Price (number, ₹)
  - Active toggle
- Below the form: "Product Variants" section
  - Show existing variants in a small table: Name, Additional Price, Actions
  - "+ Add Variant" button opens inline row for: Variant Name, Additional Price
- Save / Cancel buttons

### `frontend/src/pages/catalogue/PlanListPage.tsx`
- Header: "Subscription Plans" + "+ Add Plan" button
- **Three beautifully styled plan cards** in a grid (3 columns):
  - Each card shows: Plan Name, linked product, billing frequency badge, price (large ₹ amount), min quantity, availability dates, Active/Inactive status, Edit button
  - Card border color: slate (Starter), violet (Professional/Popular badge), amber (Enterprise)
  - Hover: subtle lift shadow effect
- Below cards: "All Plans" flat table for quick overview and bulk management
- "+ Add Plan" button opens a slide-over form

### `frontend/src/pages/catalogue/AddEditPlanPage.tsx`
- Form fields:
  - Plan Name (required)
  - Description (textarea)
  - Link to Product (searchable select — calls `/api/products`)
  - Billing Frequency (radio: Daily / Weekly / Monthly / Yearly)
  - Price (₹)
  - Minimum Quantity (number)
  - Available From / Available To (date pickers)
  - Active toggle
- Preview card on the right: live preview of how the plan card looks as user types

### `frontend/src/pages/catalogue/DiscountManagementPage.tsx`
- Header: "Discounts" + "+ Add Discount" button
- Table: Name, Type (Percentage/Fixed), Value, Applies To, Valid Period, Status, Actions
- Slide-over form for Add/Edit:
  - Name, Discount Type (radio), Value, Applies To (All/Plan/Product), Valid From/To
- Active/inactive toggle per row

### `frontend/src/pages/catalogue/TaxSettingsPage.tsx`
- Simpler page
- Header: "Tax Configuration"
- Table: Tax Name, Percentage (%), Status, Actions
- Inline add row at top (click "+ Add Tax" appends new editable row)
- Save inline

---

---

# 📋 MEMBER 3 — Quotations & Subscriptions
## Chatbot Prompt — Copy everything below this line

---

## YOUR TASK
Build the complete **Quotations & Subscriptions** module for **Brightloop**, a SaaS Subscription Management System. You are building both the frontend (React + TypeScript + TailwindCSS v4) and the backend (FastAPI + SQLAlchemy).

## Tech Stack
Same as shared context. Auth (JWT tokens) is handled by Member 1. Products and plans are managed by Member 2 — call their APIs (`/api/plans`, `/api/products`) to populate selectors. Customers are managed by Member 1 — call `/api/customers`.

## Design System
Same as shared context. Use violet for primary, emerald for Active subscriptions, amber for Pending/Draft, sky for Trial, rose for Expired/Closed.

---

## BACKEND — Build these files

### Models

#### `backend/app/models/quotation.py`
```python
# Quotation model:
# id, quotation_number (String, auto-generated e.g. QT-2026-001),
# customer_id (FK → customers.id),
# plan_id (FK → plans.id),
# product_id (FK → products.id),
# quantity (Integer, default 1),
# unit_price (Float),
# discount_amount (Float, default 0),
# tax_amount (Float, default 0),
# total_amount (Float),
# status (enum: 'draft', 'sent', 'accepted', 'expired', 'cancelled'),
# valid_until (Date),
# notes (Text, nullable),
# created_by (FK → users.id),
# created_at, updated_at (DateTime)
```

#### `backend/app/models/subscription.py`
```python
# Subscription model:
# id, subscription_number (auto-generated e.g. SUB-2026-001),
# customer_id (FK → customers.id),
# plan_id (FK → plans.id),
# quotation_id (FK → quotations.id, nullable),
# quantity (Integer, default 1),
# unit_price (Float),
# discount_amount (Float, default 0),
# tax_amount (Float, default 0),
# total_amount (Float),
# status (enum: 'draft', 'confirmed', 'active', 'paused', 'expired', 'closed'),
# start_date (Date),
# end_date (Date, nullable),
# next_billing_date (Date),
# paused_at (DateTime, nullable),
# closed_at (DateTime, nullable),
# close_reason (Text, nullable),
# created_at, updated_at (DateTime)
```

### Services

#### `backend/app/services/quotation_service.py`
```python
# Functions:
# generate_quotation_number(db) → "QT-2026-001" auto-increment
# calculate_quotation_total(unit_price, quantity, discount_amount, tax_rate) → total
# create_quotation(db, data, created_by) → Quotation
# confirm_quotation(db, quotation_id) → updates status, creates Subscription
```

#### `backend/app/services/subscription_service.py`
```python
# Functions:
# generate_subscription_number(db) → "SUB-2026-001"
# create_subscription(db, data) → Subscription
# update_subscription_status(db, sub_id, new_status) → Subscription
# calculate_next_billing_date(start_date, frequency) → next Date
# get_due_for_billing(db) → list of subscriptions where next_billing_date <= today and status == 'active'
```

### API Endpoints

#### `backend/app/api/quotations.py`
```
GET    /api/quotations             → list all, filter by status (query param)
POST   /api/quotations             → create quotation
GET    /api/quotations/:id         → get with customer + plan details
PUT    /api/quotations/:id         → update (only if draft/sent)
DELETE /api/quotations/:id         → soft delete / cancel
POST   /api/quotations/:id/confirm → change status to 'accepted', create subscription
```

#### `backend/app/api/subscriptions.py`
```
GET    /api/subscriptions               → list all, filter: status, customer_id
POST   /api/subscriptions               → create manually (without quotation)
GET    /api/subscriptions/:id           → get with full details
PUT    /api/subscriptions/:id           → update subscription

POST   /api/subscriptions/:id/confirm   → draft → confirmed
POST   /api/subscriptions/:id/activate  → confirmed → active (set start_date)
POST   /api/subscriptions/:id/pause     → active → paused
POST   /api/subscriptions/:id/resume    → paused → active
POST   /api/subscriptions/:id/renew     → extend end_date, reset next_billing_date
POST   /api/subscriptions/:id/close     → close with reason

GET    /api/subscriptions/due-for-billing  → IMPORTANT: returns subscriptions needing invoice (consumed by Member 4)
```

---

## FRONTEND — Build these pages

### `frontend/src/pages/subscriptions/QuotationListPage.tsx`
- Header: "Quotations" + "+ New Quotation" violet button
- Summary pills: All | Draft | Sent | Accepted | Expired (with counts)
- Search + date range filter
- **Table columns:**
  - QT ID (violet link text, e.g. QT-2026-001)
  - Customer name
  - Plan name (violet badge)
  - Amount (₹ formatted)
  - Valid Until (red if past today)
  - Status (badge: Draft=slate, Sent=sky, Accepted=emerald, Expired=rose)
  - Actions: View, Edit, Confirm, Cancel
- Empty state with illustration

### `frontend/src/pages/subscriptions/CreateQuotationPage.tsx`
Multi-step form (3 steps with progress indicator):

**Step 1 — Customer & Plan**
- Customer selector (searchable, calls `/api/customers`) — shows name + email
- Plan selector (calls `/api/plans`) — shows plan cards to pick from
- Quantity input (number)
- Valid Until date picker

**Step 2 — Pricing Summary**
- Auto-populate unit price from selected plan
- Discount field (manual override, ₹ or %)
- Tax selector (calls `/api/taxes`) — auto-calculates tax amount
- Live-updating summary box:
  ```
  Subtotal:     ₹12,499
  Discount:     -₹1,000
  Tax (18%):    +₹2,069
  ─────────────────────
  Total:        ₹13,568
  ```

**Step 3 — Review & Notes**
- Full preview of the quotation (like a real business document)
- Notes textarea
- "Save as Draft" + "Save & Send" buttons

### `frontend/src/pages/subscriptions/QuotationDetailPage.tsx`
- Document-style view of the quotation
- Header: QT number, status badge, date
- Customer info box + Plan info box side by side
- Line items table: Product, Qty, Unit Price, Discount, Tax, Total
- Totals summary on right
- Action buttons based on status:
  - Draft: "Edit" + "Mark as Sent" + "Confirm → Create Subscription"
  - Sent: "Confirm → Create Subscription" + "Mark Expired"
  - Accepted: "View Subscription" link

### `frontend/src/pages/subscriptions/SubscriptionListPage.tsx`
- Header: "Subscriptions" + "+ New Subscription" button
- **Status filter tabs:** All | Active | Paused | Expired | Closed (with colored counts)
- Search by customer name or subscription number
- **Two view modes** (toggle): Table view | Card view

**Table view:**
- Columns: SUB ID, Customer, Plan, Amount/period, Start Date, Next Billing, Status, Actions

**Card view (3 columns grid):**
Each card contains:
- Customer avatar (initials circle, violet bg)
- Customer name + subscription number
- Plan badge (violet pill)
- `01 Jan 2026 → 31 Dec 2026` date range
- Status badge
- `₹12,499 /month` in bold
- Action buttons: Pause | Resume | Renew | Close (show relevant ones based on status)

### `frontend/src/pages/subscriptions/SubscriptionDetailPage.tsx`
- Breadcrumb + "Subscription SUB-2026-001" heading
- Status badge + action buttons row
- **4 info cards:** Customer, Plan, Billing, Dates
- **Status timeline** (vertical stepper):
  - Draft → Confirmed → Active → (Paused?) → Closed
  - Each step shows date it was reached
- Billing history table (calls Member 4's invoice API for this subscription)
- Action buttons:
  - If Active: "Pause", "Renew", "Close"
  - If Paused: "Resume", "Close"
  - If Confirmed: "Activate"

### `frontend/src/pages/subscriptions/CustomerMySubscriptionsPage.tsx`
(Customer-facing view — show when role === 'customer')
- "My Subscriptions" heading
- Cards for each subscription (read-only, no admin actions)
- Each card: plan name, status badge, start/end date, monthly amount, "View Details" button

### Subscription History / Audit Log Component
A reusable `<SubscriptionTimeline />` component showing dated events:
- "Subscription created — 01 Jan 2026"
- "Status changed to Active — 03 Jan 2026"
- "Paused by Admin — 15 Feb 2026"
- "Resumed — 01 Mar 2026"
etc.

---

---

# 💰 MEMBER 4 — Invoices, Payments & Finance
## Chatbot Prompt — Copy everything below this line

---

## YOUR TASK
Build the complete **Invoices, Payments & Finance** module for **Brightloop**, a SaaS Subscription Management System. You are building both the frontend (React + TypeScript + TailwindCSS v4) and the backend (FastAPI + SQLAlchemy).

## Tech Stack
Same as shared context. Auth (JWT) is handled by Member 1. Subscription data is provided by Member 3 — call `/api/subscriptions/due-for-billing` to generate invoices. Customers are from Member 1 (`/api/customers`).

## Design System
Same as shared context. Use violet for primary, emerald for Paid, amber for Pending, rose for Overdue/Cancelled. Finance dashboard should feel data-rich and professional.

---

## BACKEND — Build these files

### Models

#### `backend/app/models/invoice.py`
```python
# Invoice model:
# id, invoice_number (auto-generated e.g. INV-2026-001),
# subscription_id (FK → subscriptions.id),
# customer_id (FK → customers.id),
# issue_date (Date),
# due_date (Date),  ← typically issue_date + 30 days
# subtotal (Float),
# discount_amount (Float, default 0),
# tax_amount (Float, default 0),
# total_amount (Float),
# paid_amount (Float, default 0),
# outstanding_amount (computed: total_amount - paid_amount),
# status (enum: 'draft', 'confirmed', 'paid', 'partially_paid', 'overdue', 'cancelled'),
# notes (Text, nullable),
# created_at, updated_at (DateTime)
```

#### `backend/app/models/payment.py`
```python
# Payment model:
# id, payment_number (auto-generated e.g. PAY-2026-001),
# invoice_id (FK → invoices.id),
# customer_id (FK → customers.id),
# amount (Float),
# payment_date (Date),
# payment_method (enum: 'cash', 'bank_transfer', 'card', 'upi', 'other'),
# reference (String, nullable),  ← transaction ID
# notes (Text, nullable),
# created_at (DateTime)
```

### Services

#### `backend/app/services/invoice_service.py`
```python
# Functions:
# generate_invoice_number(db) → "INV-2026-001"
# generate_invoice_for_subscription(db, subscription) → Invoice
#     → copies amount, customer_id from subscription
#     → sets issue_date=today, due_date=today+30
#     → status = 'draft'
# confirm_invoice(db, invoice_id) → status = 'confirmed'
# cancel_invoice(db, invoice_id) → status = 'cancelled'
# update_paid_status(db, invoice) → recalculate outstanding, set status: paid/partially_paid/overdue
# get_overdue(db) → invoices where due_date < today and status in [confirmed, partially_paid]
```

#### `backend/app/services/payment_service.py`
```python
# Functions:
# generate_payment_number(db) → "PAY-2026-001"
# record_payment(db, invoice_id, amount, method, date, reference) → Payment
#     → creates Payment record
#     → increments invoice.paid_amount
#     → calls update_paid_status
# get_payments_for_invoice(db, invoice_id) → list[Payment]
```

#### `backend/app/services/dashboard_service.py`
```python
# Functions:
# get_finance_stats(db) → dict:
#   {
#     total_revenue: float,        ← sum of all paid invoice amounts
#     outstanding: float,          ← sum of outstanding_amount on unpaid invoices
#     invoices_paid: int,          ← count of paid invoices
#     overdue_count: int,          ← count of overdue invoices
#     active_subscriptions: int,   ← call subscriptions API or join table
#     monthly_revenue: list        ← [{ month, revenue }] last 6 months
#   }
# get_revenue_report(db, from_date, to_date) → grouped by month revenue
```

### API Endpoints

#### `backend/app/api/invoices.py`
```
GET    /api/invoices                    → list all, filter: status, customer_id, date range
POST   /api/invoices/generate           → auto-generate for subscriptions due (calls due-for-billing)
GET    /api/invoices/:id                → get full invoice with payment history
POST   /api/invoices/:id/confirm        → draft → confirmed
POST   /api/invoices/:id/cancel         → cancel invoice
GET    /api/invoices/overdue            → list overdue invoices
```

#### `backend/app/api/payments.py`
```
GET    /api/payments                    → list all payments
POST   /api/payments                    → record a payment (body: invoice_id, amount, method, date, reference)
GET    /api/payments/:id                → get payment detail
GET    /api/invoices/:id/payments       → all payments for a specific invoice
```

#### `backend/app/api/dashboard.py`
```
GET    /api/dashboard/finance           → finance KPIs and monthly revenue
GET    /api/reports/revenue             → revenue report with ?from=&to= filters
```

---

## FRONTEND — Build these pages

### `frontend/src/pages/finance/FinanceDashboardPage.tsx`
This is the most visually impressive page. Build it with:

**KPI Cards Row (4 cards):**
```
Card 1: "Total Revenue"        → ₹4,82,500   +12.8% (emerald)  CircleDollarSign icon (violet bg)
Card 2: "Outstanding"          → ₹87,200     -3.1% (rose)      Clock icon (amber bg)
Card 3: "Invoices Paid"        → 168          +8.2% (emerald)   CheckCircle icon (emerald bg)
Card 4: "Overdue"              → 12           +2 (rose)         AlertCircle icon (rose bg)
```
Each card: white, rounded-2xl, shadow-sm, icon in colored pill, change badge with arrow icon

**Revenue Chart (left 2/3):**
- Recharts AreaChart
- Data: last 6 months revenue
- Violet stroke (#7c3aed), violet-to-transparent gradient fill
- Smooth curve (type="monotone")
- Custom tooltip showing ₹ formatted amount
- "Revenue Overview" title + "Last 6 months" dropdown

**Invoice Status Donut (right 1/3):**
- Recharts PieChart (donut, innerRadius=60, outerRadius=90)
- Segments: Paid (violet), Pending (amber), Overdue (rose)
- Center label showing total invoice count
- Legend below with colored dots

**Recent Invoices Table:**
- "Recent Invoices" title + "View All →" link
- Table: Invoice #, Customer, Subscription Plan, Amount, Due Date, Status badge, Actions

### `frontend/src/pages/finance/InvoiceListPage.tsx`
- Header: "Invoices" + "Generate Invoices" violet button (triggers bulk auto-generation)
- **Status tabs** with counts: All | Draft | Confirmed | Paid | Overdue | Cancelled
- Search + date range filter + customer filter
- Table columns:
  - Invoice # (violet, e.g. INV-2026-042)
  - Customer name
  - Subscription plan
  - Total Amount (₹)
  - Outstanding (₹, shows in rose if > 0)
  - Due Date (red text if overdue)
  - Status (colored badge)
  - Actions: View, Confirm, Record Payment
- Bulk select checkboxes + "Confirm Selected" bulk action

### `frontend/src/pages/finance/InvoiceDetailPage.tsx`
Build a **real invoice document layout** (printable-style):
- Top bar: Invoice #, status badge, action buttons (Confirm / Cancel / Record Payment / Print)
- Invoice header: Brightloop logo left, invoice number + dates right
- Bill To section: customer name, email, company, address
- Line items table:
  - Description (Plan name + subscription period)
  - Quantity, Unit Price, Discount, Tax, Amount
- Totals box (right-aligned):
  ```
  Subtotal:        ₹12,499
  Discount:        -₹1,000
  Tax (18%):       +₹2,069
  ─────────────────────────
  Total:           ₹13,568
  Paid:            ₹5,000
  ─────────────────────────
  Outstanding:     ₹8,568  ← rose colored
  ```
- Payment History section below invoice: table of payments recorded
- "Record Payment" button opens a slide-over

### `frontend/src/pages/finance/RecordPaymentPage.tsx`
Slide-over / modal form:
- Invoice # (pre-filled, read-only)
- Customer (read-only)
- Outstanding Amount (shown prominently)
- Payment Amount (₹, Zod: max = outstanding amount)
- Payment Date (date picker, default today)
- Payment Method (select: Cash / Bank Transfer / Card / UPI / Other)
- Reference / Transaction ID (optional text)
- Notes (optional textarea)
- "Record Payment" violet button
- On success: update invoice status, show toast, refresh invoice

### `frontend/src/pages/finance/PaymentListPage.tsx`
- Header: "Payments"
- Search + filter by method + date range
- Table: PAY #, Invoice #, Customer, Amount (₹), Payment Date, Method (badge), Reference, Actions
- Click → Payment Detail page

### `frontend/src/pages/finance/OverdueInvoicesPage.tsx`
- Header: "Overdue Invoices" with rose-colored alert banner
- Summary: "12 invoices are overdue totalling ₹87,200"
- Table sorted by days overdue (ascending):
  - Invoice #, Customer, Due Date, Days Overdue (rose badge), Outstanding (₹), Actions
- Actions: Record Payment, Send Reminder (stub)

### `frontend/src/pages/finance/RevenueReportPage.tsx`
- Header: "Revenue Reports"
- Filter bar: From Date, To Date, Plan filter → "Apply" button
- **3 charts in a row:**
  - Monthly Revenue bar chart (Recharts BarChart, violet bars)
  - Top Plans pie chart (which plans generate most revenue)
  - Payment Methods donut chart
- Summary table below: Month, Invoices, Total Billed, Total Collected, Outstanding

### `frontend/src/pages/finance/CustomerMyInvoicesPage.tsx`
(Customer-facing — show when role === 'customer')
- "My Invoices" heading
- Cards for each invoice: Invoice #, Period, Amount, Status badge, "Pay Now" / "View" button
- Payment history section below

---

## SHARED COMPONENTS TO BUILD (for all members)

### `frontend/src/components/layout/Sidebar.tsx`
```tsx
// Dark sidebar (#1e1b4b)
// Props: navItems (array of { name, icon, path, badge? })
// Active item: bg-white/10, rounded-xl
// Brightloop logo at top
// User info + logout at bottom
```

### `frontend/src/components/layout/Header.tsx`
```tsx
// Sticky top bar: white/90 backdrop-blur
// Left: hamburger (mobile) + page title
// Right: search bar (hidden mobile) + bell icon (with notification dot) + user avatar
```

### `frontend/src/components/ui/StatusBadge.tsx`
```tsx
type Status = 'active' | 'inactive' | 'pending' | 'accepted' | 'expired' | 
              'confirmed' | 'paid' | 'overdue' | 'cancelled' | 'draft' | 'paused' | 'closed'
// Returns styled badge based on status
```

### `frontend/src/components/ui/SlideOver.tsx`
```tsx
// Right-side slide-over panel with overlay
// Props: isOpen, onClose, title, children
// Animation: translate-x-full to translate-x-0
```

### `frontend/src/components/ui/ConfirmDialog.tsx`
```tsx
// Modal dialog for destructive actions
// Props: isOpen, onClose, onConfirm, title, message, confirmText, variant ('danger'|'warning')
```

### `frontend/src/components/ui/StatCard.tsx`
```tsx
// Props: title, value, change, positive, icon, iconColor
// Renders the KPI card used in dashboards
```

---

## FINAL NOTES FOR ALL CHATBOTS

1. **Always use ₹ (Indian Rupee)** for all currency display: `₹${value.toLocaleString('en-IN')}`
2. **All forms** must use React Hook Form + Zod for validation
3. **All API calls** must use TanStack Query (`useQuery`, `useMutation`) with proper loading/error states
4. **Loading states** should show skeleton loaders (gray pulsing divs) not spinners where possible
5. **Every destructive action** (delete, deactivate, close, cancel) must show a confirm dialog first
6. **Empty states** should show an icon + message + CTA button, never a blank page
7. **Mobile responsive** — sidebar should collapse on mobile, tables should scroll horizontally
8. **Toast notifications** (Sonner) for all success/error states
9. **Date formatting** using date-fns: `format(date, 'dd MMM yyyy')`
10. **Numbers formatting**: always use `toLocaleString('en-IN')` for Indian number format (1,00,000)
