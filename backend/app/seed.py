from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.customer import Customer
from app.models.product import Product
from app.models.variant import ProductVariant
from app.models.plan import Plan
from app.models.discount import Discount
from app.models.tax import Tax
from app.models.quotation import Quotation
from app.models.subscription import Subscription
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.core.security import hash_password

def seed_database(db: Session):
    # Check if admin user already exists
    if db.query(User).filter(User.email == "admin@brightloop.com").first():
        return

    print("Seeding initial data for Brightloop...")

    # 1. Users
    admin_user = User(
        name="Alex Morgan (Admin)",
        email="admin@brightloop.com",
        hashed_password=hash_password("admin123"),
        role="admin",
        is_active=True
    )
    staff_user = User(
        name="Rohan Verma",
        email="staff@brightloop.com",
        hashed_password=hash_password("staff123"),
        role="staff",
        is_active=True
    )
    customer_user = User(
        name="Priya Sharma",
        email="customer@acme.com",
        hashed_password=hash_password("customer123"),
        role="customer",
        is_active=True
    )
    db.add_all([admin_user, staff_user, customer_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(staff_user)
    db.refresh(customer_user)

    # 2. Customers
    cust1 = Customer(
        user_id=customer_user.id,
        name="Priya Sharma",
        email="customer@acme.com",
        phone="+91 98765 43210",
        company="Acme Corp India",
        address="Tower 4, Cyber City, Gurugram, HR",
        is_active=True
    )
    cust2 = Customer(
        name="Karan Singhania",
        email="karan@nexus.io",
        phone="+91 98111 22334",
        company="Nexus Dynamics",
        address="Brigade Tech Park, Whitefield, Bengaluru, KA",
        is_active=True
    )
    cust3 = Customer(
        name="Aanya Patel",
        email="aanya@stellar.tech",
        phone="+91 99887 76655",
        company="Stellar Tech Labs",
        address="Bandra Kurla Complex, Mumbai, MH",
        is_active=True
    )
    cust4 = Customer(
        name="Vikramaditya Roy",
        email="vikram@orbitmedia.in",
        phone="+91 91234 56789",
        company="Orbit Media Digital",
        address="Sector V, Salt Lake, Kolkata, WB",
        is_active=False
    )
    db.add_all([cust1, cust2, cust3, cust4])
    db.commit()
    db.refresh(cust1)
    db.refresh(cust2)
    db.refresh(cust3)

    # 3. Products & Variants
    p1 = Product(
        name="Brightloop Cloud Platform",
        description="Comprehensive subscription management, billing engine, and automated recurring invoices.",
        product_type="service",
        sales_price=6999.0,
        cost_price=1200.0,
        is_active=True
    )
    p2 = Product(
        name="Developer API Engine",
        description="High-throughput REST and Webhook infrastructure for instant CRM syncing.",
        product_type="service",
        sales_price=2499.0,
        cost_price=500.0,
        is_active=True
    )
    p3 = Product(
        name="Enterprise Dedicated Server",
        description="Isolated VPC hosting, SLA 99.99%, custom domain routing.",
        product_type="service",
        sales_price=18999.0,
        cost_price=4500.0,
        is_active=True
    )
    db.add_all([p1, p2, p3])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)
    db.refresh(p3)

    v1 = ProductVariant(product_id=p1.id, name="Multi-Tenant Cloud", additional_price=0.0, is_active=True)
    v2 = ProductVariant(product_id=p1.id, name="Private Sandbox Included", additional_price=1500.0, is_active=True)
    v3 = ProductVariant(product_id=p2.id, name="100k API Calls / mo", additional_price=0.0, is_active=True)
    v4 = ProductVariant(product_id=p2.id, name="1M API Calls / mo", additional_price=3000.0, is_active=True)
    db.add_all([v1, v2, v3, v4])
    db.commit()

    # 4. Subscription Plans
    plan1 = Plan(
        name="Starter Plan",
        description="Perfect for early startups and small businesses managing up to 100 subscriptions.",
        product_id=p2.id,
        billing_frequency="monthly",
        price=2499.0,
        min_quantity=1,
        is_active=True
    )
    plan2 = Plan(
        name="Professional Plan",
        description="Most popular for growing SaaS teams with advanced billing rules and taxes.",
        product_id=p1.id,
        billing_frequency="monthly",
        price=6999.0,
        min_quantity=1,
        is_active=True
    )
    plan3 = Plan(
        name="Enterprise Suite",
        description="For high-volume enterprises requiring dedicated priority support and custom SLA.",
        product_id=p3.id,
        billing_frequency="monthly",
        price=18999.0,
        min_quantity=1,
        is_active=True
    )
    plan4 = Plan(
        name="Annual Growth Accelerator",
        description="12 months of Professional tier with 2 months free equivalent savings.",
        product_id=p1.id,
        billing_frequency="yearly",
        price=69999.0,
        min_quantity=1,
        is_active=True
    )
    db.add_all([plan1, plan2, plan3, plan4])
    db.commit()
    db.refresh(plan1)
    db.refresh(plan2)
    db.refresh(plan3)
    db.refresh(plan4)

    # 5. Taxes & Discounts
    tax1 = Tax(name="GST 18%", percentage=18.0, is_active=True)
    tax2 = Tax(name="GST 12%", percentage=12.0, is_active=True)
    tax3 = Tax(name="Zero Tax (Export)", percentage=0.0, is_active=True)
    db.add_all([tax1, tax2, tax3])

    disc1 = Discount(name="Launch Hackathon Offer 10%", discount_type="percentage", value=10.0, applicable_to="all", is_active=True)
    disc2 = Discount(name="Early Bird Cash Credit", discount_type="fixed", value=1000.0, applicable_to="plan", applicable_id=plan2.id, is_active=True)
    db.add_all([disc1, disc2])
    db.commit()

    # 6. Quotation
    qt1 = Quotation(
        quotation_number="QT-2026-001",
        customer_id=cust2.id,
        plan_id=plan2.id,
        product_id=p1.id,
        quantity=1,
        unit_price=6999.0,
        discount_amount=500.0,
        tax_amount=1169.82,
        total_amount=7668.82,
        status="sent",
        valid_until=date.today() + timedelta(days=20),
        notes="Includes 1 month complimentary migration assistance.",
        created_by=admin_user.id
    )
    qt2 = Quotation(
        quotation_number="QT-2026-002",
        customer_id=cust3.id,
        plan_id=plan3.id,
        product_id=p3.id,
        quantity=1,
        unit_price=18999.0,
        discount_amount=1000.0,
        tax_amount=3239.82,
        total_amount=21238.82,
        status="draft",
        valid_until=date.today() + timedelta(days=15),
        notes="Custom SLA pending client review.",
        created_by=staff_user.id
    )
    db.add_all([qt1, qt2])
    db.commit()

    # 7. Subscriptions
    sub1 = Subscription(
        subscription_number="SUB-2026-001",
        customer_id=cust1.id,
        plan_id=plan2.id,
        quantity=1,
        unit_price=6999.0,
        discount_amount=0.0,
        tax_amount=1259.82,
        total_amount=8258.82,
        status="active",
        start_date=date.today() - timedelta(days=60),
        end_date=date.today() + timedelta(days=305),
        next_billing_date=date.today() + timedelta(days=5)
    )
    sub2 = Subscription(
        subscription_number="SUB-2026-002",
        customer_id=cust2.id,
        plan_id=plan1.id,
        quantity=2,
        unit_price=2499.0,
        discount_amount=200.0,
        tax_amount=863.64,
        total_amount=5661.64,
        status="active",
        start_date=date.today() - timedelta(days=30),
        end_date=None,
        next_billing_date=date.today() - timedelta(days=2)  # Due for billing!
    )
    sub3 = Subscription(
        subscription_number="SUB-2026-003",
        customer_id=cust3.id,
        plan_id=plan3.id,
        quantity=1,
        unit_price=18999.0,
        discount_amount=1000.0,
        tax_amount=3239.82,
        total_amount=21238.82,
        status="paused",
        start_date=date.today() - timedelta(days=45),
        end_date=None,
        next_billing_date=date.today() + timedelta(days=15)
    )
    db.add_all([sub1, sub2, sub3])
    db.commit()
    db.refresh(sub1)
    db.refresh(sub2)

    # 8. Invoices & Payments
    # Invoice 1 - Paid
    inv1 = Invoice(
        invoice_number="INV-2026-001",
        subscription_id=sub1.id,
        customer_id=cust1.id,
        issue_date=date.today() - timedelta(days=60),
        due_date=date.today() - timedelta(days=30),
        subtotal=6999.0,
        discount_amount=0.0,
        tax_amount=1259.82,
        total_amount=8258.82,
        paid_amount=8258.82,
        status="paid",
        notes="Cycle 1 billing - Paid via UPI"
    )
    db.add(inv1)
    db.commit()
    db.refresh(inv1)

    pay1 = Payment(
        payment_number="PAY-2026-001",
        invoice_id=inv1.id,
        customer_id=cust1.id,
        amount=8258.82,
        payment_date=date.today() - timedelta(days=58),
        payment_method="upi",
        reference="UPI/6129847192",
        notes="Full payment received"
    )
    db.add(pay1)

    # Invoice 2 - Confirmed / Partially Paid
    inv2 = Invoice(
        invoice_number="INV-2026-002",
        subscription_id=sub1.id,
        customer_id=cust1.id,
        issue_date=date.today() - timedelta(days=5),
        due_date=date.today() + timedelta(days=25),
        subtotal=6999.0,
        discount_amount=0.0,
        tax_amount=1259.82,
        total_amount=8258.82,
        paid_amount=3000.0,
        status="partially_paid",
        notes="Cycle 2 billing - advance installment received"
    )
    db.add(inv2)
    db.commit()
    db.refresh(inv2)

    pay2 = Payment(
        payment_number="PAY-2026-002",
        invoice_id=inv2.id,
        customer_id=cust1.id,
        amount=3000.0,
        payment_date=date.today() - timedelta(days=2),
        payment_method="card",
        reference="TXN-49102-VISA",
        notes="Partial advance payment"
    )
    db.add(pay2)

    # Invoice 3 - Overdue
    inv3 = Invoice(
        invoice_number="INV-2026-003",
        subscription_id=sub2.id,
        customer_id=cust2.id,
        issue_date=date.today() - timedelta(days=40),
        due_date=date.today() - timedelta(days=10),
        subtotal=4998.0,
        discount_amount=200.0,
        tax_amount=863.64,
        total_amount=5661.64,
        paid_amount=0.0,
        status="overdue",
        notes="First month bill - pending client accounts processing"
    )
    db.add(inv3)
    db.commit()

    print("Initial database seed successfully completed!")
