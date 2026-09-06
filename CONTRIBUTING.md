# Contributing

The corpus in `/content` is the thing this project is actually for. Code
contributions are welcome, but a well-sourced record is worth more than
almost any feature.

## Submitting a sourced record

Add an entry to `content/records.json` following this template:

```jsonc
{
  "id": "context.datum_name",                 // dotted, lowercase, e.g. "driving.anpr.read"
  "datum": "A plain-language description of the specific thing recorded",
  "holder_type": "who_holds_it",               // snake_case category, e.g. "transit_operator"
  "holder_examples": ["A named example, if useful"],
  "kind": "emitted",                           // "emitted" | "inferred" | "relational" — see METHOD.md
  "mechanism": "How this is actually generated or computed",
  "conditions": ["When this applies — not every record applies universally"],
  "jurisdictions": ["UK"],                     // where the cited evidence applies, if known
  "confidence": "documented",                  // "documented" | "reported" | "modelled"
  "sources": [
    {
      "title": "Exact title of the source",
      "publisher": "Who published it",
      "url": "https://...",                    // must be real and load
      "date": "2024-03-11",                    // YYYY, YYYY-MM, or YYYY-MM-DD
      "type": "regulatory"                     // regulatory | litigation | journalism | academic | policy | vendor_doc
    }
  ],
  "tags": ["context-tag"]
}
```

### The one rule that matters

**Never invent a citation.** If you can't point to a real regulator finding,
court record, credible news report, peer-reviewed research, official policy
guidance, or a vendor's own documentation, set `confidence` to `"modelled"`
and leave `sources` as an empty array. That is a normal, expected, and
useful contribution — most inference records are like this, because
inference is what these systems disclose least. `confidence: "documented"`
or `"reported"` with an empty or fabricated `sources` array will be rejected
in review, and `scripts/validate-content.mjs` fails CI on an empty list at
those tiers (it cannot verify a URL is genuine — that's on the reviewer and
on you).

### Before opening a pull request

```sh
npm run validate:content
```

This checks the record schema, cross-references (every id used in
`modules.json`, `day.json`, and `profile.json` must exist in
`records.json`), and that every language file in `content/strings/` has the
same keys as `content/strings/en.json`.

## Adding a language

Copy `content/strings/en.json` to `content/strings/<code>.json`, translate
every value, and set `meta.language`, `meta.dir` (`"ltr"` or `"rtl"`), and
`meta.label` (the language's own name, as it should appear in the language
picker). No code change is required — the app discovers every file in that
directory automatically. `content/strings/ar.json` is a complete
right-to-left example to check your file against.

## Code contributions

- `/src` is plain React + TypeScript, no state-management library, no UI
  framework. Keep new dependencies to zero if at all possible — the app's
  privacy guarantee depends on not accumulating code that could someday
  make a network call.
- Run `npm run typecheck` and `npm test` before opening a PR.
- Accessibility is a release requirement, not a follow-up: keyboard-operate
  anything you add, and give it an accessible name.
