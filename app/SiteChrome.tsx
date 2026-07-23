"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="wrap nav">
    <Link className="logo" href="/" aria-label="LoadWise home"><span className="logo-dot"/><span>LoadWise</span></Link>
    <button className="menu-button" aria-label="Open navigation" aria-expanded={open} onClick={()=>setOpen(!open)}><span/><span/></button>
    <div className={`nav-drawer ${open?"open":""}`}>
      <nav className="nav-links" aria-label="Main navigation"><a href="/platform">Platform</a><a href="/manifesto">Manifesto</a><a href="/company">Company</a><a href="/contact">Contact</a></nav>
      <div className="nav-actions"><LanguageSwitcher/><a className="nav-cta" href="/contact#request-call">Request a Call <span>↗</span></a></div>
    </div>
  </div></header>
}

export function Footer() {
  return <footer><div className="wrap footer-grid">
    <div><Link className="logo" href="/"><span className="logo-dot"/><span>LoadWise</span></Link><p>Intelligence for every decision.<br/>Automation for every mile.</p></div>
    <div><b>PLATFORM</b><a href="/platform">Platform overview</a><a href="/platform#today">Available today</a><a href="/platform#roadmap">Product horizon</a></div>
    <div><b>COMPANY</b><a href="/manifesto">Manifesto</a><a href="/company">Our company</a><a href="/contact">Contact</a></div>
    <div><b>GET STARTED</b><a href="/contact#request-call">Request a Call</a><a href="/contact#partners">Partnerships</a><span>United States</span></div>
  </div><div className="wrap footer-bottom"><span>© 2026 LoadWise. The AI-powered operating system for independent freight.</span><span>Privacy · Terms</span></div></footer>
}

export function Shell({children}:{children:React.ReactNode}) { return <><Header/><main>{children}</main><Footer/></>; }

export const Arrow = () => <span aria-hidden="true">↗</span>;
