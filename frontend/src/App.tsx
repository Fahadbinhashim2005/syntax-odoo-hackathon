import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from 'react'
import {
  getFinanceDashboard,
  getInvoices,
  getPayments,
  createPayment,
  type FinanceDashboard,
  type Invoice,
  type Payment,
} from './services/api'

type Page = 'Overview' | 'Invoices' | 'Payments' | 'Customers'

const navigation: { name: Page; icon: string; hint: string }[] = [
  { name: 'Overview', icon: '◫', hint: '⌘ 1' },
  { name: 'Invoices', icon: '▤', hint: '⌘ 2' },
  { name: 'Payments', icon: '↗', hint: '⌘ 3' },
  { name: 'Customers', icon: '♙', hint: '⌘ 4' },
]

const money = (value: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

const compactMoney = (value: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0)

const prettyDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const initials = (value: string) =>
  value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'BL'

const normalizedStatus = (status: string, dueDate?: string) => {
  const value = status.toLowerCase()
  if (value.includes('cancel')) return 'Cancelled'
  if (value.includes('paid') || value.includes('settled')) return 'Paid'
  if (value.includes('overdue') || (dueDate && dueDate < new Date().toISOString().slice(0, 10))) return 'Overdue'
  if (value.includes('draft')) return 'Draft'
  return 'Pending'
}

function App() {
  const [activePage, setActivePage] = useState<Page>('Overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [invoicesError, setInvoicesError] = useState<string | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [clock, setClock] = useState(new Date())
  const searchRef = useRef<HTMLInputElement>(null)

  const refreshData = () => {
    setDashboardLoading(true)
    setInvoicesLoading(true)
    getFinanceDashboard()
      .then((data) => { setDashboard(data); setDashboardError(null) })
      .catch((error: unknown) => setDashboardError(error instanceof Error ? error.message : 'Unable to load dashboard data'))
      .finally(() => setDashboardLoading(false))
    getInvoices()
      .then((data) => { setInvoices(data); setInvoicesError(null) })
      .catch((error: unknown) => setInvoicesError(error instanceof Error ? error.message : 'Unable to load invoices'))
      .finally(() => setInvoicesLoading(false))
  }

  useEffect(() => { refreshData() }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
      if (!typing && (event.metaKey || event.ctrlKey) && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault()
        setActivePage(navigation[Number(event.key) - 1].name)
      }
      if (event.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    const status = normalizedStatus(invoice.status, invoice.due_date)
    const query = `${invoice.invoice_number} ${invoice.customer_id} ${invoice.status} ${invoice.total_amount}`.toLowerCase()
    return query.includes(search.toLowerCase()) && (statusFilter === 'All statuses' || status === statusFilter)
  }), [invoices, search, statusFilter])

  const totalRevenue = Number(dashboard?.total_revenue ?? 0)
  const outstanding = Number(dashboard?.total_outstanding ?? 0)
  const billed = totalRevenue + outstanding
  const collectionRate = billed > 0 ? Math.min(100, (totalRevenue / billed) * 100) : 0
  const largestInvoices = [...invoices]
    .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
    .slice(0, 5)
  const maxInvoice = Math.max(...largestInvoices.map((invoice) => Number(invoice.total_amount) || 0), 1)

  const navigate = (page: Page) => {
    setActivePage(page)
    setCommandOpen(false)
    setSearch('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setCursor({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }

  return (
    <div className="brightloop-app">
      <aside className="sidebar">
        <button className="brand-lockup" onClick={() => navigate('Overview')} aria-label="Brightloop home">
          <span className="brand-mark">b<span>.</span></span>
          <span className="brand-copy"><strong>brightloop</strong><small>FINANCE OS</small></span>
          <span className="brand-spark">✳</span>
        </button>

        <div className="workspace-label">WORKSPACE <span>01 / FINANCE</span></div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item, index) => (
            <button
              key={item.name}
              onClick={() => navigate(item.name)}
              className={`nav-item ${activePage === item.name ? 'active' : ''}`}
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {item.name === 'Invoices' && <span className="nav-count">{invoices.length}</span>}
              <span className="nav-hint">{item.hint}</span>
              {activePage === item.name && <span className="nav-active-line" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-health">
          <div className="health-top"><span className="pulse-dot" /> SYSTEM STATUS <span className="health-live">LIVE</span></div>
          <p>All systems in sync.</p>
          <small>Finance data connected to your local API.</small>
          <div className="health-scan"><span /></div>
        </div>
        <div className="sidebar-bottom"><span>BRIGHTLOOP SOFTWARE</span><span>v1.0.0</span></div>
      </aside>

      <main className="main-canvas">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><i>/</i><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <span className="live-status"><span className="pulse-dot" /> API CONNECTED</span>
            <button className="command-trigger" onClick={() => setCommandOpen(true)} aria-label="Open command menu">
              <span>⌕</span><span className="command-label">Quick jump</span><kbd>⌘ K</kbd>
            </button>
            <div className="top-divider" />
            <button className="profile-button" onClick={() => setCommandOpen(true)} aria-label="Open quick actions">
              <span className="avatar">AM</span><span className="profile-copy"><strong>Admin Member</strong><small>Finance team</small></span><span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {activePage === 'Overview' && (
            <>
              <section className="hero-panel" onMouseMove={handlePointerMove} style={{ '--spot-x': `${cursor.x}px`, '--spot-y': `${cursor.y}px` } as CSSProperties}>
                <div className="hero-grid" />
                <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
                <div className="hero-copy">
                  <div className="eyebrow"><span className="eyebrow-line" /> FINANCIAL COMMAND CENTER <span className="eyebrow-year">/ 2026</span></div>
                  <h1>Clarity looks<br />good on <em>you.</em></h1>
                  <p>Your business, in focus. Every invoice, every rupee,<br className="desktop-break" /> one beautifully clear picture.</p>
                  <div className="hero-actions">
                    <button className="button-gold" onClick={() => navigate('Invoices')}>Explore invoices <span>↗</span></button>
                    <button className="button-quiet" onClick={refreshData}><span className={dashboardLoading || invoicesLoading ? 'refresh-spin' : ''}>↻</span> Refresh data</button>
                  </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="art-halo" />
                  <div className="art-ring ring-back" />
                  <div className="art-ring ring-front" />
                  <div className="art-core"><span>₹</span><small>IN FOCUS</small></div>
                  <div className="floating-chip chip-top"><span className="chip-dot" /> REAL-TIME OVERVIEW</div>
                  <div className="floating-chip chip-bottom"><span>↗</span><div><strong>{dashboardLoading ? 'Syncing…' : money(totalRevenue)}</strong><small>Collected to date</small></div></div>
                  <div className="art-cross cross-one">✳</div><div className="art-cross cross-two">+</div>
                </div>
                <div className="hero-foot"><span><span className="pulse-dot" /> LIVE WORKSPACE</span><span>{new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(clock)}</span></div>
              </section>

              <section className="metrics-section">
                <div className="section-heading"><div><span className="section-kicker">THE BIG PICTURE</span><h2>Your numbers, <em>without the noise.</em></h2></div><span className="section-meta">01 — OVERVIEW</span></div>
                {dashboardError && <div className="inline-alert"><span>!</span><div><strong>Couldn't load finance data</strong><small>{dashboardError}</small></div><button onClick={refreshData}>Try again ↗</button></div>}
                <div className="metrics-grid">
                  <MetricCard index="01" title="Total revenue" amount={dashboard ? money(dashboard.total_revenue) : '—'} note="Payments received" icon="↗" featured loading={dashboardLoading} />
                  <MetricCard index="02" title="Outstanding" amount={dashboard ? money(dashboard.total_outstanding) : '—'} note="Awaiting collection" icon="◷" loading={dashboardLoading} />
                  <MetricCard index="03" title="Paid invoices" amount={dashboard ? String(dashboard.paid_invoices) : '—'} note="Successfully settled" icon="✓" loading={dashboardLoading} />
                  <MetricCard index="04" title="Overdue amount" amount={dashboard ? money(dashboard.overdue_amount) : '—'} note={`${dashboard?.overdue_invoice_count ?? '—'} invoices need attention`} icon="!" warning loading={dashboardLoading} />
                </div>
              </section>

              <section className="insights-grid">
                <div className="panel invoice-analytics">
                  <div className="panel-heading"><div><span className="section-kicker">PORTFOLIO BREAKDOWN</span><h3>Biggest invoices <span className="heading-dot">.</span></h3><p>Where the value is concentrated.</p></div><span className="panel-index">02 / 04</span></div>
                  {invoicesLoading ? <div className="skeleton-stack">{[1, 2, 3, 4].map((n) => <div className="skeleton-row" key={n} />)}</div> : invoicesError ? <EmptyState title="Invoice data unavailable" detail={invoicesError} action="Retry" onAction={refreshData} /> : largestInvoices.length === 0 ? <EmptyState title="Nothing billed just yet" detail="Your invoices will appear here once you create the first one." action="View invoices" onAction={() => navigate('Invoices')} /> : (
                    <div className="invoice-bars">
                      {largestInvoices.map((invoice, index) => (
                        <button className="invoice-bar-row" key={invoice.id} onClick={() => navigate('Invoices')} title={`Open invoices · ${invoice.invoice_number}`}>
                          <span className="bar-rank">0{index + 1}</span>
                          <span className="bar-main"><span className="bar-label">{invoice.invoice_number}</span><span className="bar-track"><span className="bar-fill" style={{ '--bar-width': `${Math.max(4, (Number(invoice.total_amount) / maxInvoice) * 100)}%`, '--bar-delay': `${index * 90}ms` } as CSSProperties} /></span></span>
                          <span className="bar-value">{compactMoney(invoice.total_amount)}</span><span className="bar-arrow">↗</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="panel-footer"><span><span className="legend-dot" /> Invoice value</span><button onClick={() => navigate('Invoices')}>All invoices <span>↗</span></button></div>
                </div>

                <div className="collection-panel" onMouseMove={handlePointerMove} style={{ '--spot-x': `${cursor.x}px`, '--spot-y': `${cursor.y}px` } as CSSProperties}>
                  <div className="collection-top"><span className="section-kicker">COLLECTION HEALTH</span><span className="collection-symbol">◉</span></div>
                  <div className="collection-rate">{dashboardLoading ? '—' : <>{collectionRate.toFixed(1)}<span>%</span></>}</div>
                  <p className="collection-caption">of billed revenue collected</p>
                  <div className="collection-progress"><span style={{ width: `${dashboardLoading ? 0 : collectionRate}%` }} /></div>
                  <div className="collection-stats">
                    <div><span>Collected</span><strong>{dashboard ? money(totalRevenue) : '—'}</strong></div>
                    <div><span>Still outstanding</span><strong>{dashboard ? money(outstanding) : '—'}</strong></div>
                    <div className="collection-total"><span>Total billed</span><strong>{dashboard ? money(billed) : '—'}</strong></div>
                  </div>
                  <div className="collection-watermark">b.</div>
                  <div className="collection-foot"><span className="pulse-dot" /> Calculated from live finance data</div>
                </div>
              </section>

              <section className="panel recent-panel">
                <div className="panel-heading recent-heading"><div><span className="section-kicker">LATEST ACTIVITY</span><h3>Recent invoices<span className="heading-dot">.</span></h3><p>A live window into your billing activity.</p></div><button className="button-outline" onClick={() => navigate('Invoices')}>View all invoices <span>↗</span></button></div>
                <InvoiceTable invoices={filteredInvoices.slice(0, 5)} loading={invoicesLoading} error={invoicesError} formatMoney={money} onRetry={refreshData} />
              </section>

              <Footer />
            </>
          )}

          {activePage === 'Invoices' && (
            <>
              <section className="page-intro">
                <div><div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> BILLING WORKSPACE / 01</div><h1>Every detail.<br /><em>Accounted for.</em></h1><p>One place for every invoice, status, and outstanding rupee.</p></div>
                <div className="page-intro-stat"><span>INVOICE REGISTER</span><strong>{invoicesLoading ? '—' : String(invoices.length).padStart(2, '0')}</strong><small>Total records retrieved</small></div>
              </section>
              <section className="invoice-page-panel panel">
                <div className="invoice-toolbar"><div><span className="section-kicker">THE REGISTER</span><h3>All invoices<span className="heading-dot">.</span></h3></div><div className="invoice-controls"><label className="search-box"><span>⌕</span><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice, customer ID…" /><kbd>/</kbd></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by invoice status"><option>All statuses</option><option>Paid</option><option>Pending</option><option>Overdue</option><option>Cancelled</option><option>Draft</option></select></div></div>
                <div className="register-summary"><span><strong>{filteredInvoices.length}</strong> results</span><span>Synced from FastAPI <span className="pulse-dot" /></span></div>
                <InvoiceTable invoices={filteredInvoices} loading={invoicesLoading} error={invoicesError} formatMoney={money} onRetry={refreshData} />
                <div className="register-footer"><span>Showing {filteredInvoices.length} of {invoices.length} invoices</span><button onClick={refreshData}><span className={invoicesLoading ? 'refresh-spin' : ''}>↻</span> Refresh register</button></div>
              </section>
              <Footer />
            </>
          )}

          {activePage === 'Payments' && (
            <PaymentsWorkspace invoices={invoices} invoicesLoading={invoicesLoading} onPaymentSaved={refreshData} />
          )}
          {activePage === 'Customers' && (
            <ModulePlaceholder icon="♙" number="03" eyebrow="CUSTOMER DIRECTORY" title={<>Relationships,<br /><em>beautifully organized.</em></>} description="The customer directory can be connected as soon as the customer-list endpoint is available in your backend." />
          )}
        </div>
      </main>

      {commandOpen && (
        <div className="command-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false) }}>
          <div className="command-modal" role="dialog" aria-modal="true" aria-label="Quick navigation">
            <div className="command-modal-top"><span>✳</span><input autoFocus placeholder="Where would you like to go?" onChange={(event) => setCommandQuery(event.target.value)} value={commandQuery} /><kbd>ESC</kbd></div>
            <div className="command-group-label">NAVIGATION</div>
            {navigation.filter((item) => item.name.toLowerCase().includes(commandQuery.toLowerCase())).map((item) => (
              <button className="command-option" key={item.name} onClick={() => { navigate(item.name); setCommandQuery('') }}><span className="command-option-icon">{item.icon}</span><span>{item.name}</span><kbd>{item.hint}</kbd><span className="command-option-arrow">↗</span></button>
            ))}
            <div className="command-modal-footer"><span>↑↓ Navigate</span><span>↵ Select</span><span>ESC Close</span></div>
          </div>
        </div>
      )}
    </div>
  )
}


function PaymentsWorkspace({ invoices, invoicesLoading, onPaymentSaved }: {
  invoices: Invoice[]; invoicesLoading: boolean; onPaymentSaved: () => void
}) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('All methods')
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('UPI')
  const [reference, setReference] = useState('')

  const loadPayments = async () => {
    setLoading(true)
    try {
      const data = await getPayments()
      setPayments(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load payments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadPayments() }, [])

  const eligibleInvoices = invoices.filter((invoice) =>
    ['confirmed', 'partially_paid'].includes(invoice.status.toLowerCase()) && Number(invoice.outstanding_amount) > 0
  )
  const selectedInvoice = eligibleInvoices.find((invoice) => String(invoice.id) === invoiceId)
  const totalReceived = payments.filter((payment) => payment.status.toLowerCase() === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount), 0)
  const completedCount = payments.filter((payment) => payment.status.toLowerCase() === 'completed').length
  const averagePayment = completedCount ? totalReceived / completedCount : 0
  const methods = [...new Set(payments.map((payment) => payment.payment_method))]
  const visiblePayments = payments.filter((payment) => {
    const invoice = invoices.find((item) => item.id === payment.invoice_id)
    const needle = query.trim().toLowerCase()
    const matchesQuery = !needle || [String(payment.id), String(payment.invoice_id), invoice?.invoice_number ?? '', payment.transaction_reference ?? '', payment.payment_method]
      .some((value) => value.toLowerCase().includes(needle))
    const matchesMethod = methodFilter === 'All methods' || payment.payment_method === methodFilter
    return matchesQuery && matchesMethod
  })

  const resetForm = () => {
    setInvoiceId(''); setAmount(''); setMethod('UPI'); setReference(''); setFormError(null)
  }

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null); setSuccess(null)
    if (!selectedInvoice) { setFormError('Choose an eligible confirmed invoice.'); return }
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) { setFormError('Enter a payment amount greater than zero.'); return }
    if (numericAmount > Number(selectedInvoice.outstanding_amount)) { setFormError(`Amount exceeds the outstanding balance of ${money(selectedInvoice.outstanding_amount)}.`); return }
    setSaving(true)
    try {
      const payment = await createPayment({
        invoice_id: selectedInvoice.id,
        amount: numericAmount,
        payment_method: method,
        transaction_reference: reference.trim() || null,
      })
      setSuccess(`Payment #${payment.id} recorded successfully.`)
      resetForm()
      setFormOpen(false)
      await loadPayments()
      onPaymentSaved()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Payment could not be recorded.')
    } finally {
      setSaving(false)
    }
  }

  return <>
    <section className="page-intro payments-intro">
      <div><div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> FINANCE WORKSPACE / 02</div><h1>Money in motion.<br /><em>Every move, visible.</em></h1><p>A live record of incoming payments, tied back to the invoices they settle.</p></div>
      <div className="page-intro-stat"><span>PAYMENT REGISTER</span><strong>{loading ? '—' : String(payments.length).padStart(2, '0')}</strong><small>Transactions retrieved</small></div>
    </section>

    <section className="payment-metrics">
      <article className="payment-metric payment-metric-featured"><span className="payment-metric-label">TOTAL RECEIVED</span><strong>{loading ? '—' : money(totalReceived)}</strong><small>Completed transactions only</small><span className="payment-metric-icon">↗</span></article>
      <article className="payment-metric"><span className="payment-metric-label">TRANSACTIONS</span><strong>{loading ? '—' : payments.length}</strong><small>All recorded payments</small><span className="payment-metric-icon">▤</span></article>
      <article className="payment-metric"><span className="payment-metric-label">COMPLETED</span><strong>{loading ? '—' : completedCount}</strong><small>Successfully recorded</small><span className="payment-metric-icon">✓</span></article>
      <article className="payment-metric"><span className="payment-metric-label">AVERAGE PAYMENT</span><strong>{loading ? '—' : money(averagePayment)}</strong><small>Across completed payments</small><span className="payment-metric-icon">◷</span></article>
    </section>

    {success && <div className="payment-success" role="status"><span>✓</span>{success}<button onClick={() => setSuccess(null)} aria-label="Dismiss message">×</button></div>}
    <section className="panel payments-register panel">
      <div className="invoice-toolbar payment-toolbar"><div><span className="section-kicker">THE LEDGER</span><h3>Payment activity<span className="heading-dot">.</span></h3><p>Each entry is retrieved directly from your backend.</p></div><div className="invoice-controls payment-controls"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payment, invoice, reference…" /><kbd>/</kbd></label><select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)} aria-label="Filter by payment method"><option>All methods</option>{methods.map((item) => <option key={item}>{item}</option>)}</select><button className="payment-primary-button" onClick={() => { setFormOpen((open) => !open); setFormError(null) }}>{formOpen ? 'Close form ×' : '+ Record payment'}</button></div></div>

      {formOpen && <form className="payment-form" onSubmit={submitPayment}>
        <div className="payment-form-heading"><div><span className="section-kicker">NEW TRANSACTION</span><h3>Record a payment<span className="heading-dot">.</span></h3></div><span className="payment-form-note">Only confirmed invoices with a balance are eligible.</span></div>
        <div className="payment-form-grid">
          <label className="payment-field payment-field-wide"><span>INVOICE</span><select required value={invoiceId} onChange={(event) => { setInvoiceId(event.target.value); setAmount('') }} disabled={invoicesLoading || eligibleInvoices.length === 0}><option value="">{invoicesLoading ? 'Loading invoices…' : eligibleInvoices.length ? 'Choose an invoice' : 'No eligible invoices'}</option>{eligibleInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · Customer #{invoice.customer_id} · Due {money(invoice.outstanding_amount)}</option>)}</select>{selectedInvoice && <small>Outstanding balance: <strong>{money(selectedInvoice.outstanding_amount)}</strong></small>}</label>
          <label className="payment-field"><span>AMOUNT (INR)</span><input required type="number" min="0.01" step="0.01" max={selectedInvoice?.outstanding_amount} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
          <label className="payment-field"><span>PAYMENT METHOD</span><select value={method} onChange={(event) => setMethod(event.target.value)}><option>UPI</option><option>Bank Transfer</option><option>Credit Card</option><option>Debit Card</option><option>Cash</option><option>Cheque</option><option>Other</option></select></label>
          <label className="payment-field payment-field-wide"><span>TRANSACTION REFERENCE <small>OPTIONAL</small></span><input maxLength={100} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. UPI reference or bank transaction ID" /></label>
        </div>
        {formError && <div className="payment-form-error" role="alert">! {formError}</div>}
        <div className="payment-form-actions"><span>Payment will be saved as completed by the backend.</span><button className="payment-primary-button" type="submit" disabled={saving || invoicesLoading || eligibleInvoices.length === 0}>{saving ? 'Saving payment…' : 'Confirm payment ↗'}</button></div>
      </form>}

      {error && <div className="inline-alert"><span>!</span><div><strong>Couldn't load payments</strong><small>{error}</small></div><button onClick={() => void loadPayments()}>Try again ↗</button></div>}
      <div className="register-summary"><span><strong>{visiblePayments.length}</strong> results <span className="payment-summary-muted">/ {payments.length} total</span></span><span>FastAPI · /api/payments <span className="pulse-dot" /></span></div>
      {loading ? <div className="skeleton-stack table-skeleton">{[1, 2, 3, 4].map((n) => <div className="skeleton-row" key={n} />)}</div> : !error && visiblePayments.length === 0 ? <div className="empty-state"><div className="empty-orbit"><span>↗</span></div><h4>{payments.length ? 'No matching transactions.' : 'The ledger starts here.'}</h4><p>{payments.length ? 'Try a different search or payment method.' : 'No payments have been recorded yet. Once a payment is saved, it will appear here from your backend.'}</p>{payments.length > 0 ? <button onClick={() => { setQuery(''); setMethodFilter('All methods') }}>Clear filters ↗</button> : <button onClick={() => setFormOpen(true)}>Record first payment ↗</button>}</div> : !error && <div className="table-scroll"><table className="invoice-table payment-table"><thead><tr><th>PAYMENT</th><th>INVOICE / CUSTOMER</th><th>DATE</th><th>METHOD</th><th>REFERENCE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{visiblePayments.map((payment, index) => {
        const invoice = invoices.find((item) => item.id === payment.invoice_id)
        const status = payment.status.toLowerCase() === 'completed' ? 'Completed' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
        return <tr key={payment.id} style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}><td><div className="payment-id"><span className="payment-id-icon">↗</span><strong>PAY-{String(payment.id).padStart(4, '0')}</strong></div></td><td><div className="invoice-identity"><span className="invoice-avatar">{initials(invoice?.invoice_number ?? `Invoice ${payment.invoice_id}`)}</span><span><strong>{invoice?.invoice_number ?? `Invoice #${payment.invoice_id}`}</strong><small>{invoice ? `Customer #${invoice.customer_id}` : `Invoice ID ${payment.invoice_id}`}</small></span></div></td><td>{new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(payment.payment_date))}</td><td><span className="payment-method-pill">{payment.payment_method}</span></td><td className="payment-reference">{payment.transaction_reference || '—'}</td><td className="invoice-amount">{money(payment.amount)}</td><td><StatusBadge status={status} /></td></tr>
      })}</tbody></table></div>}
      <div className="register-footer"><span>Showing {visiblePayments.length} of {payments.length} payments</span><button onClick={() => void loadPayments()}><span className={loading ? 'refresh-spin' : ''}>↻</span> Refresh ledger</button></div>
    </section>
    <Footer />
  </>
}

function MetricCard({ index, title, amount, note, icon, featured = false, warning = false, loading = false }: {
  index: string; title: string; amount: string; note: string; icon: string; featured?: boolean; warning?: boolean; loading?: boolean
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  return (
    <article className={`metric-card ${featured ? 'metric-featured' : ''} ${warning ? 'metric-warning' : ''}`} onMouseMove={(event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const rect = event.currentTarget.getBoundingClientRect()
      setTilt({ x: ((event.clientX - rect.left) / rect.width - 0.5) * 5, y: ((event.clientY - rect.top) / rect.height - 0.5) * -5 })
    }} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}>
      <div className="metric-card-glow" /><div className="metric-top"><span className="metric-index">{index} / 04</span><span className="metric-icon">{icon}</span></div>
      <p className="metric-title">{title}</p>
      <div className={`metric-value ${loading ? 'value-loading' : ''}`}>{amount}</div>
      <div className="metric-bottom"><span className="metric-note-dot" /><span>{note}</span><span className="metric-arrow">↗</span></div>
      <span className="metric-watermark">{index}</span>
    </article>
  )
}

function InvoiceTable({ invoices, loading, error, formatMoney, onRetry }: {
  invoices: Invoice[]; loading: boolean; error: string | null; formatMoney: (value: string | number) => string; onRetry: () => void
}) {
  if (loading) return <div className="skeleton-stack table-skeleton">{[1, 2, 3, 4].map((n) => <div className="skeleton-row" key={n} />)}</div>
  if (error) return <EmptyState title="We couldn't reach your invoice register" detail={error} action="Retry connection" onAction={onRetry} />
  if (!invoices.length) return <EmptyState title="A clean slate." detail="No invoices match this view. Create one through your backend workflow and it will appear here." action="Refresh data" onAction={onRetry} />
  return (
    <div className="table-scroll"><table className="invoice-table"><thead><tr><th>INVOICE / CUSTOMER</th><th>ISSUED</th><th>DUE DATE</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead>
      <tbody>{invoices.map((invoice, index) => {
        const status = normalizedStatus(invoice.status, invoice.due_date)
        return <tr key={invoice.id} style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}>
          <td><div className="invoice-identity"><span className="invoice-avatar">{initials(`Customer ${invoice.customer_id}`)}</span><span><strong>{invoice.invoice_number}</strong><small>Customer #{invoice.customer_id}</small></span></div></td>
          <td>{prettyDate(invoice.issue_date)}</td><td>{prettyDate(invoice.due_date)}</td><td className="invoice-amount">{formatMoney(invoice.total_amount)}</td>
          <td><StatusBadge status={status} /></td><td><span className="row-arrow">↗</span></td>
        </tr>
      })}</tbody>
    </table></div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span />{status}</span>
}

function EmptyState({ title, detail, action, onAction }: { title: string; detail: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><div className="empty-orbit"><span>↗</span></div><h4>{title}</h4><p>{detail}</p><button onClick={onAction}>{action} <span>↗</span></button></div>
}

function ModulePlaceholder({ icon, number, eyebrow, title, description }: { icon: string; number: string; eyebrow: string; title: ReactNode; description: string }) {
  return <><section className="page-intro"><div><div className="eyebrow light-eyebrow"><span className="eyebrow-line" /> {eyebrow} / {number}</div><h1>{title}</h1><p>{description}</p></div><div className="page-intro-stat"><span>MODULE STATUS</span><strong>SOON<span>.</span></strong><small>Backend integration pending</small></div></section><div className="module-stage"><div className="module-grid" /><div className="module-symbol">{icon}</div><span className="module-orbit module-orbit-a" /><span className="module-orbit module-orbit-b" /><div className="module-copy"><span className="section-kicker">NEXT IN THE WORKSPACE</span><h2>Built to feel effortless.</h2><p>{description}</p><span className="module-progress"><i /></span><small>DESIGNED · AWAITING API CONNECTION</small></div><span className="module-number">{number}</span></div><Footer /></>
}

function Footer() {
  return <footer className="app-footer"><span><span className="footer-mark">b.</span> BRIGHTLOOP SOFTWARE <span className="footer-separator">/</span> FINANCE OS</span><span>Designed for clarity. Built for momentum. <span className="footer-star">✳</span></span></footer>
}

export default App
