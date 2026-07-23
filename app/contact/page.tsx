"use client";

import { FormEvent, InvalidEvent, useState } from "react";
import { Arrow, Shell } from "@/components/SiteChrome";
import { useLanguage } from "@/components/LanguageSwitcher";
import { applicationErrorMessage } from "@/lib/applicationError";

export default function Contact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/applications", { method: "POST", body: new FormData(event.currentTarget) });
      if (!response.ok) {
        throw new Error(await applicationErrorMessage(response, t));
      }
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("We couldn't send your request right now."));
    } finally {
      setBusy(false);
    }
  }

  function showLocalizedValidation(event: InvalidEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.currentTarget;
    if (field.validity.valueMissing) field.setCustomValidity(t("Please complete this field."));
    else if (field.validity.typeMismatch) field.setCustomValidity(t("Please enter a valid email address."));
    else if (field.validity.patternMismatch) field.setCustomValidity(t("Please match the requested format."));
  }

  const clearValidation = (event: FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    event.currentTarget.setCustomValidity("");
  };

  return <Shell>
    <section className="contact-hero wrap"><div><span className="hero-tag"><i/> {t("TALK TO OUR TEAM")}</span><h1>{t("Let’s talk about")}<br/>{t("your operation.")}</h1><p>{t("Tell Liberty Haul & Logistics a little about your operation. It takes less than a minute, and our team will call you to discuss the next step.")}</p></div><div className="contact-paths"><a href="#request-call"><span>{t("FOR DRIVERS")}</span><h3>{t("Request a call")}</h3><p>{t("Owner-operators and small fleets are welcome.")}</p><b>{t("Tell us about your operation →")}</b></a><a href="#partners"><span>{t("FOR PARTNERS")}</span><h3>{t("Explore a partnership")}</h3><p>{t("Technology, freight, capital or ecosystem collaboration.")}</p><b>{t("Contact LoadWise →")}</b></a></div></section>
    <section className="application" id="request-call"><div className="wrap application-grid"><div><span className="section-no light">{t("REQUEST A CALL")}</span><h2>{t("One minute now.")}<br/>{t("A real conversation next.")}</h2><p>{t("This is only an initial request—not onboarding. If your operation is a fit, our team will contact you and explain any documents needed later.")}</p><ul><li>{t("No documents needed")}</li><li>{t("No account creation")}</li><li>{t("No onboarding commitment")}</li><li>{t("Reviewed directly by our dispatch team")}</li></ul></div><div className="access-card">{sent ? <div className="success" role="status" aria-label={t("Request submitted successfully")}><span aria-hidden="true">✓</span><h3>{t("We received your request.")}</h3><p>{t("A member of our team will review your information and contact you.")}</p></div> : <form onSubmit={submit} aria-label={t("Request a Call form")}>
      <div className="form-head"><span>{t("REQUEST A CALL")}</span><b>{t("All fields required")}</b></div>
      <label>{t("Full Name")}<input name="fullName" required autoComplete="name" placeholder={t("Your full name")} onInvalid={showLocalizedValidation} onInput={clearValidation}/></label>
      <div className="form-row"><label>{t("Mobile Phone")}<input name="mobilePhone" required autoComplete="tel" placeholder="(000) 000-0000" onInvalid={showLocalizedValidation} onInput={clearValidation}/></label><label>{t("ZIP Code")}<input name="zipCode" required inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="00000" onInvalid={showLocalizedValidation} onInput={clearValidation}/></label></div>
      <label>{t("Email")}<input name="email" required type="email" autoComplete="email" placeholder="you@email.com" onInvalid={showLocalizedValidation} onInput={clearValidation}/></label>
      <div className="form-row"><label>{t("Operation Type")}<select name="operationType" required defaultValue="" onInvalid={showLocalizedValidation} onInput={clearValidation}><option value="" disabled>{t("Select")}</option><option value="OWNER_OPERATOR">{t("Owner-operator")}</option><option value="SMALL_FLEET">{t("Small fleet")}</option></select></label><label>{t("Number of Vehicles")}<input name="numberOfVehicles" required type="number" min="1" max="9999" placeholder="1" onInvalid={showLocalizedValidation} onInput={clearValidation}/></label></div>
      <label>{t("Equipment Type")}<input name="equipmentType" required placeholder={t("Cargo van, box truck, hot shot…")} onInvalid={showLocalizedValidation} onInput={clearValidation}/></label>
      <label>{t("How did you hear about Liberty?")}<select name="leadSource" required defaultValue="" onInvalid={showLocalizedValidation} onInput={clearValidation}><option value="" disabled>{t("Select")}</option><option value="GOOGLE">Google</option><option value="FACEBOOK">Facebook</option><option value="INSTAGRAM">Instagram</option><option value="REFERRAL">{t("Referral")}</option><option value="YOUTUBE">YouTube</option><option value="OTHER">{t("Other")}</option></select></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="btn submit" disabled={busy} aria-label={t("Send request")}>{busy ? t("Sending...") : t("Request a Call")}<Arrow/></button><small className="fine">{t("Your information is used only to review and respond to this request.")}</small>
    </form>}</div></div></section>
    <section className="partners wrap" id="partners"><div><span className="section-no">{t("PARTNERSHIPS & COMPANY")}</span><h2>{t("Building in freight,")}<br/>{t("technology or capital?")}</h2></div><div><p>{t("We welcome conversations with brokers, technology providers, industry partners, investors and people who share our long-term vision.")}</p><a className="btn dark-btn" href="mailto:contact@loadwisesys.com">contact@loadwisesys.com <Arrow/></a></div></section>
  </Shell>;
}
