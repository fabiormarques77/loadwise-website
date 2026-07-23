"use client";

import { FormEvent, useState } from "react";
import { Arrow, Shell } from "@/components/SiteChrome";

export default function Contact() {
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
        const result = await response.json().catch(() => ({}));
        throw new Error(Array.isArray(result.message) ? result.message.join(" ") : result.message || "We couldn't send your request right now.");
      }
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't send your request right now.");
    } finally {
      setBusy(false);
    }
  }

  return <Shell>
    <section className="contact-hero wrap"><div><span className="hero-tag"><i/> TALK TO OUR TEAM</span><h1>Let’s talk about<br/>your operation.</h1><p>Tell Liberty Haul & Logistics a little about your operation. It takes less than a minute, and our team will call you to discuss the next step.</p></div><div className="contact-paths"><a href="#request-call"><span>FOR DRIVERS</span><h3>Request a call</h3><p>Owner-operators and small fleets are welcome.</p><b>Tell us about your operation →</b></a><a href="#partners"><span>FOR PARTNERS</span><h3>Explore a partnership</h3><p>Technology, freight, capital or ecosystem collaboration.</p><b>Contact LoadWise →</b></a></div></section>
    <section className="application" id="request-call"><div className="wrap application-grid"><div><span className="section-no light">REQUEST A CALL</span><h2>One minute now.<br/>A real conversation next.</h2><p>This is only an initial request—not onboarding. If your operation is a fit, our team will contact you and explain any documents needed later.</p><ul><li>No documents needed</li><li>No account creation</li><li>No onboarding commitment</li><li>Reviewed directly by our dispatch team</li></ul></div><div className="access-card">{sent ? <div className="success"><span>✓</span><h3>We received your request.</h3><p>A member of our team will review your information and contact you.</p></div> : <form onSubmit={submit}>
      <div className="form-head"><span>REQUEST A CALL</span><b>All fields required</b></div>
      <label>Full Name<input name="fullName" required autoComplete="name" placeholder="Your full name"/></label>
      <div className="form-row"><label>Mobile Phone<input name="mobilePhone" required autoComplete="tel" placeholder="(000) 000-0000"/></label><label>ZIP Code<input name="zipCode" required inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="00000"/></label></div>
      <label>Email<input name="email" required type="email" autoComplete="email" placeholder="you@email.com"/></label>
      <div className="form-row"><label>Operation Type<select name="operationType" required defaultValue=""><option value="" disabled>Select</option><option value="OWNER_OPERATOR">Owner-operator</option><option value="SMALL_FLEET">Small fleet</option></select></label><label>Number of Vehicles<input name="numberOfVehicles" required type="number" min="1" max="9999" placeholder="1"/></label></div>
      <label>Equipment Type<input name="equipmentType" required placeholder="Cargo van, box truck, hot shot…"/></label>
      <label>How did you hear about Liberty?<select name="leadSource" required defaultValue=""><option value="" disabled>Select</option><option value="GOOGLE">Google</option><option value="FACEBOOK">Facebook</option><option value="INSTAGRAM">Instagram</option><option value="REFERRAL">Referral</option><option value="YOUTUBE">YouTube</option><option value="OTHER">Other</option></select></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="btn submit" disabled={busy}>{busy ? "Sending..." : "Request a Call"}<Arrow/></button><small className="fine">Your information is used only to review and respond to this request.</small>
    </form>}</div></div></section>
    <section className="partners wrap" id="partners"><div><span className="section-no">PARTNERSHIPS & COMPANY</span><h2>Building in freight,<br/>technology or capital?</h2></div><div><p>We welcome conversations with brokers, technology providers, industry partners, investors and people who share our long-term vision.</p><a className="btn dark-btn" href="mailto:contact@loadwisesys.com">contact@loadwisesys.com <Arrow/></a></div></section>
  </Shell>;
}
