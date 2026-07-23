"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageSwitcher, useLanguage } from "./LanguageSwitcher";

function localizedHref(path: string, lang: string) {
  const [pathname, hash] = path.split("#", 2);
  return `${pathname}${pathname.includes("?") ? "&" : "?"}lang=${lang}${hash ? `#${hash}` : ""}`;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { lang, t } = useLanguage();
  const href = (path: string) => localizedHref(path, lang);
  return <header className="site-header"><div className="wrap nav">
    <Link className="logo" href={href("/")} aria-label={t("LoadWise home")}><span className="logo-dot"/><span>LoadWise</span></Link>
    <button className="menu-button" aria-label={t(open ? "Close navigation" : "Open navigation")} aria-expanded={open} onClick={()=>setOpen(!open)}><span/><span/></button>
    <div className={`nav-drawer ${open?"open":""}`}>
      <nav className="nav-links" aria-label={t("Main navigation")}><Link href={href("/platform")}>{t("Platform")}</Link><Link href={href("/manifesto")}>{t("Manifesto")}</Link><Link href={href("/company")}>{t("Company")}</Link><Link href={href("/contact")}>{t("Contact")}</Link></nav>
      <div className="nav-actions"><LanguageSwitcher/><Link className="nav-cta" href={href("/contact#request-call")}>{t("Request a Call")} <span>↗</span></Link></div>
    </div>
  </div></header>
}

export function Footer() {
  const { lang, t } = useLanguage();
  const href = (path: string) => localizedHref(path, lang);
  return <footer><div className="wrap footer-grid">
    <div><Link className="logo" href={href("/")}><span className="logo-dot"/><span>LoadWise</span></Link><p>{t("Intelligence for every decision.")}<br/>{t("Automation for every mile.")}</p></div>
    <div><b>{t("PLATFORM")}</b><Link href={href("/platform")}>{t("Platform overview")}</Link><Link href={href("/platform#today")}>{t("Available today")}</Link><Link href={href("/platform#roadmap")}>{t("Product horizon")}</Link></div>
    <div><b>{t("COMPANY")}</b><Link href={href("/manifesto")}>{t("Manifesto")}</Link><Link href={href("/company")}>{t("Our company")}</Link><Link href={href("/contact")}>{t("Contact")}</Link></div>
    <div><b>{t("GET STARTED")}</b><Link href={href("/contact#request-call")}>{t("Request a Call")}</Link><Link href={href("/contact#partners")}>{t("Partnerships")}</Link><span>{t("United States")}</span></div>
  </div><div className="wrap footer-bottom"><span>{t("© 2026 LoadWise. The AI-powered operating system for independent freight.")}</span><span>{t("Privacy · Terms")}</span></div></footer>
}

export function Shell({children}:{children:React.ReactNode}) { return <><Header/><main>{children}</main><Footer/></>; }

export const Arrow = () => <span aria-hidden="true">↗</span>;
