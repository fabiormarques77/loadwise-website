"use client";

import { FormEvent, useState } from "react";
import { Arrow, Shell } from "@/components/SiteChrome";

const uploads = [
  ["driverLicense", "Driver License", "DRIVER_LICENSE", true],
  ["coi", "Certificate of Insurance (COI)", "COI", false],
  ["registration", "Vehicle Registration", "VEHICLE_REGISTRATION", false],
  ["w9", "W-9", "W9", false],
  ["voidCheck", "Void Check", "VOID_CHECK", false],
  ["exteriorPhotos", "Vehicle Exterior Photos", "VEHICLE_EXTERIOR_PHOTO", false],
  ["cargoPhotos", "Cargo Area Photos", "CARGO_AREA_PHOTO", false],
] as const;

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const source = new FormData(event.currentTarget);
    const payload = new FormData();
    ["fullName", "mobilePhone", "email", "zipCode", "operationType", "numberOfVehicles", "equipmentType", "consent"].forEach((key) => {
      const value = source.get(key);
      if (value !== null) payload.append(key, value);
    });
    const contacts = [1, 2].map((number) => ({ name: String(source.get(`emergencyName${number}`) || "").trim(), relationship: String(source.get(`emergencyRelationship${number}`) || "").trim(), phone: String(source.get(`emergencyPhone${number}`) || "").trim() })).filter((contact) => contact.name || contact.relationship || contact.phone);
    payload.append("emergencyContacts", JSON.stringify(contacts));
    const documentTypes: string[] = [];
    for (const [field, , type] of uploads) {
      for (const value of source.getAll(field)) {
        if (value instanceof File && value.size) { payload.append("files", value); documentTypes.push(type); }
      }
    }
    if (documentTypes.length > 10) { setError("Please upload no more than 10 files total."); return; }
    payload.append("documentTypes", JSON.stringify(documentTypes));
    setBusy(true);
    try {
      const response = await fetch("/api/applications", { method: "POST", body: payload });
      if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(Array.isArray(result.message) ? result.message.join(" ") : result.message || "We couldn't submit this right now."); }
      setSent(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We couldn't submit this right now."); }
    finally { setBusy(false); }
  }

  return <Shell>
    <section className="contact-hero wrap"><div><span className="hero-tag"><i/> DRIVER APPLICATION</span><h1>Drive with Liberty Haul<br/>& Logistics.</h1><p>Tell us about your operation. This short application is only the first contact; our team will guide you through onboarding later.</p></div><div className="contact-paths"><a href="#application"><span>FOR DRIVERS</span><h3>Submit your application</h3><p>Owner-operators and small fleets are welcome.</p><b>Start application →</b></a><a href="#partners"><span>FOR PARTNERS</span><h3>Explore a partnership</h3><p>Technology, freight, capital or ecosystem collaboration.</p><b>Contact LoadWise →</b></a></div></section>
    <section className="application" id="application"><div className="wrap application-grid"><div><span className="section-no light">APPLICATIONS</span><h2>A quick first step.<br/>Not full onboarding.</h2><p>Only your driver license is required today. Insurance, registration, tax, banking, and vehicle documents can be provided now or later.</p><ul><li>Up to 10 files total</li><li>PDF, JPG, JPEG, or PNG</li><li>10MB maximum per file</li><li>Documents stored securely in LoadWise</li></ul></div><div className="access-card">{sent ? <div className="success"><span>✓</span><h3>Application received.</h3><p>Our team will review your information in LoadWise and contact you with the next step.</p></div> : <form onSubmit={submit}>
      <div className="form-head"><span>DRIVER APPLICATION</span><b>* Required</b></div>
      <label>Full Name *<input name="fullName" required autoComplete="name" placeholder="Your full name"/></label>
      <div className="form-row"><label>Mobile Phone *<input name="mobilePhone" required autoComplete="tel" placeholder="(000) 000-0000"/></label><label>ZIP Code *<input name="zipCode" required inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="00000"/></label></div>
      <label>Email *<input name="email" required type="email" autoComplete="email" placeholder="you@email.com"/></label>
      <div className="form-row"><label>Operation Type *<select name="operationType" required defaultValue=""><option value="" disabled>Select</option><option value="OWNER_OPERATOR">Owner-operator</option><option value="SMALL_FLEET">Small fleet</option></select></label><label>Number of Vehicles *<input name="numberOfVehicles" required type="number" min="1" max="9999" placeholder="1"/></label></div>
      <label>Equipment Type *<input name="equipmentType" required placeholder="Cargo van, box truck, hot shot…"/></label>
      <fieldset><legend>Documents</legend>{uploads.map(([field, label, , required]) => <label className="upload" key={field}>{label}{required ? " *" : " (optional)"}<input name={field} required={required} type="file" accept=".pdf,.jpg,.jpeg,.png" multiple={!required}/><span>＋ Select {label.toLowerCase()}</span><small>PDF, JPG, JPEG or PNG · up to 10MB each</small></label>)}</fieldset>
      <fieldset><legend>Emergency Contact #1 (optional)</legend><label>Name<input name="emergencyName1"/></label><div className="form-row"><label>Relationship<input name="emergencyRelationship1"/></label><label>Phone<input name="emergencyPhone1" autoComplete="tel"/></label></div></fieldset>
      <fieldset><legend>Emergency Contact #2 (optional)</legend><label>Name<input name="emergencyName2"/></label><div className="form-row"><label>Relationship<input name="emergencyRelationship2"/></label><label>Phone<input name="emergencyPhone2" autoComplete="tel"/></label></div></fieldset>
      <label className="consent"><input name="consent" type="checkbox" required/><span>I consent to Liberty Haul & Logistics and LoadWise storing this application and contacting me about it.</span></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="btn submit" disabled={busy}>{busy ? "Submitting..." : "Submit application"}<Arrow/></button><small className="fine">This application does not complete onboarding or create a driver account.</small>
    </form>}</div></div></section>
    <section className="partners wrap" id="partners"><div><span className="section-no">PARTNERSHIPS & COMPANY</span><h2>Building in freight,<br/>technology or capital?</h2></div><div><p>We welcome conversations with brokers, technology providers, industry partners, investors and people who share our long-term vision.</p><a className="btn dark-btn" href="mailto:contact@loadwisesys.com">contact@loadwisesys.com <Arrow/></a></div></section>
  </Shell>;
}
