import { ArrowRight, Code2, ShieldCheck, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { company } from './config/company'
import './AccountSelectionPage.css'

export function AccountSelectionPage() {
  return (
    <main className="account-selection-page">
      <header className="account-selection-header">
        <Link to="/" className="account-selection-brand"><span className="account-selection-mark">b</span>{company.name}</Link>
        <Link to="/" className="account-back-link">Back to home</Link>
      </header>
      <section className="account-selection-content">
        <div className="account-selection-heading">
          <span className="public-eyebrow">WELCOME TO {company.name.toUpperCase()}</span>
          <h1>Choose your portal.</h1>
          <p>Select the account area that matches how you use the platform.</p>
        </div>
        <div className="account-panel-grid">
          <article className="account-panel admin-panel">
            <div className="account-panel-icon"><ShieldCheck size={25} /></div>
            <span className="account-panel-label">PLATFORM ACCESS</span>
            <h2>Admin Portal</h2>
            <p>Authorized access for administrators to manage the platform.</p>
            <Link className="account-panel-button account-panel-button-dark" to="/admin/login">Admin Login <ArrowRight size={17} /></Link>
          </article>
          <article className="account-panel customer-panel">
            <div className="account-panel-icon"><UsersRound size={25} /></div>
            <span className="account-panel-label">YOUR ACCOUNT</span>
            <h2>Customer Portal</h2>
            <p>Access your subscriptions, quotations, invoices and account.</p>
            <Link className="account-panel-button account-panel-button-gold" to="/customer/login">Customer Login <ArrowRight size={17} /></Link>
            <Link className="account-panel-register" to="/customer/register">New here? <b>Create an account</b></Link>
          </article>
          <article className="account-panel developer-panel">
            <div className="account-panel-icon"><Code2 size={25} /></div>
            <span className="account-panel-label">TECHNICAL ACCESS</span>
            <h2>Developer Team</h2>
            <p>Restricted workspace for provisioned members of the developer team.</p>
            <Link className="account-panel-button account-panel-button-dark" to="/developer/login">Developer Login <ArrowRight size={17} /></Link>
          </article>
        </div>
        <p className="account-selection-note"><ShieldCheck size={15} /> Portal access is secured by your account permissions.</p>
      </section>
      <footer className="account-selection-footer">© {new Date().getFullYear()} {company.name}</footer>
    </main>
  )
}
