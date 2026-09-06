# Method

How the corpus in `/content/records.json` is built, what its confidence
tiers mean, and what this app cannot know.

## What a record is

Each record names:

- **datum** — the specific piece of data.
- **holder_type** — the category of organisation that holds it (a transit
  operator, an insurer, a data broker, a handset OS vendor...).
- **kind** — `emitted`, `inferred`, or `relational` (see the README for what
  these mean; this classification is not negotiable per record — it's the
  reason the app exists).
- **mechanism** — how the datum is actually generated or computed.
- **conditions** — when the record applies (not every record applies to
  every person, place, or device).
- **jurisdictions** — where the cited evidence applies, if known.
- **confidence** — see below.
- **sources** — real, checkable citations, or an empty list.

## The confidence tiers

Every record carries exactly one of three values, and the UI shows it on
every record so nobody mistakes one tier for another:

- **documented** — a regulator, a court, or the holder's own disclosure
  supports this in writing.
- **reported** — credible journalism or peer-reviewed research describes
  this.
- **modelled** — no public source exists. The record describes how this
  class of system is known to work, based on publicly understood mechanisms
  (how fare systems, ad auctions, telematics, etc. generally function), not
  on a specific disclosure.

**The rule that protects the whole product:** a record marked `documented`
or `reported` must carry at least one real, verifiable source. If no such
source exists, the record is marked `modelled` and its `sources` array is
left empty. An empty source list on a `modelled` record is correct and
expected — most inference records fall here, because inference is the part
of these systems that is least often disclosed. A record with an invented
URL, on the other hand, is not a shortcut; it is a defect that undermines
every other record in the corpus, and `scripts/validate-content.mjs` fails
the build if a `documented` or `reported` record has no source. That check
cannot verify a URL is real — it can only catch an empty list. Verifying
that a citation is genuine is a human review step every time a record's
confidence is raised above `modelled`.

## What this app cannot know

This is not a live audit of any named company. It does not know what any
specific data holder does with any specific person's data today. Practices
change, vary by jurisdiction and by product configuration, and are
frequently undisclosed by design — that opacity is itself one of the things
the app is trying to make visible. Every count in the "One day" composite is
a plausible order of magnitude for illustration, not a measurement of any
real person's day.

## Why inference is the least documentable part, by nature

Emitted records usually leave some trace the person themselves can point
to — a tap, a call log, a receipt. Inferences are computed internally,
rarely disclosed as a matter of policy, and almost never shown back to the
person they describe. The category that most needs scrutiny is structurally
the one with the least public evidence to scrutinise. That asymmetry is not
a gap in this corpus to apologise for — it's the argument the "One day" view
is making with its ratio of thousands of emissions to around twenty
inferences: volume and consequence sit in different places.

## Contributing a sourced record

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the template. The short version:
name the mechanism precisely, attach a real source if one exists, and default
to `modelled` if it doesn't.
