<p align="center">
  <img src="https://img.shields.io/badge/status-in%20development-4ADE80?style=flat-square&labelColor=161A18" alt="In development">
  <img src="https://img.shields.io/badge/terms-153-5EC8D8?style=flat-square&labelColor=161A18" alt="153 terms">
  <img src="https://img.shields.io/badge/language-Turkish-93A099?style=flat-square&labelColor=161A18" alt="Turkish">
</p>

<p align="center">
  <a href="README.md">Türkçe</a> · <b>English</b>
</p>

<br>

## What is it?

**Tekno Terim** is a Turkish-language reference application that teaches the
terminology of MSP/MSSP, server hosting, domain/DNS, and network security work,
and (soon) collects the small tools you need day to day in one place.

> **A note for English-speaking visitors:** the application itself is in
> Turkish, deliberately. This field's vocabulary is overwhelmingly English, and
> people working in it in Türkiye learn the terms by absorbing them rather than
> understanding them. Tekno Terim exists to close that gap — an English version
> would be solving a problem that does not exist.

For someone working in this field, terminology, current news, and exchange-rate
tracking are scattered across separate sources. Tekno Terim brings them together
in one plain, fast, ad-free interface — no installation, no account, no clutter.

> **Status:** under redevelopment. The glossary and the practice mode work and
> the new visual package (Grafit) is in; the news feed and the currency
> converter are next. The old
> version is still served at `rootline.cansoykanyilmaz.com` and will redirect
> here once the new one is ready.

<br>

## What's inside?

| | |
| :-- | :-- |
| **`/sozluk`** (glossary) | 153 terms. Accent-insensitive search and category filters. Each term is explained in four layers: *what it is* → *what it is used for* → *where you'll run into it* → *a concrete example*. |
| **`/calis`** (practice) | Questions generated from the content itself; a wrong answer brings the term back (spaced repetition). Progress is kept in your browser only. |

Planned: **`gündem`** (a news feed with original Turkish summaries — never
copied from the source) and a **currency converter** (rates fetched server-side
from TCMB, the Central Bank of the Republic of Türkiye).

<br>

## Design and engineering approach

Tekno Terim treats simplicity and privacy as principles:

- **No third-party analytics.** Visitor numbers are measured with a small
  collector we wrote ourselves; the IP address is never stored, there are no
  cookies, and `DNT`/Global Privacy Control are honoured.
- **Self-hosted fonts.** No connections to third parties such as Google Fonts;
  no visitor data leaves the site.
- **No outbound requests from the browser.**
- **Content lives in the repository.** One term is one Markdown file, so every
  term is a small, reviewable change. A missing or malformed field fails the
  build instead of silently producing a broken page.
- **Honest data.** Rates are labelled with their source; misleading phrasing
  such as "real time" or "bank rate" is not used.
- **Respect for copyright.** News summaries will not be copied from the source;
  they will be written in our own words, with a link to the original.
- **Accessibility.** Full keyboard navigation, screen-reader support, WCAG AA
  contrast targets, and `prefers-reduced-motion` support.

<br>

## Source code

The source code of the application is in this repository, alongside the term
content. Issues and pull requests are welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md).

<br>

## Licence

Copyright © 2026 Can Soykan Yılmaz. All rights reserved.

Tekno Terim is free to use in your browser, and you may use the term
explanations in your own learning or when training your team, with attribution.
Bulk copying of the content, use of the brand, and scraping for AI training
require permission. Details: [LICENSE](LICENSE).

<br>

---

<p align="center">
  <sub>A <a href="https://cansoykanyilmaz.com">cansoykanyilmaz.com</a> project · © 2026</sub>
</p>
