// A minimal, dependency-free subset of ICU MessageFormat: plain
// {placeholder} substitution plus {name, plural, one {...} other {...}}
// blocks. Covers exactly what the string files in /content/strings use —
// no intl-messageformat dependency needed for that.

type Params = Record<string, string | number>;

function findMatchingBrace(str: string, openIndex: number): number {
  let depth = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parsePluralCases(body: string): Record<string, string> {
  const cases: Record<string, string> = {};
  const re = /(zero|one|two|few|many|other)\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body))) {
    const openIndex = match.index + match[0].length - 1;
    const closeIndex = findMatchingBrace(body, openIndex);
    if (closeIndex === -1) break;
    cases[match[1]] = body.slice(openIndex + 1, closeIndex);
    re.lastIndex = closeIndex + 1;
  }
  return cases;
}

function resolvePlural(name: string, body: string, params: Params, locale: string): string {
  const raw = params[name];
  const count = typeof raw === "number" ? raw : Number(raw ?? 0);
  const cases = parsePluralCases(body);
  let category: string;
  try {
    category = new Intl.PluralRules(locale).select(count);
  } catch {
    category = count === 1 ? "one" : "other";
  }
  const chosen = cases[category] ?? cases.other ?? "";
  return chosen.replace(/#/g, String(count));
}

export function formatMessage(template: string, params: Params = {}, locale = "en"): string {
  let result = template;

  // Resolve {name, plural, ...} blocks (may be nested arbitrarily deep,
  // so loop until none remain).
  let guard = 0;
  while (guard++ < 20) {
    const re = /\{(\w+),\s*plural,\s*/g;
    const match = re.exec(result);
    if (!match) break;
    const name = match[1];
    const blockStart = match.index;
    const bodyStart = match.index + match[0].length - 1;
    const bodyClose = findMatchingBrace(result, bodyStart);
    if (bodyClose === -1) break;
    const body = result.slice(bodyStart + 1, bodyClose);
    const replacement = resolvePlural(name, body, params, locale);
    result = result.slice(0, blockStart) + replacement + result.slice(bodyClose + 1);
  }

  // Simple {name} substitution for whatever remains.
  result = result.replace(/\{(\w+)\}/g, (_, name) =>
    name in params ? String(params[name]) : `{${name}}`
  );

  return result;
}
