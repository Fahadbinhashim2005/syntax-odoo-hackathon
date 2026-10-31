from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    invoice_number: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )

    customer_id: Mapped[int] = mapped_column(Integer, nullable=False)

    issue_date: Mapped[date] = mapped_column(Date, default=date.today)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20), default="draft", nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    items: Mapped[list["InvoiceItem"]] = relationship(
        back_populates="invoice",
        cascade="all, delete-orphan",
    )

    payments: Mapped[list["Payment"]] = relationship(
        back_populates="invoice"
    )

    @property
    def paid_amount(self) -> Decimal:
        return sum(
            (
                payment.amount
                for payment in self.payments
                if payment.status == "completed"
            ),
            Decimal("0.00"),
        )

    @property
    def outstanding_amount(self) -> Decimal:
        outstanding = self.total_amount - self.paid_amount
        return max(outstanding, Decimal("0.00"))


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id"), nullable=False
    )

    description: Mapped[str] = mapped_column(String(255), nullable=False)

    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )

    invoice: Mapped["Invoice"] = relationship(back_populates="items")