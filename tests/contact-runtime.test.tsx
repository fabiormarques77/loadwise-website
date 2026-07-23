import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Contact from "@/app/contact/page";
import { dictionaries, setLanguage, type Lang } from "@/components/LanguageSwitcher";
import { applicationErrorMessage } from "@/lib/applicationError";

const formKeys = [
  "REQUEST A CALL",
  "All fields required",
  "Full Name",
  "Mobile Phone",
  "ZIP Code",
  "Email",
  "Operation Type",
  "Number of Vehicles",
  "Equipment Type",
  "How did you hear about Liberty?",
  "Select",
  "Owner-operator",
  "Small fleet",
  "Referral",
  "Other",
  "Request a Call",
  "Your information is used only to review and respond to this request."
] as const;

const pageKeys = [
  "Platform",
  "Contact",
  "TALK TO OUR TEAM",
  "Let’s talk about",
  "your operation.",
  "FOR DRIVERS",
  "Request a call",
  "Owner-operators and small fleets are welcome.",
  "FOR PARTNERS",
  "Explore a partnership",
  "Technology, freight, capital or ecosystem collaboration.",
  "One minute now.",
  "A real conversation next.",
  "No documents needed",
  "No account creation",
  "No onboarding commitment",
  "Reviewed directly by our dispatch team",
  "PARTNERSHIPS & COMPANY"
] as const;

function expectCompleteLocale(lang: Lang) {
  const dictionary = dictionaries[lang];
  const body = document.body.textContent ?? "";
  for (const key of [...pageKeys, ...formKeys]) expect(body).toContain(dictionary[key]);

  expect(screen.getByPlaceholderText(dictionary["Your full name"])).toBeInTheDocument();
  expect(screen.getByPlaceholderText(dictionary["Cargo van, box truck, hot shot…"])).toBeInTheDocument();
  for (const key of ["Full Name", "Mobile Phone", "ZIP Code", "Email", "Operation Type", "Number of Vehicles", "Equipment Type", "How did you hear about Liberty?"]) {
    expect(screen.getByLabelText(dictionary[key])).toBeInTheDocument();
  }
  const operation = screen.getByLabelText(dictionary["Operation Type"]);
  expect(within(operation).getByRole("option", { name: dictionary["Select"] })).toHaveValue("");
  expect(within(operation).getByRole("option", { name: dictionary["Owner-operator"] })).toHaveValue("OWNER_OPERATOR");
  expect(within(operation).getByRole("option", { name: dictionary["Small fleet"] })).toHaveValue("SMALL_FLEET");

  expect(screen.getByRole("form", { name: dictionary["Request a Call form"] })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: dictionary["Send request"] })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: dictionary["Main navigation"] })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: dictionary["Open navigation"] })).toBeInTheDocument();
  expect(screen.getByLabelText(dictionary["Language"])).toBeInTheDocument();
}

async function selectLanguage(lang: "EN" | "PT" | "ES") {
  await userEvent.click(screen.getByRole("button", { name: lang }));
  await waitFor(() => expect(document.documentElement.lang).toBe(lang === "PT" ? "pt-BR" : lang.toLowerCase()));
}

describe("Contact runtime locale behavior", () => {
  beforeEach(() => {
    localStorage.clear();
    history.replaceState({}, "", "/contact");
    act(() => setLanguage("en", false));
  });

  it("renders EN initially and switches the complete flow EN → PT → ES → EN without mixed labels", async () => {
    render(<Contact />);
    expectCompleteLocale("en");

    await selectLanguage("PT");
    expectCompleteLocale("pt");
    expect(location.search).toBe("?lang=pt");
    expect(localStorage.getItem("loadwise-lang")).toBe("pt");

    await selectLanguage("ES");
    expectCompleteLocale("es");
    expect(document.body.textContent).not.toContain(dictionaries.pt["All fields required"]);
    expect(document.body.textContent).not.toContain(dictionaries.pt["How did you hear about Liberty?"]);
    expect(location.search).toBe("?lang=es");
    expect(localStorage.getItem("loadwise-lang")).toBe("es");

    await selectLanguage("EN");
    expectCompleteLocale("en");
    expect(document.body.textContent).not.toContain(dictionaries.es["All fields required"]);
    expect(document.body.textContent).not.toContain(dictionaries.pt["All fields required"]);
  });

  it.each([
    ["pt", "pt-BR"],
    ["es", "es"]
  ] as const)("loads %s from the URL query and synchronizes persisted locale", async (lang, htmlLang) => {
    history.replaceState({}, "", `/contact?lang=${lang}`);
    render(<Contact />);
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    await waitFor(() => expect(document.documentElement.lang).toBe(htmlLang));
    expectCompleteLocale(lang);
    expect(localStorage.getItem("loadwise-lang")).toBe(lang);
  });

  it("submits unchanged canonical values and field names after locale switching", async () => {
    let submitted: FormData | undefined;
    vi.stubGlobal("fetch", vi.fn(async (_url, init) => {
      submitted = init?.body as FormData;
      return new Response("{}", { status: 200 });
    }));
    render(<Contact />);
    await selectLanguage("PT");
    const pt = dictionaries.pt;
    await userEvent.type(screen.getByLabelText(pt["Full Name"]), "Maria Silva");
    await userEvent.type(screen.getByLabelText(pt["Mobile Phone"]), "3055550123");
    await userEvent.type(screen.getByLabelText(pt["ZIP Code"]), "33101");
    await userEvent.type(screen.getByLabelText(pt["Email"]), "maria@example.com");
    await userEvent.selectOptions(screen.getByLabelText(pt["Operation Type"]), "OWNER_OPERATOR");
    await userEvent.type(screen.getByLabelText(pt["Number of Vehicles"]), "2");
    await userEvent.type(screen.getByLabelText(pt["Equipment Type"]), "Cargo van");
    await userEvent.selectOptions(screen.getByLabelText(pt["How did you hear about Liberty?"]), "REFERRAL");
    await userEvent.click(screen.getByRole("button", { name: pt["Send request"] }));

    await waitFor(() => expect(submitted).toBeDefined());
    expect(Object.fromEntries(submitted!.entries())).toEqual({
      fullName: "Maria Silva",
      mobilePhone: "3055550123",
      zipCode: "33101",
      email: "maria@example.com",
      operationType: "OWNER_OPERATOR",
      numberOfVehicles: "2",
      equipmentType: "Cargo van",
      leadSource: "REFERRAL"
    });
  });
});

describe("Backend application error presentation", () => {
  const response = (body: unknown, malformed = false) => ({
    json: malformed ? vi.fn().mockRejectedValue(new SyntaxError("bad json")) : vi.fn().mockResolvedValue(body)
  });

  it("translates a known Backend message", async () => {
    expect(await applicationErrorMessage(response({ message: "Please complete this field." }), (key) => dictionaries.pt[key] ?? key))
      .toBe(dictionaries.pt["Please complete this field."]);
  });

  it("joins array errors while translating known entries and preserving unknown entries", async () => {
    const message = await applicationErrorMessage(
      response({ message: ["Please complete this field.", "Dispatch reference ABC-123 is unavailable."] }),
      (key) => dictionaries.es[key] ?? key
    );
    expect(message).toBe(`${dictionaries.es["Please complete this field."]} Dispatch reference ABC-123 is unavailable.`);
  });

  it("preserves an unknown specific Backend error", async () => {
    expect(await applicationErrorMessage(response({ message: "Database operation timed out for request LW-42." }), (key) => dictionaries.pt[key] ?? key))
      .toBe("Database operation timed out for request LW-42.");
  });

  it.each([
    [response({})],
    [response({ message: "" })],
    [response(null)],
    [response(null, true)]
  ])("uses the localized generic fallback for malformed or empty responses", async (backendResponse) => {
    expect(await applicationErrorMessage(backendResponse, (key) => dictionaries.es[key] ?? key))
      .toBe(dictionaries.es["We couldn't send your request right now."]);
  });
});
