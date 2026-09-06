# Licensing

This repository is deliberately dual-licensed, because the code and the
corpus are different kinds of asset.

## `/src`, `/src-tauri`, and everything else outside `/content` — MIT

The application code — the React app, the Tauri wrapper, build config, CI,
scripts — is licensed under the [MIT License](LICENSE). Use it, fork it,
build a competing app with it. It is not the valuable part on its own.

## `/content` — CC BY-NC-SA 4.0

The corpus (`records.json`, `modules.json`, `day.json`, `profile.json`) and
the UI strings (`strings/*.json`) are licensed under
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)
(full legal text linked there; see `content/LICENSE` for the notice that
travels with the content directory itself).

In short, for the content only: you may share and adapt it, with
attribution, for non-commercial purposes, under the same licence. You may
not use it commercially without a separate licence.

### Why the boundary is drawn here

The application is a reference implementation. The corpus — sourced,
classified, confidence-rated records of what ordinary actions put on
record — is the part that took (and keeps taking) real research effort, and
it is the part with standalone commercial value: for training material,
compliance tooling, journalism, or curriculum use beyond this app. Keeping
it under a non-commercial share-alike licence preserves the option to offer
separate commercial licences for that use, while keeping the app itself
maximally reusable.

### Commercial licensing

Commercial licences for `/content` — for use beyond what CC BY-NC-SA 4.0
permits — are available separately. Open an issue on this repository to
start that conversation, or contact the maintainer directly.

### If you're contributing content

By submitting a record, translation, or other addition to `/content`, you
agree to license your contribution under CC BY-NC-SA 4.0, consistent with
the rest of the directory. See [`CONTRIBUTING.md`](CONTRIBUTING.md).
