import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Eye,
  EyeOff,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
  UsersRound,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import { api, getApiError } from './services/api'
import type { DashboardStats, User, UserRole } from './types'

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`brand ${inverse ? 'brand-inverse' : ''}`}>
      <span className="brand-mark">b</span>
      <span>brightloop</span>
    </div>
  )
}

function Notice({ children, kind = 'error' }: { children: ReactNode; kind?: 'error' | 'success' }) {
  return <div className={`notice notice-${kind}`} role="status">{children}</div>
}

function PasswordInput({ label, value, onChange, autoComplete }: {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="field">
      <span>{label}</span>
      <span className="input-wrap">
        <LockKeyhole size={17} aria-hidden="true" />
        <input
          required
          type={visible ? 'text' : 'password'}
          value={value}
          minLength={8}
          maxLength={128}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
        <button className="input-action" type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  )
}

function AuthFrame({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <main className="auth-page">
      <aside className="auth-visual">
        <div className="auth-visual-inner">
          <Brand inverse />
          <div className="visual-copy">
            <span className="eyebrow eyebrow-gold">SUBSCRIPTION MANAGEMENT</span>
            <h1>Bring every relationship into focus.</h1>
            <p>A considered space to manage the people and plans that keep your business moving.</p>
            <div className="visual-rule"><span /></div>
            <div className="visual-caption"><ShieldCheck size={18} /> Thoughtful tools. Clear decisions.</div>
          </div>
          <div className="auth-visual-footer">A little more clarity, every day.</div>
        </div>
      </aside>
      <section className="auth-main">
        <div className="auth-form-container">
          <div className="auth-mobile-brand"><Brand /></div>
          <span className="eyebrow">WELCOME TO BRIGHTLOOP</span>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          <p className="auth-footnote"><LockKeyhole size={14} /> Your information is protected and kept private.</p>
        </div>
      </section>
    </main>
  )
}

export function LoginPage({ portalRole }: { portalRole?: 'admin' | 'customer' } = {}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message

  useEffect(() => {
    if (user) {
      const destination = user.must_change_password ? '/admin/change-password' : user.role === 'admin' ? '/admin/dashboard' : user.role === 'customer' ? '/customer/dashboard' : '/dashboard'
      navigate(destination, { replace: true })
    }
  }, [navigate, user])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (portalRole && data.user.role !== portalRole) {
        setError(portalRole === 'admin' ? 'This account does not have administrator access.' : 'This account is not a customer account. Use the appropriate portal.')
        return
      }
      signIn(data, remember)
      const destination = data.user.must_change_password ? '/admin/change-password' : data.user.role === 'admin' ? '/admin/dashboard' : data.user.role === 'customer' ? '/customer/dashboard' : '/dashboard'
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to your account to continue.">
      {successMessage && <Notice kind="success">{successMessage}</Notice>}
      {error && <Notice>{error}</Notice>}
      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span>Email address</span>
          <span className="input-wrap"><Mail size={17} /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></span>
        </label>
        <PasswordInput label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        <div className="form-options">
          <label className="check-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
          <Link to={portalRole ? `/${portalRole}/forgot-password` : '/forgot-password'} className="text-link">Forgot password?</Link>
        </div>
        <button className="button button-primary button-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>
      </form>
      {portalRole !== 'admin' && <p className="auth-switch">New to Brightloop? <Link to="/customer/register" className="text-link">Create an account</Link></p>}
    </AuthFrame>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })) }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Your passwords do not match.')
    setBusy(true)
    try {
      await api.post('/auth/register', { full_name: form.full_name, email: form.email, phone: form.phone, password: form.password })
      navigate('/customer/login', { replace: true, state: { message: 'Your account is ready. Sign in to continue.' } })
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setBusy(false)
    }
  }
  return (
    <AuthFrame title="Create your account" subtitle="Get started with a few details.">
      {error && <Notice>{error}</Notice>}
      <form className="auth-form" onSubmit={submit}>
        <label className="field"><span>Full name</span><span className="input-wrap"><UserRound size={17} /><input required minLength={2} maxLength={120} value={form.full_name} onChange={(event) => update('full_name', event.target.value)} placeholder="Your name" autoComplete="name" /></span></label>
        <label className="field"><span>Email address</span><span className="input-wrap"><Mail size={17} /><input type="email" required value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@company.com" autoComplete="email" /></span></label>
        <label className="field"><span>Phone number <small>Optional</small></span><span className="input-wrap"><UserRoundPlus size={17} /><input type="tel" maxLength={32} value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+1 (555) 000-0000" autoComplete="tel" /></span></label>
        <PasswordInput label="Password" value={form.password} onChange={(value) => update('password', value)} autoComplete="new-password" />
        <PasswordInput label="Confirm password" value={form.confirm} onChange={(value) => update('confirm', value)} autoComplete="new-password" />
        <button className="button button-primary button-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/customer/login" className="text-link">Sign in</Link></p>
    </AuthFrame>
  )
}

export function ForgotPasswordPage({ portalRole }: { portalRole?: 'admin' | 'customer' } = {}) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setMessage(data.message)
    } catch (requestError) { setError(getApiError(requestError)) }
    finally { setBusy(false) }
  }
  return (
    <AuthFrame title="Reset your password" subtitle="Enter your email and we’ll send a reset link if email delivery is enabled.">
      {error && <Notice>{error}</Notice>}
      {message && <Notice kind="success">{message}</Notice>}
      <form className="auth-form" onSubmit={submit}>
        <label className="field"><span>Email address</span><span className="input-wrap"><Mail size={17} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></span></label>
        <button className="button button-primary button-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'} <ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch"><Link to={portalRole ? `/${portalRole}/login` : '/account'} className="text-link"><ArrowLeft size={15} /> Back to sign in</Link></p>
    </AuthFrame>
  )
}

export function ResetPasswordPage({ portalRole }: { portalRole?: 'admin' | 'customer' } = {}) {
  const navigate = useNavigate()
  const token = new URLSearchParams(useLocation().search).get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!token) return setError('This reset link is incomplete. Request a new one.')
    if (password !== confirm) return setError('Your passwords do not match.')
    setBusy(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      navigate(portalRole ? `/${portalRole}/login` : '/account', { replace: true, state: { message: 'Your password was updated. Sign in with your new password.' } })
    } catch (requestError) { setError(getApiError(requestError)) }
    finally { setBusy(false) }
  }
  return (
    <AuthFrame title="Choose a new password" subtitle="Use at least eight characters for your new password.">
      {error && <Notice>{error}</Notice>}
      <form className="auth-form" onSubmit={submit}>
        <PasswordInput label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
        <PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <button className="button button-primary button-full" disabled={busy}>{busy ? 'Updating…' : 'Update password'} <ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch"><Link to={portalRole ? `/${portalRole}/login` : '/account'} className="text-link"><ArrowLeft size={15} /> Back to sign in</Link></p>
    </AuthFrame>
  )
}

const navigation: Record<UserRole, { label: string; path: string; icon: typeof LayoutDashboard }[]> = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Staff management', path: '/staff', icon: UsersRound },
    { label: 'Customers', path: '/customers', icon: BriefcaseBusiness },
    { label: 'My profile', path: '/profile', icon: UserRound },
  ],
  staff: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: BriefcaseBusiness },
    { label: 'My profile', path: '/profile', icon: UserRound },
  ],
  customer: [
    { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'My profile', path: '/profile', icon: UserRound },
  ],
}

export function WorkspaceLayout() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  if (!user) return null
  function logout() { signOut(); navigate('/login', { replace: true }) }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><Brand inverse /><button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navigation[user.role].map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={() => setMenuOpen(false)} className={(state: { isActive: boolean }) => `nav-item ${state.isActive ? 'nav-item-active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Dashboard' && <span className="nav-indicator" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><CircleHelp size={18} /><div><b>Need a hand?</b><span>We’re here to help.</span></div></div>
          <button className="logout-button" onClick={logout}><LogOut size={18} /> Sign out</button>
          <div className="sidebar-version">BRIGHTLOOP · ACCOUNT MANAGEMENT</div>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      <div className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumbs">Workspace <span>/</span> <b>{currentPageLabel()}</b></div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button><div className="topbar-divider" /><Link to="/profile" className="user-chip"><span className="avatar">{initials(user.full_name)}</span><span className="user-chip-copy"><b>{user.full_name}</b><small>{roleLabel(user.role)}</small></span><ChevronDown size={15} /></Link></div>
        </header>
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  )
}

function currentPageLabel() {
  const path = window.location.pathname
  if (path.startsWith('/staff')) return 'Staff management'
  if (path.includes('/customers/')) return 'Customer profile'
  if (path === '/customers') return 'Customers'
  if (path === '/profile') return 'My profile'
  return 'Dashboard'
}

function roleLabel(role: UserRole) { return role.charAt(0).toUpperCase() + role.slice(1) }
function initials(name: string) { return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') }
function dateLabel(date: string) { return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    api.get<DashboardStats>('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch((requestError: unknown) => setError(getApiError(requestError)))
  }, [])
  if (!user) return null
  return (
    <div className="page">
      <PageHeading eyebrow="OVERVIEW" title={`Good to see you, ${user.full_name.split(' ')[0]}.`} description="Here’s a clear view of your workspace today." />
      {error && <Notice>{error}</Notice>}
      <section className="welcome-card">
        <div className="welcome-content"><span className="eyebrow eyebrow-gold">YOUR BRIGHTLOOP WORKSPACE</span><h2>Good relationships make good business.</h2><p>Keep your account and customer relationships in one considered place.</p><Link className="welcome-link" to="/profile">Manage your profile <ArrowRight size={16} /></Link></div>
        <div className="welcome-art" aria-hidden="true"><div className="art-ring art-ring-one" /><div className="art-ring art-ring-two" /><span className="art-star">✳</span><span className="art-dot" /></div>
      </section>
      {user.role !== 'customer' ? (
        <section className="stats-grid">
          <StatCard label="Active customers" value={stats?.customers} icon={<BriefcaseBusiness size={19} />} tone="gold" />
          {user.role === 'admin' && <StatCard label="Active staff" value={stats?.staff} icon={<UsersRound size={19} />} tone="green" />}
          <div className="stat-card stat-card-note"><div className="stat-icon stat-icon-muted"><Activity size={19} /></div><div className="stat-label">Account status</div><div className="stat-bottom"><span className="status-dot" /> Active</div><div className="stat-foot">Your workspace is ready to go</div></div>
        </section>
      ) : (
        <section className="customer-home-grid">
          <div className="content-card account-card"><div className="card-title-row"><div><span className="eyebrow">ACCOUNT</span><h3>Your account</h3></div><span className="status-badge status-active"><span /> Active</span></div><div className="account-details"><span className="avatar avatar-large">{initials(user.full_name)}</span><div><strong>{user.full_name}</strong><p>{user.email}</p><small>Customer account</small></div></div><Link to="/profile" className="button button-secondary">View account details <ArrowRight size={16} /></Link></div>
          <div className="content-card quiet-card"><ShieldCheck size={22} /><h3>Your details, thoughtfully kept.</h3><p>Update your contact information any time from your profile settings.</p><Link to="/profile" className="text-link">Edit your profile <ArrowRight size={15} /></Link></div>
        </section>
      )}
      <section className="section-heading"><div><span className="eyebrow">QUICK ACCESS</span><h2>Pick up where you left off</h2></div></section>
      <section className="quick-grid">
        {user.role === 'admin' && <QuickCard icon={<UsersRound size={20} />} title="Staff management" description="Manage your team and access." to="/staff" />}
        {(user.role === 'admin' || user.role === 'staff') && <QuickCard icon={<BriefcaseBusiness size={20} />} title="Customer directory" description="View and manage customer records." to="/customers" />}
        <QuickCard icon={<UserRound size={20} />} title="Profile settings" description="Keep your personal details current." to="/profile" />
      </section>
      {!stats && user.role !== 'customer' && <p className="data-note">Dashboard figures load directly from your account records.</p>}
    </div>
  )
}

function StatCard({ label, value, icon, tone }: { label: string; value?: number; icon: ReactNode; tone: 'gold' | 'green' }) {
  return <div className="stat-card"><div className={`stat-icon stat-icon-${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value === undefined ? <span className="skeleton-value" /> : value}</div><div className="stat-foot"><span>From your current records</span>{value !== undefined && <ArrowUpRight size={15} />}</div></div>
}

function QuickCard({ icon, title, description, to }: { icon: ReactNode; title: string; description: string; to: string }) {
  return <Link to={to} className="quick-card"><span className="quick-icon">{icon}</span><span className="quick-copy"><strong>{title}</strong><small>{description}</small></span><ArrowRight className="quick-arrow" size={17} /></Link>
}

function UserTable({
  users,
  onStatus,
  onEdit,
  onView,
  customer = false,
}: {
  users: User[]
  onStatus?: (user: User) => void
  onEdit?: (user: User) => void
  onView?: (user: User) => void
  customer?: boolean
}) {
  return (
    <div className="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>{customer ? 'Joined' : 'Role'}</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>
      {users.map((item) => <tr key={item.id}><td>{customer ? <Link className="person-cell" to={`/customers/${item.id}`}><span className="avatar avatar-small">{initials(item.full_name)}</span><span><b>{item.full_name}</b><small>{item.company_name || item.email}</small></span></Link> : <button className="person-cell person-button" onClick={() => onView?.(item)}><span className="avatar avatar-small">{initials(item.full_name)}</span><span><b>{item.full_name}</b><small>{item.email}</small></span></button>}</td><td>{item.email}</td><td>{item.phone || '—'}</td><td>{customer ? dateLabel(item.created_at) : roleLabel(item.role)}</td><td><span className={`status-badge ${item.is_active ? 'status-active' : 'status-inactive'}`}><span />{item.is_active ? 'Active' : 'Inactive'}</span></td><td className="table-actions">{onView && <button className="table-action" onClick={() => onView(item)}>View</button>}{onEdit && <button className="table-action" onClick={() => onEdit(item)}>Edit</button>}{onStatus && <button className={`table-action ${item.is_active ? 'action-danger' : ''}`} onClick={() => onStatus(item)}>{item.is_active ? 'Deactivate' : 'Activate'}</button>}</td></tr>)}
    </tbody></table></div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span className="empty-icon"><ClipboardList size={23} /></span><h3>{title}</h3><p>{description}</p></div>
}

function UserDialog({ kind, onClose, onCreated, initialUser }: {
  kind: 'staff' | 'customer'
  onClose: () => void
  onCreated: () => void
  initialUser?: User
}) {
  const [form, setForm] = useState(() => ({
    full_name: initialUser?.full_name || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
    password: '',
    company_name: initialUser?.company_name || '',
    address: initialUser?.address || '',
  }))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })) }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const path = kind === 'staff' ? '/users' : '/customers'
      if (initialUser) {
        await api.put(`/users/${initialUser.id}`, { full_name: form.full_name, phone: form.phone })
      } else {
        await api.post(path, { ...form, role: kind, company_name: form.company_name || null, address: form.address || null })
      }
      onCreated()
    } catch (requestError) { setError(getApiError(requestError)) }
    finally { setBusy(false) }
  }
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><span className="eyebrow">{initialUser ? 'EDIT STAFF ACCOUNT' : `NEW ${kind.toUpperCase()} ACCOUNT`}</span><h2 id="modal-title">{initialUser ? 'Edit staff details' : `Add ${kind}`}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
        {error && <Notice>{error}</Notice>}
        <form className="modal-form" onSubmit={submit}>
          <label className="field"><span>Full name</span><input className="plain-input" required minLength={2} maxLength={120} value={form.full_name} onChange={(event) => update('full_name', event.target.value)} /></label>
          <label className="field"><span>Email address</span><input className={`plain-input ${initialUser ? 'input-readonly' : ''}`} type="email" required readOnly={Boolean(initialUser)} value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label className="field"><span>Phone</span><input className="plain-input" type="tel" maxLength={32} value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label>
          {!initialUser && <label className="field"><span>Temporary password</span><input className="plain-input" type="password" minLength={8} required value={form.password} onChange={(event) => update('password', event.target.value)} /></label>}
          {kind === 'customer' && <><label className="field"><span>Company <small>Optional</small></span><input className="plain-input" value={form.company_name} onChange={(event) => update('company_name', event.target.value)} /></label><label className="field"><span>Address <small>Optional</small></span><textarea className="plain-input" rows={3} value={form.address} onChange={(event) => update('address', event.target.value)} /></label></>}
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : initialUser ? 'Save changes' : `Create ${kind}`}</button></div>
        </form>
      </section>
    </div>
  )
}

function StaffDetailsDialog({ user, onClose, onEdit }: { user: User; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal staff-details-modal" role="dialog" aria-modal="true" aria-labelledby="staff-details-title">
        <div className="modal-heading"><div><span className="eyebrow">STAFF ACCOUNT</span><h2 id="staff-details-title">Team member details</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
        <div className="staff-detail-person"><span className="avatar avatar-profile">{initials(user.full_name)}</span><div><h3>{user.full_name}</h3><span>{user.email}</span></div></div>
        <div className="staff-detail-grid"><div><span>Role</span><b>Staff</b></div><div><span>Account status</span><span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}><span />{user.is_active ? 'Active' : 'Inactive'}</span></div><div><span>Phone</span><b>{user.phone || 'Not provided'}</b></div><div><span>Joined</span><b>{dateLabel(user.created_at)}</b></div></div>
        <div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Close</button><button className="button button-primary" onClick={onEdit}>Edit details <ArrowRight size={15} /></button></div>
      </section>
    </div>
  )
}

function ManagementPage({ kind }: { kind: 'staff' | 'customer' }) {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<User | null>(null)
  const [viewingStaff, setViewingStaff] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const path = kind === 'staff' ? '/users' : '/customers'
  const loadUsers = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const { data } = await api.get<User[]>(path)
      setUsers(data)
    } catch (requestError) { setError(getApiError(requestError)) }
    finally { setBusy(false) }
  }, [path])
  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadUsers])
  const filtered = useMemo(() => users.filter((item) => {
    const term = search.trim().toLowerCase()
    return (!term || item.full_name.toLowerCase().includes(term) || item.email.toLowerCase().includes(term))
      && (statusFilter === 'all' || (statusFilter === 'active' ? item.is_active : !item.is_active))
  }), [search, statusFilter, users])
  async function toggleStatus(item: User) {
    const action = item.is_active ? 'deactivate' : 'activate'
    if (!window.confirm(`Are you sure you want to ${action} ${item.full_name}?`)) return
    try {
      await api.patch(`/users/${item.id}/status`, { is_active: !item.is_active })
      await loadUsers()
    } catch (requestError) { setError(getApiError(requestError)) }
  }
  const customer = kind === 'customer'
  return (
    <div className="page">
      <PageHeading eyebrow={customer ? 'RELATIONSHIPS' : 'YOUR TEAM'} title={customer ? 'Customers' : 'Staff management'} description={customer ? 'A thoughtful view of the people you work with.' : 'Manage team access and staff accounts.'} action={<button className="button button-primary" onClick={() => setDialogOpen(true)}><UserRoundPlus size={17} /> Add {customer ? 'customer' : 'staff'}</button>} />
      <section className="content-card directory-card">
        <div className="directory-toolbar"><div className="directory-summary"><strong>{users.length}</strong><span>{customer ? 'customer records' : 'team members'}</span></div><div className="directory-filters"><label className="search-field"><Search size={17} /><input aria-label={`Search ${kind}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${kind}…`} /></label><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>
        {error && <Notice>{error}</Notice>}
        {busy ? <div className="list-loading">Loading records…</div> : filtered.length ? <UserTable users={filtered} onStatus={customer ? undefined : toggleStatus} onEdit={customer ? undefined : setEditingStaff} onView={customer ? undefined : setViewingStaff} customer={customer} /> : <EmptyState title={users.length ? 'No matching records' : 'No records available yet.'} description={users.length ? 'Try another search or status filter.' : `When ${customer ? 'customers' : 'staff'} are added, they’ll appear here.`} />}
      </section>
      <div className="directory-footnote"><ShieldCheck size={15} /> Account records are managed securely and visible according to your role.</div>
      {dialogOpen && <UserDialog kind={kind} onClose={() => setDialogOpen(false)} onCreated={() => { setDialogOpen(false); void loadUsers() }} />}
      {editingStaff && <UserDialog kind="staff" initialUser={editingStaff} onClose={() => setEditingStaff(null)} onCreated={() => { setEditingStaff(null); void loadUsers() }} />}
      {viewingStaff && <StaffDetailsDialog user={viewingStaff} onClose={() => setViewingStaff(null)} onEdit={() => { setEditingStaff(viewingStaff); setViewingStaff(null) }} />}
    </div>
  )
}

export function StaffPage() { return <ManagementPage kind="staff" /> }
export function CustomersPage() { return <ManagementPage kind="customer" /> }

export function CustomerDetailsPage() {
  const { customerId } = useParams()
  const [customer, setCustomer] = useState<User | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', company_name: '', address: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!customerId) return
    api.get<User>(`/customers/${customerId}`).then(({ data }) => {
      setCustomer(data)
      setForm({ full_name: data.full_name, phone: data.phone, company_name: data.company_name || '', address: data.address || '' })
    }).catch((requestError: unknown) => setError(getApiError(requestError)))
  }, [customerId])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!customer) return
    setBusy(true); setError(''); setMessage('')
    try {
      const { data } = await api.put<User>(`/customers/${customer.id}`, { ...form, company_name: form.company_name || null, address: form.address || null })
      setCustomer(data); setMessage('Customer details saved.')
    } catch (requestError) { setError(getApiError(requestError)) }
    finally { setBusy(false) }
  }
  if (error && !customer) return <div className="page"><Link className="back-link" to="/customers"><ArrowLeft size={16} /> Back to customers</Link><Notice>{error}</Notice></div>
  if (!customer) return <div className="screen-loading">Loading customer profile…</div>
  return (
    <div className="page">
      <Link className="back-link" to="/customers"><ArrowLeft size={16} /> Back to customers</Link>
      <PageHeading eyebrow="CUSTOMER PROFILE" title={customer.full_name} description="Customer information and account details." />
      <section className="profile-layout">
        <div className="content-card profile-summary-card"><span className="avatar avatar-profile">{initials(customer.full_name)}</span><h2>{customer.full_name}</h2><p>{customer.email}</p><span className={`status-badge ${customer.is_active ? 'status-active' : 'status-inactive'}`}><span /> {customer.is_active ? 'Active' : 'Inactive'} customer</span><div className="profile-meta"><span>Member since</span><b>{dateLabel(customer.created_at)}</b></div><div className="profile-meta"><span>Account type</span><b>Customer</b></div></div>
        <form className="content-card edit-card" onSubmit={submit}><div className="card-title-row"><div><span className="eyebrow">CONTACT INFORMATION</span><h3>Personal details</h3></div><UserRound size={19} /></div>{error && <Notice>{error}</Notice>}{message && <Notice kind="success">{message}</Notice>}<div className="edit-grid"><label className="field"><span>Full name</span><input className="plain-input" required minLength={2} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></label><label className="field"><span>Email address</span><input className="plain-input input-readonly" readOnly value={customer.email} /></label><label className="field"><span>Phone</span><input className="plain-input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label className="field"><span>Company</span><input className="plain-input" value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} /></label><label className="field field-wide"><span>Address</span><textarea className="plain-input" rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label></div><div className="form-footer"><span>Account role and permissions can’t be changed here.</span><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'} <Check size={16} /></button></div></form>
      </section>
    </div>
  )
}

export function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [form, setForm] = useState(() => ({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    address: user?.address || '',
  }))
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true)
    try {
      await api.put('/users/me', { ...form, company_name: form.company_name || null, address: form.address || null })
      await refreshProfile()
      setMessage('Your profile was updated.')
    } catch (requestError) { setError(getApiError(requestError)) }
    finally { setBusy(false) }
  }
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('')
    if (passwords.new_password !== passwords.confirm) return setError('Your new passwords do not match.')
    setBusy(true)
    try {
      await api.post('/auth/change-password', { current_password: passwords.current_password, new_password: passwords.new_password })
      setPasswords({ current_password: '', new_password: '', confirm: '' })
      setMessage('Your password was changed.')
    } catch (requestError) { setError(getApiError(requestError)) }
    finally { setBusy(false) }
  }
  if (!user) return null
  return (
    <div className="page">
      <PageHeading eyebrow="ACCOUNT SETTINGS" title="My profile" description="Your personal details and account security." />
      {error && <Notice>{error}</Notice>}{message && <Notice kind="success">{message}</Notice>}
      <section className="profile-layout profile-settings">
        <div className="content-card profile-summary-card"><span className="avatar avatar-profile">{initials(user.full_name)}</span><h2>{user.full_name}</h2><p>{user.email}</p><span className="role-pill">{roleLabel(user.role)} account</span><div className="profile-meta"><span>Account created</span><b>{dateLabel(user.created_at)}</b></div><div className="profile-meta"><span>Account status</span><span className="status-badge status-active"><span /> Active</span></div></div>
        <div className="profile-forms">
          <form className="content-card edit-card" onSubmit={saveProfile}><div className="card-title-row"><div><span className="eyebrow">PERSONAL INFORMATION</span><h3>Profile details</h3></div><UserRound size={19} /></div><div className="edit-grid"><label className="field"><span>Full name</span><input className="plain-input" required minLength={2} maxLength={120} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></label><label className="field"><span>Email address</span><input className="plain-input input-readonly" readOnly value={user.email} /></label><label className="field"><span>Phone number</span><input className="plain-input" maxLength={32} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>{user.role === 'customer' && <><label className="field"><span>Company <small>Optional</small></span><input className="plain-input" value={form.company_name} onChange={(event) => setForm({ ...form, company_name: event.target.value })} /></label><label className="field field-wide"><span>Address <small>Optional</small></span><textarea className="plain-input" rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label></>}</div><div className="form-footer"><span>Role and account permissions are managed by an administrator.</span><button className="button button-primary" disabled={busy}>Save changes <Check size={16} /></button></div></form>
          <form className="content-card edit-card" onSubmit={changePassword}><div className="card-title-row"><div><span className="eyebrow">SECURITY</span><h3>Change password</h3></div><LockKeyhole size={19} /></div><div className="edit-grid"><label className="field"><span>Current password</span><input className="plain-input" type="password" required value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} /></label><label className="field"><span>New password</span><input className="plain-input" type="password" required minLength={8} maxLength={128} value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} /></label><label className="field"><span>Confirm new password</span><input className="plain-input" type="password" required minLength={8} value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} /></label></div><div className="form-footer"><span>Choose at least eight characters.</span><button className="button button-secondary" disabled={busy}>Update password <ArrowDownRight size={16} /></button></div></form>
        </div>
      </section>
    </div>
  )
}

export function InitialPasswordChangePage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { refreshProfile } = useAuth()
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) return setError('Your passwords do not match.')
    setBusy(true)
    try {
      await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
      await refreshProfile()
      navigate('/admin/dashboard', { replace: true })
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <PageHeading eyebrow="SECURITY" title="Choose a new password" description="For your security, update the temporary administrator password before continuing." />
      <section className="content-card edit-card" style={{ maxWidth: 620 }}>
        {error && <Notice>{error}</Notice>}
        <form className="auth-form" onSubmit={submit}>
          <label className="field"><span>Current temporary password</span><input className="plain-input" type="password" required minLength={8} maxLength={128} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
          <label className="field"><span>New password</span><input className="plain-input" type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
          <label className="field"><span>Confirm new password</span><input className="plain-input" type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          <button className="button button-primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'} <ArrowRight size={16} /></button>
        </form>
      </section>
    </div>
  )
}
