const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const switcherPath = path.join(root, "components", "LanguageSwitcher.tsx");
const contactPath = path.join(root, "app", "contact", "page.tsx");
const chromePath = path.join(root, "components", "SiteChrome.tsx");
const switcherSource = fs.readFileSync(switcherPath, "utf8");
const contactSource = fs.readFileSync(contactPath, "utf8");
const chromeSource = fs.readFileSync(chromePath, "utf8");

function sourceFile(file, source) {
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function stringProperties(object) {
  return Object.fromEntries(object.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property)) return [];
    const key = property.name.text;
    const value = property.initializer.text;
    return typeof key === "string" && typeof value === "string" ? [[key, value]] : [];
  }));
}

function loadDictionaries() {
  const sf = sourceFile(switcherPath, switcherSource);
  const pt = {};
  const es = {};
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === "pt" && ts.isObjectLiteralExpression(node.initializer)) {
      Object.assign(pt, stringProperties(node.initializer));
    }
    if (ts.isCallExpression(node) && node.expression.getText(sf) === "Object.assign" && ts.isIdentifier(node.arguments[0]) && ts.isObjectLiteralExpression(node.arguments[1])) {
      const target = node.arguments[0].text;
      if (target === "pt") Object.assign(pt, stringProperties(node.arguments[1]));
      if (target === "es") Object.assign(es, stringProperties(node.arguments[1]));
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  for (const key of Object.keys(pt)) if (!(key in es)) es[key] = key;
  const en = Object.fromEntries([...new Set([...Object.keys(pt), ...Object.keys(es)])].map((key) => [key, key]));
  return { en, pt, es };
}

function translationCalls(file, source) {
  const sf = sourceFile(file, source);
  const keys = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(sf) === "t" && ts.isStringLiteral(node.arguments[0])) keys.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return keys;
}

const dictionaries = loadDictionaries();
const contactKeys = translationCalls(contactPath, contactSource);
const chromeKeys = translationCalls(chromePath, chromeSource);

test("EN, PT, and ES canonical dictionaries have identical shapes", () => {
  const expected = Object.keys(dictionaries.en).sort();
  assert.deepEqual(Object.keys(dictionaries.pt).sort(), expected);
  assert.deepEqual(Object.keys(dictionaries.es).sort(), expected);
});

test("Contact and shared chrome only reference existing translation keys", () => {
  for (const key of [...contactKeys, ...chromeKeys]) {
    for (const lang of ["en", "pt", "es"]) assert.ok(key in dictionaries[lang], `${lang} is missing ${key}`);
  }
});

test("Contact's principal copy is distinct and complete in PT and ES", () => {
  const expected = {
    "Request a Call": ["Solicite uma ligação", "Solicita una llamada"],
    "Full Name": ["Nome completo", "Nombre completo"],
    "Mobile Phone": ["Telefone celular", "Teléfono móvil"],
    "Operation Type": ["Tipo de operação", "Tipo de operación"],
    "Number of Vehicles": ["Número de veículos", "Número de vehículos"],
    "Equipment Type": ["Tipo de equipamento", "Tipo de equipo"],
    "How did you hear about Liberty?": ["Como você conheceu a Liberty?", "¿Cómo conociste a Liberty?"],
    "All fields required": ["Todos os campos são obrigatórios", "Todos los campos son obligatorios"]
  };
  for (const [key, [pt, es]] of Object.entries(expected)) {
    assert.equal(dictionaries.en[key], key);
    assert.equal(dictionaries.pt[key], pt);
    assert.equal(dictionaries.es[key], es);
  }
});

test("dynamic validation, API error, loading, success, and accessibility text is translated", () => {
  const dynamicKeys = [
    "Please complete this field.",
    "Please enter a valid email address.",
    "Please match the requested format.",
    "We couldn't send your request right now.",
    "Sending...",
    "We received your request.",
    "Request a Call form",
    "Request submitted successfully",
    "Send request"
  ];
  for (const key of dynamicKeys) {
    assert.ok(contactKeys.includes(key), `${key} is not rendered through t()`);
    assert.notEqual(dictionaries.pt[key], key);
    assert.notEqual(dictionaries.es[key], key);
  }
});

test("translated option labels preserve canonical submitted values and payload fields", () => {
  for (const value of ["OWNER_OPERATOR", "SMALL_FLEET", "GOOGLE", "FACEBOOK", "INSTAGRAM", "REFERRAL", "YOUTUBE", "OTHER"]) {
    assert.match(contactSource, new RegExp(`value=[\"']${value}[\"']`));
  }
  for (const field of ["fullName", "mobilePhone", "zipCode", "email", "operationType", "numberOfVehicles", "equipmentType", "leadSource"]) {
    assert.match(contactSource, new RegExp(`name=[\"']${field}[\"']`));
  }
  assert.match(contactSource, /body:\s*new FormData\(event\.currentTarget\)/);
  assert.match(contactSource, /fetch\("\/api\/applications"/);
});

test("locale switching, persistence, history, and locale-preserving navigation use one canonical source", () => {
  assert.match(switcherSource, /localStorage\.setItem\("loadwise-lang", next\)/);
  assert.match(switcherSource, /new URLSearchParams\(location\.search\)\.get\("lang"\)/);
  assert.match(switcherSource, /window\.addEventListener\("popstate"/);
  assert.match(switcherSource, /useSyncExternalStore/);
  assert.doesNotMatch(contactSource, /useState<Lang>|loadwise-lang|URLSearchParams/);
  assert.match(chromeSource, /localizedHref/);
  assert.match(chromeSource, /lang=\$\{lang\}/);
});

test("affected flow has no untranslated visible JSX copy outside approved proper nouns and format examples", () => {
  const sf = sourceFile(contactPath, contactSource);
  const allowed = new Set(["Google", "Facebook", "Instagram", "YouTube", "contact@loadwisesys.com", "✓"]);
  const visible = [];
  function visit(node) {
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      if (/[A-Za-zÀ-ÿ]/.test(text)) visible.push(text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  assert.deepEqual(visible.filter((text) => !allowed.has(text)), []);
});

test("public pages retain PT and ES dictionary coverage for visible JSX text", () => {
  const allowed = new Set([
    "23 mi",
    "LOADWISE",
    "LOADWISE AI",
    "LOADWISE INTELLIGENCE",
    "Google",
    "Facebook",
    "Instagram",
    "YouTube",
    "contact@loadwisesys.com"
  ]);
  const appRoot = path.join(root, "app");
  const pageFiles = [];
  function collect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(target);
      else if (entry.name === "page.tsx") pageFiles.push(target);
    }
  }
  collect(appRoot);
  for (const file of pageFiles) {
    const sf = sourceFile(file, fs.readFileSync(file, "utf8"));
    function visit(node) {
      if (ts.isJsxText(node)) {
        const text = node.text.replace(/\s+/g, " ").trim();
        if (/[A-Za-z]/.test(text) && !allowed.has(text)) {
          assert.ok(text in dictionaries.pt, `PT missing public text "${text}" in ${path.relative(root, file)}`);
          assert.ok(text in dictionaries.es, `ES missing public text "${text}" in ${path.relative(root, file)}`);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
});
