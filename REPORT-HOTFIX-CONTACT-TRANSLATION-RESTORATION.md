# HOTFIX — Contact Translation Restoration

## Executive Summary

The EN/PT/ES translation behavior for the Contact and Request a Call flow has been restored without changing English marketing copy, form questions, field order, validation constraints, API endpoint, payload fields, canonical option values, or Backend error semantics. The affected flow now consumes the existing shared EN-keyed dictionaries through the same canonical locale source used by the language switcher. Dictionary parity, affected-component key coverage, executable runtime switching, API error handling, and payload compatibility are automated.

No commit, push, or deployment was performed.

## Root Cause

Commit `bb0e204` (`feat(website): convert driver application into lead generation funnel`, July 22, 2026) replaced the former driver-application UI with Request a Call content. The replacement added many new English strings but added no corresponding PT/ES dictionary entries.

The existing switcher stored PT correctly in `loadwise-lang` and displayed PT as active. Translation, however, depended on exact English text matches in the canonical dictionaries. Missing keys intentionally fell back to the English source string. Dynamic form states and accessibility attributes also bypassed the DOM text translator. This is why PT remained selected while English content rendered.

## Translation Architecture Found

- Canonical dictionaries: `website/components/LanguageSwitcher.tsx`
- Canonical locale values: `en`, `pt`, `es`
- Locale persistence: browser `localStorage` key `loadwise-lang`
- URL locale behavior: `?lang=en|pt|es`
- Locale priority on initial client load: valid URL query, then valid persisted value, then EN
- Existing public-page fallback: exact English-source-key lookup with English fallback
- Existing client translation behavior: DOM text/placeholder translation
- Server-side locale provider/route segment: none
- Translation hook before this hotfix: none
- Metadata: generated server-side in English; the existing client locale architecture does not localize metadata
- Duplicate implementations found: `app/LanguageSwitcher.tsx` and `app/SiteChrome.tsx`; both now re-export the canonical component implementations

The canonical locale source now exposes `useLanguage()` for dynamic React state, form messages, labels, and accessibility attributes. It uses the same dictionaries, URL query, and `loadwise-lang` persistence as the existing switcher; no second form locale state or parallel dictionary was created. The existing DOM translator remains in place for untouched pages.

## Regression Introduced by Recent Form Changes

The July 22 funnel commit changed:

- Contact hero and both path cards
- Request a Call description and benefit list
- Form labels and helper copy
- Referral-source field and options
- Loading, error, and success UI
- Shared navigation/footer Request a Call CTA
- Related homepage, platform, and manifesto CTAs

The English UI changed, but the canonical PT/ES dictionaries were not updated.

## Hardcoded or Bypassed Strings Found

Bypassed strings included the Contact hero, driver card, Request a Call content, form heading, labels, options, privacy helper, loading state, generic API error, success state, mobile navigation labels, shared Request a Call CTAs, and accessibility attributes.

Brand/proper-noun option labels (`Google`, `Facebook`, `Instagram`, `YouTube`, `LoadWise`) and neutral format examples remain intentionally unchanged. The affected flow has an automated AST check that rejects other visible JSX text not routed through `t()`.

## EN Dictionary Coverage

EN is now an explicit structural dictionary generated from the canonical source-key union. It contains the same keys as PT and ES and maps every source key to itself. English copy was not rewritten.

## PT Dictionary Coverage

PT includes complete Contact/Request a Call, dynamic form-state, validation, navigation, footer, accessibility, homepage CTA, and platform CTA coverage. Existing approved entries such as `ZIP Code` → `CEP`, `Email` → `E-mail`, operation options, partner copy, and shared chrome copy were reused.

## ES Dictionary Coverage

ES includes the same complete structural coverage as EN and PT. Existing approved entries such as `ZIP Code` → `Código postal`, `Email` → `Correo electrónico`, operation options, partner copy, and shared chrome copy were reused.

## Contact Page Correction

The complete Contact page now renders via the canonical translation hook:

- Hero eyebrow, title, and description
- Driver card
- Partner card
- Request a Call information panel
- Partner/company section
- Shared desktop/mobile header
- Shared footer

The same locale source drives all of these areas.

## Request a Call Form Correction

The form now translates:

- Heading and required-fields message
- All labels and translatable placeholders
- Operation and referral option labels
- Submit/loading text
- Privacy/helper text
- Required, email, and pattern validation messages
- Backend error presentation, including translated known messages
- Success confirmation
- Form, success, and submit accessibility labels

The browser’s validation rules remain the same. Only the displayed validation messages were localized. Backend response JSON is still parsed: string messages are preserved, message arrays are translated item-by-item where keys exist and then joined with spaces, and unknown specific messages remain visible. The localized generic error is used only when the response is malformed, empty, or has no usable message.

## Language Selector and Persistence

- EN/PT/ES update all React-translated Contact/chrome content from one locale store.
- The selected state and `aria-pressed` state use the same locale value.
- Selection writes the existing `loadwise-lang` key.
- Selection mirrors to the existing `?lang=` URL behavior.
- `popstate` and cross-tab storage changes update the canonical locale.
- Header/footer navigation now carries `?lang=` explicitly, including links with fragments.
- Contact fragment navigation preserves the current query.
- No Contact-specific locale state was added.
- `useSyncExternalStore` provides an EN server snapshot and client update without a hydration mismatch.

## Dictionary Parity Validation

`website/tests/contact-i18n.test.cjs` verifies:

- Identical EN/PT/ES dictionary shapes
- Every Contact/chrome `t()` key exists
- Principal PT/ES copy coverage
- Validation, error, loading, success, and accessibility coverage
- No unapproved visible hardcoded JSX text in the affected flow
- Visible public-page JSX remains covered by PT and ES
- Locale persistence/history/navigation use one source
- Canonical option values and payload fields remain unchanged

`website/tests/contact-runtime.test.tsx` mounts and interacts with the real Contact component in jsdom. It verifies:

- Initial EN rendering
- Complete EN → PT → ES → EN switching across header, hero, both cards, Request a Call section, every form control, options, CTA, helper text, placeholders, and accessibility labels
- No residual PT labels after switching to ES and no residual PT/ES required-field labels after returning to EN
- URL query and `loadwise-lang` synchronization
- PT and ES query-driven reload behavior
- Canonical option values and the submitted `FormData` payload after switching locale
- Known Backend-message translation
- Array-message joining with per-item translation
- Unknown Backend-message preservation
- Empty and malformed response fallback

## Form/API Compatibility

Preserved unchanged:

- Endpoint: `/api/applications`
- Submission method: `POST`
- Body construction: `new FormData(event.currentTarget)`
- Field names: `fullName`, `mobilePhone`, `zipCode`, `email`, `operationType`, `numberOfVehicles`, `equipmentType`, `leadSource`
- Operation values: `OWNER_OPERATOR`, `SMALL_FLEET`
- Lead-source values: `GOOGLE`, `FACEBOOK`, `INSTAGRAM`, `REFERRAL`, `YOUTUBE`, `OTHER`
- HTML validation constraints
- Success/error workflow

Backend error behavior is preserved:

- The response body is parsed as JSON.
- `result.message` strings are displayed.
- `result.message` arrays retain the original space-joining behavior.
- Known dictionary messages are translated for the selected locale.
- Unknown operational messages are preserved verbatim rather than hidden.
- The localized generic message is used only when there is no usable Backend message.

No Backend files, database schema, analytics, notifications, CRM integration, spam protection, or rate limiting were changed.

## Translation Keys Added or Restored

Contact/Request a Call:

- `TALK TO OUR TEAM`
- `Let’s talk about`
- `your operation.`
- Contact hero description
- `FOR DRIVERS`
- `Request a call`
- Driver-card description and action
- `REQUEST A CALL`
- `Request a Call`
- Request information heading, description, and four benefit items
- Success heading and description
- `All fields required`
- `Full Name`
- `Your full name`
- `Mobile Phone`
- `Operation Type`
- `Number of Vehicles`
- `Equipment Type`
- `How did you hear about Liberty?`
- `Referral`
- `Other`
- `Sending...`
- Privacy/helper message
- Generic request error

Validation/accessibility:

- `Language`
- `LoadWise home`
- `Open navigation`
- `Close navigation`
- `Main navigation`
- Three localized validation messages
- `Request a Call form`
- `Request submitted successfully`
- `Send request`

Related public CTA coverage:

- Homepage owner-operator/small-fleet CTA description
- `Talk to our team →`
- `Tell us about your`
- Platform request-a-conversation description

## Files Modified

- `website/app/LanguageSwitcher.tsx`
- `website/app/SiteChrome.tsx`
- `website/app/contact/page.tsx`
- `website/components/LanguageSwitcher.tsx`
- `website/components/SiteChrome.tsx`
- `website/lib/applicationError.ts`
- `website/package.json`
- `website/package-lock.json`
- `website/tests/contact-i18n.test.cjs`
- `website/tests/contact-runtime.test.tsx`
- `website/tests/setup.ts`
- `website/vitest.config.ts`
- `REPORT-HOTFIX-CONTACT-TRANSLATION-RESTORATION.md`

## Tests Performed

- `npm.cmd test`: PASS — 8/8 static/parity tests and 11/11 executable runtime tests
- `npm.cmd run test:runtime`: PASS — 11/11
- `npm.cmd run typecheck`: PASS
- `npm.cmd run build`: PASS
- Next production build internal type/lint phase: PASS
- `git diff --check`: PASS
- Existing standalone `npm.cmd run lint`: BLOCKED by the repository’s pre-existing interactive Next ESLint configuration prompt; no ESLint config is committed
- Form compatibility: PASS through static contract assertions
- Public-page visible-text coverage: PASS

## Visual Validation

**VISUAL VALIDATION PENDING**

A production server was built and started locally, but the provided browser-control environment reported no available browser backend. Therefore no EN/PT/ES desktop/mobile screenshots were fabricated or claimed. Executable jsdom component coverage passed, but it is not a substitute for visual screenshots.

Required visual evidence still pending:

- Contact: EN/PT/ES desktop and mobile
- Request a Call form: EN/PT/ES desktop and mobile

## Remaining Risks

- Real-browser screenshot evidence remains pending because no browser backend was available.
- The repository’s global translation fallback remains a client-side exact-text DOM translator outside explicitly repaired shared/Contact components. This intentional existing behavior was preserved.
- Server-generated metadata remains English because the existing architecture has no server locale handling.
- Standalone ESLint remains unconfigured and interactive; the production build’s built-in checks passed.

## Deployment Status

Not committed. Not pushed. Not deployed.

## Explicit Answers

1. **Why did PT remain selected while English text was rendered?** PT selection/persistence worked, but newly introduced English strings were absent from the exact-match PT dictionary, so the intentional fallback returned English.
2. **Which components bypassed the translation system?** The July 22 Contact/Request a Call component, its dynamic form states and accessibility attributes, and newly changed shared/home/platform CTAs. Duplicate app-level switcher/chrome files also risked divergence.
3. **Were any translation keys missing?** Yes. The newly introduced Request a Call and related CTA keys were missing from PT and ES.
4. **Are EN, PT, and ES now structurally complete?** Yes. Automated parity and affected-key checks pass.
5. **Does navigation preserve the selected locale?** Yes. Shared navigation/footer URLs explicitly carry `?lang=`, fragment URLs retain it, local storage persists it, and history changes are observed.
6. **Were form payloads and canonical option values preserved?** Yes. Automated assertions cover the endpoint, body construction, field names, and all canonical option values.
7. **Was any marketing copy changed?** No English marketing copy was rewritten, shortened, removed, or reinterpreted.
8. **Is any visible hardcoded text still present in the affected flow?** Only approved proper nouns/brand labels, a contact email address, numeric/format examples, and symbols. The automated test rejects other visible hardcoded JSX text.
