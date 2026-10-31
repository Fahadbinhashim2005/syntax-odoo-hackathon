import { useState } from 'react'
import { ArrowDown, ArrowRight, BarChart3, Check, CreditCard, FileText, Menu, ShieldCheck, UsersRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { company } from './config/company'
import './PublicHomePage.css'

const services = [
  { icon: Check, title: 'Subscription management', text: 'Keep subscription information organized in one connected workspace.' },
  { icon: UsersRound, title: 'Customer management', text: 'Maintain clear customer profiles and account access.' },
  { icon: FileText, title: 'Quotation management', text: 'Give teams a place to connect quotation workflows.' },
  { icon: FileText, title: 'Invoice management', text: 'Bring invoice workflows into the wider business picture.' },
  { icon: CreditCard, title: 'Payment tracking', text: 'Make payment activity easier to follow as modules connect.' },
  { icon: BarChart3, title: 'Financial reporting', text: 'Support a clearer view of business operations and reporting.' },
]

const benefits = [
  'Centralized customer and account information',
  'A clear place for teams and customers to work',
  'Role based access supported by the backend',
  'A consistent experience across business workflows',
]

function Brand() {
  return <Link className="public-brand" to="/" aria-label={`${company.name} home`}><span className="public-brand-mark">b</span>{company.name}</Link>
}

export function PublicHomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="public-site">
      <header className="public-header">
        <div className="public-header-inner">
          <Brand />
          <button className="public-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={`public-nav${menuOpen ? ' public-nav-open' : ''}`} aria-label="Main navigation">
            <a href="#home" onClick={closeMenu}>Home</a>
            <a href="#about" onClick={closeMenu}>About Us</a>
            <a href="#services" onClick={closeMenu}>Services</a>
            <a href="#contact" onClick={closeMenu}>Contact</a>
            <Link to="/account" onClick={closeMenu}>Account</Link>
            <Link className="public-nav-cta" to="/account" onClick={closeMenu}>Get started <ArrowRight size={15} /></Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="public-hero" id="home">
          <div className="public-container public-hero-grid">
            <div className="public-hero-copy">
              <span className="public-eyebrow">A CLEARER WAY TO MANAGE</span>
              <h1>Manage your business subscriptions <em>smarter.</em></h1>
              <p>A unified platform to simplify subscription management, customer relationships and business operations.</p>
              <div className="public-hero-actions">
                <Link className="public-button public-button-primary" to="/account">Get started <ArrowRight size={17} /></Link>
                <a className="public-button public-button-light" href="#about">Explore the platform <ArrowDown size={16} /></a>
              </div>
              <div className="public-hero-note"><ShieldCheck size={17} /> Account access is managed by role</div>
            </div>
            <div className="public-hero-art" aria-label="Illustration of connected business workflows" role="img">
              <div className="art-orbit art-orbit-one" /><div className="art-orbit art-orbit-two" />
              <div className="art-center"><span className="art-center-mark">b</span><b>One connected<br />workspace</b><small>PEOPLE · PLANS · OPERATIONS</small></div>
              <div className="art-node art-node-top"><FileText size={21} /><span>Subscriptions</span></div>
              <div className="art-node art-node-right"><UsersRound size={21} /><span>Customers</span></div>
              <div className="art-node art-node-bottom"><CreditCard size={21} /><span>Business flows</span></div>
              <div className="art-spark art-spark-one" /><div className="art-spark art-spark-two" />
            </div>
          </div>
        </section>

        <section className="public-intro" id="about">
          <div className="public-container public-intro-grid">
            <div className="public-intro-visual">
              <div className="intro-panel"><span className="public-eyebrow">BUILT AROUND YOUR WORK</span><div className="intro-line intro-line-long" /><div className="intro-line" /><div className="intro-cards"><span><UsersRound size={20} /></span><span><FileText size={20} /></span><span><BarChart3 size={20} /></span></div><div className="intro-line intro-line-short" /></div>
              <span className="intro-decoration" aria-hidden="true" />
            </div>
            <div className="public-section-copy">
              <span className="public-eyebrow">ABOUT {company.name.toUpperCase()}</span>
              <h2>Business operations, brought into focus.</h2>
              <p>{company.description} The platform brings customer information and subscription workflows together, helping teams keep everyday operations clear and organized.</p>
              <p>Customers can access their own account information, while authorized staff use dedicated tools to manage customer and team records.</p>
              <a className="public-text-link" href="#services">Discover the platform <ArrowRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="public-services" id="services">
          <div className="public-container">
            <div className="public-section-heading"><div><span className="public-eyebrow">A CONNECTED TOOLKIT</span><h2>Everything in its right place.</h2></div><p>Explore the workflows the platform is designed to bring together. Individual modules can connect as they become available.</p></div>
            <div className="public-service-grid">
              {services.map(({ icon: Icon, title, text }) => <article className="public-service-card" key={title}><span className="public-service-icon"><Icon size={21} /></span><h3>{title}</h3><p>{text}</p><span className="service-card-rule" /></article>)}
            </div>
          </div>
        </section>

        <section className="public-benefits">
          <div className="public-container public-benefits-grid">
            <div><span className="public-eyebrow">WHY {company.name.toUpperCase()}</span><h2>A calmer, more connected way to work.</h2><p>Bring people and processes into one considered experience, with account access designed around each user’s role.</p><Link className="public-button public-button-gold" to="/login">Visit your account <ArrowRight size={16} /></Link></div>
            <ul>{benefits.map((benefit) => <li key={benefit}><span><Check size={16} /></span>{benefit}</li>)}</ul>
          </div>
        </section>

        <section className="public-contact" id="contact">
          <div className="public-container public-contact-grid">
            <div><span className="public-eyebrow">CONTACT</span><h2>We’d be glad to hear from you.</h2><p>Company contact details will be added here when they are provided.</p></div>
            <div className="public-contact-details"><div><span>Address</span><p>{company.address}</p></div><div><span>Email</span><p>{company.email}</p></div><div><span>Phone</span><p>{company.phone}</p></div></div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="public-container public-footer-main"><div><Brand /><p>{company.description}</p></div><div className="public-footer-links"><span>Explore</span><a href="#about">About Us</a><a href="#services">Services</a><a href="#contact">Contact</a><Link to="/login">Account</Link></div><div className="public-footer-contact"><span>Contact</span><p>{company.email}</p><p>{company.phone}</p></div></div>
        <div className="public-container public-footer-bottom"><span>© {new Date().getFullYear()} {company.name}</span><span>Subscription management platform</span></div>
      </footer>
    </div>
  )
}
