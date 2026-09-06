# On the record

Two views on what ordinary life puts on the record: what a single described
action generates, and what accumulates across twenty-four hours.

Static site. No build step, no dependencies, no analytics.

## Files

    index.html    markup and the shell for both tabs
    styles.css    design tokens and layout
    app.js        the corpus and all rendering

## Deploy to GitHub Pages

1. Create a repository and push these three files to the root of `main`.
2. Repository → Settings → Pages.
3. Under "Build and deployment", set Source to **Deploy from a branch**,
   branch `main`, folder `/ (root)`. Save.
4. The site appears at `https://<user>.github.io/<repo>/` within a minute or two.

To preview locally, open `index.html` directly, or run
`python3 -m http.server` in this folder and visit `localhost:8000`.

## Editing the content

Everything worth changing lives at the top of `app.js`.

- `MODULES` — keyword-matched record sets for the "One action" tab. Add an
  entry with `keys` and `records` to cover a new kind of act.
- `PHONE` — records that always apply, on the assumption a phone is present.
- `DAY` — the twenty-four hour composite. `t` is minutes past midnight.
- `PROFILE` — the conclusions shown at the end of the day.

Records are built with three helpers, and the distinction is the point of the
whole thing:

- `em()` / `E()` — **emitted**: the person produced it.
- `inf()` / `I()` — **inferred**: a model produced it; they never gave it.
- `rel()` / `R()` — **relational**: it concerns other people too.

## On accuracy

The corpus is hand-written and illustrative, not an audit of any named company.
Volumes are plausible orders of magnitude rather than observed counts. The
ad-auction figures follow the Irish Council for Civil Liberties' estimate of 462
real-time-bidding broadcasts per day for a UK adult (376 across Europe, 747 in
the US): https://www.iccl.ie/rtb/

Emitted records are broadly auditable. Inferred ones mostly are not, because
inference is the part firms do not publish — those lines are drawn from
regulatory findings, reporting, and patents rather than observation. If you
extend this, adding a source field per record would be the single biggest
improvement.
