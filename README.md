# Sri Lanka Budget Game

An interactive, browser-based budgeting game that teaches how Sri Lanka's national Budget is assembled and debated.

The game is designed as an educational simulation for responsible citizens, students, and policy-curious players. It coincides with the 2027 Budget debate cycle and walks players through the same broad trade-offs the Government faces when preparing a national Budget: how to raise revenue, how much to spend, and how to balance growth, welfare, debt sustainability, inflation, and public services.

Original concept, source materials, and project ownership are attributed to Sarika, who owns the GitHub repository.

## Purpose

The aim is not to predict the real Budget outcome. It is to make the Budget process easier to understand by showing how one decision affects another. Players see the tension between fiscal discipline and public investment, and between immediate political pressure and long-term economic resilience.

The model starts from the 2027 Appropriation Bill and IMF projections, and uses simplified assumptions to represent the consequences of later choices. If you make no changes, the game keeps every allocation as proposed in the Bill. That makes it easier to compare each choice against an established starting point.

## What the game covers

The current draft follows a policy journey through the main spending and revenue areas of Sri Lanka's Budget, including:

- revenue and tax policy
- education
- health
- welfare and social protection, including whether payments rise with inflation
- defence
- energy and electricity
- infrastructure (transport, highways, urban development, housing and water supply)
- agriculture, including irrigation
- public administration
- digital economy and government
- environment and disaster management, through an emergency reserve

It also highlights budget constraints and monitoring points such as fiscal targets, debt pressure, inflation, market confidence, and the role of the IMF programme context.

The game is intended to help players understand questions such as:

- What happens if spending rises faster than revenue?
- What happens if taxes are raised through different channels?
- What happens if investment is prioritised over short-term savings?
- What happens if social protection is expanded or tightened?

## How it works

The game is implemented as a single-page HTML experience with interactive controls such as:

- sliders for funding changes
- multiple-choice policy decisions
- step-by-step screens for each policy area
- feedback panels that summarise the consequences of the choices you make
- budget and fiscal indicators that update as the game progresses

Revenue choices are modelled as fixed rupee adjustments. Spending choices are percentage changes from each sector's 2027 Appropriation Bill allocation, and the emergency reserve is set in rupees (Rs 0 to 750 bn, in steps of Rs 250 bn). The interface is intentionally lightweight so it can run in a browser without any build step or extra dependencies.

The source notes for the model describe it as a learning tool built from published Sri Lankan Budget and economic data, with assumptions chosen to make trade-offs visible rather than to forecast exact outcomes.

## How the model works

The full explanation is in *Sri Lanka Budget Game 2027: How the model works* (`Sri_Lanka_Budget_Game_How_the_Model_Works.docx`) and the companion Excel workbook (`sri_lanka_budget_game_math.xlsx`), which holds the same calculations as formulas. Neither file is stored in this repository. This section summarises them and reflects the current code; where the two differ, the code is authoritative.

The game is a simulation, not a government forecast. Published figures come from official sources. The way growth, inflation, interest rates and the rupee respond to the player's choices is a set of simplified game assumptions, so the game shows the direction of trade-offs rather than precise outcomes.

### Starting point (2027)

| Assumption | Value | Source |
| --- | --- | --- |
| Nominal GDP 2026 | Rs 35,835 bn | IMF Country Report 26/111 |
| Real GDP growth 2027 | 3.2% | IMF Country Report 26/111 |
| Inflation 2027 | 5.3% (about 8% in Aug–Sep 2026) | IMF Country Report 26/111; CBSL |
| Rupee depreciation | 4% over the year | Game assumption (spot about Rs 330.7 per US$, 1 Oct 2026) |
| 1-year Treasury bill rate | 9.25% | CBSL, 1 Oct 2026 |
| Revenue and grants 2026 | 15.2% of GDP | IMF Country Report 26/111 |
| Interest 2027 | 6.0% of GDP (Rs 2,333 bn) | IMF Country Report 26/111 |
| Public debt 2026 | 100.1% of GDP | IMF |
| Spending before interest, 2027 Bill | Rs 4,992.8 bn | 2027 Appropriation Bill (recurrent 3,240.2 + capital 1,752.5) |
| Ceiling on spending before interest | 13% of GDP | IMF-linked limit reported in Aug 2026 |

Nominal GDP grows by (1 + 3.2%) × (1 + 5.3%) − 1, about 8.7%, to roughly Rs 38,944 bn in 2027. With no policy change, revenue grows at the same pace, from Rs 5,447 bn in 2026 to about Rs 5,920 bn. The Bill keeps spending before interest only about 1% above 2026, so with every slider at 0% each sector's share of GDP falls.

### 2027 Bill baselines

Each spending page starts from the Bill's allocation (`js/data/sectors.js`). Sliders measure a percentage change from this figure. The capital share feeds public investment and growth.

| Page | Bill allocation (Rs bn) | Capital share | Social? | Slider range |
| --- | --- | --- | --- | --- |
| Education | 328.0 | 0% | Yes | −10% to +10% |
| Health | 590.5 | 19% | Yes | −10% to +10% |
| Welfare | 79.8 | 45% | Yes | −10% to +10% |
| Defence | 458.0 | 0% | No | −10% to +10% |
| Energy | 30.2 | 96% | No | −20% to +20% |
| Infrastructure | 582.3 | 88% | No | −10% to +10% |
| Agriculture | 218.0 | 55% | No | −10% to +10% |
| Public Administration | 651.0 | 0% | No | −10% to +10% |
| Digital | 26.0 | 77% | Yes | −10% to +10% |
| Environment (emergency reserve) | Reserve slider | – | No | Rs 0 to 750 bn, in steps of Rs 250 bn |

Infrastructure is a game-defined total of Transport, Highways and Urban Development (Rs 500 bn) and Housing, Construction and Water Supply (Rs 82.3 bn). Agriculture includes irrigation, so irrigation is not counted again under Infrastructure. Welfare is the ministry total; Aswesuma payments are not itemised in the Bill. Energy is small, so even a 20% change moves only about Rs 6 bn.

### Player choices

- **Spending sliders.** A setting of p% on allocation B changes spending by B × p / 100. The capital part of that change is tracked separately. Education, Health, Welfare and Digital count as social spending.
- **Welfare and inflation.** Indexing applies 5.3% to the recurrent part of the welfare allocation only (Rs 43.8 bn of Rs 79.8 bn), about Rs 2.3 bn, and counts as social spending. Not indexing leaves spending unchanged, but recipients can buy about 5% less.
- **Emergency reserve.** The reserve counts as planned spending: it lowers the primary balance, raises the deficit and uses room under the 13% ceiling. It is excluded from the growth and inflation effects, because it is only spent if a disaster occurs. The Bill leaves about Rs 70 bn of room and the deepest possible cuts free about Rs 299 bn more, so a Rs 250 bn reserve needs large cuts elsewhere, and Rs 500 bn or more always breaks the ceiling.
- **Priority questions** change the on-screen explanation only, not the numbers.
- **Tax choices** (game assumptions that show the direction of the trade-offs):

| Question | Option | Revenue effect | Other effect |
| --- | --- | --- | --- |
| How to raise additional revenue | Taxes on income, profits and wealth | +Rs 80 bn | Inflation +0.1 pt |
| | Taxes on goods and services | +Rs 110 bn | Inflation +0.8 pt |
| | Better tax collection | +Rs 50 bn | None |
| | No new taxes | Rs 0 | None |
| What matters more when setting taxes | Revenue | +Rs 30 bn | Growth −0.3 pt |
| | Tax relief | −Rs 20 bn | Growth +0.3 pt |
| | Widening the tax base | +Rs 35 bn | Growth +0.1 pt |

### Calculation order

`computeFiscalSnapshot()` in `js/engine/fiscal-engine.js` recalculates in this order after every choice:

1. **Baseline.** Nominal GDP, baseline revenue (2026 revenue grown with nominal GDP) and baseline interest (6.0% of IMF 2027 GDP, Rs 2,333 bn).
2. **Before feedbacks.** Spending before interest = Bill total + sector changes + welfare indexation + reserve. Revenue = baseline revenue + tax effects. Primary balance = revenue − spending before interest. Deficit = spending before interest + interest − revenue.
3. **Market confidence.** Starts at 50; +8 per point of primary balance above 2.3% of GDP; −4 per point of deficit above 3.7% of GDP. Kept between 0 and 100.
4. **Inflation.** 5.3% + 0.25 pt per 1% of GDP of extra spending (excluding the reserve) + tax effect. Kept between 1% and 15%.
5. **Real growth.** 3.2% + 0.4 pt per 1% of GDP of extra spending (excluding the reserve) + 0.5 pt per 1% of GDP of extra capital spending + 0.3 pt per 1% of GDP of extra social spending + 0.01 pt per confidence point above 50 − 0.5 pt if the deficit is above 6% of GDP (crowding out) + tax effect. Kept between 0.5% and 7%.
6. **T-bill rate and rupee.** The shortfall of the primary balance against its baseline, inflation above 5.3%, and the deficit above 3.7% push the T-bill rate up by 0.6, 0.5 and 0.3 per point, and rupee depreciation by 1.0, 0.5 and 0.5 per point. A stronger primary balance has the opposite effect.
7. **Interest.** The domestic part (75%) reprices partly with the T-bill rate (30% of it moves in proportion to the rate change). The foreign part (25%) moves one-for-one with extra depreciation.
8. **Revenue feedbacks.** Revenue moves with faster or slower nominal growth than the baseline. A weaker rupee raises border taxes (30% of revenue, 50% pass-through).
9. **Final position and debt.** Debt = starting debt (100.1% of 2026 GDP) minus the overall balance, over 2027 nominal GDP after feedbacks. Ratios are measured against that GDP, except the 13% ceiling.
10. **Headroom.** 13% of the GDP projected when the Budget is set, minus spending before interest. This is the bar at the top of the game, and the 13% target uses the same basis, so the two always agree.

Steps 3 to 8 are simplified game assumptions, not estimates from Sri Lankan data.

### Five targets

These are the IMF's 2027 projections (Country Report 26/111), used until the Government publishes its own targets in the Budget Speech on 12 November 2026.

| Target | Level | How it is measured |
| --- | --- | --- |
| Revenue / GDP | at least 15.1% | Revenue after feedbacks / nominal GDP |
| Primary balance / GDP | at least 2.3% | (Revenue − spending before interest) / GDP |
| Public investment / GDP | at least 4.0% | Capital allocation in the Bill plus the player's capital changes / GDP |
| Deficit / GDP | no more than 3.7% | (Spending including interest − revenue) / GDP |
| Spending before interest / GDP | no more than 13% | Spending before interest / GDP projected when the Budget is set |

Public investment is scored on the allocation, not on delivery. The Bill's capital allocation is about 4.5% of GDP, while capital spending came to 3.0% of GDP in 2025. The results page shows what delivery would look like if only 80% of capital is spent, but this does not change the score. Meeting 4 or 5 targets gives the best headline, 3 a middle one, and fewer a weaker one.

### Results boxes

Each box compares the player's Budget with the Bill unchanged (inflation 5.3%, growth 3.2%, rupee depreciation 4%, confidence 50.6).

| Box | Numbers shown | Status rule |
| --- | --- | --- |
| Public Services | Change in social spending against the Bill | More room above +Rs 5 bn; pressure below −Rs 5 bn; limited room otherwise |
| Prices & Energy Costs | Inflation and rupee depreciation against the start | Easing if more than 0.1 pt below the start; rising if more than 0.5 pt above; under pressure in between |
| Growth & Investment | Real growth and public investment / GDP | Improving if more than 0.1 pt above the start; weakening if more than 0.1 pt below; steady otherwise |
| Markets & Confidence | Confidence, primary balance, deficit | Strengthening if more than 2 points above the start; weakening if more than 2 below; cautious otherwise |

The boxes show model results. They do not measure real service quality, household energy bills or investor sentiment.

### Worked example

Education +5%, Health +3%, Infrastructure −4%, welfare indexed to inflation, taxes on income and tax relief, with and without the smallest emergency reserve (Rs 250 bn):

| Result | Start (no choices) | Example, no reserve | Example, Rs 250 bn reserve |
| --- | --- | --- | --- |
| Revenue | Rs 5,920 bn | Rs 6,006 bn | Rs 6,009 bn |
| Interest | Rs 2,333 bn | Rs 2,332 bn | Rs 2,366 bn |
| Overall balance | −Rs 1,407 bn (−3.6% of GDP) | −Rs 1,332 bn (−3.4%) | −Rs 1,613 bn (−4.1%) |
| Debt / GDP | 95.7% | 95.1% | 95.9% |
| Real growth | 3.2% | 3.5% | 3.5% |
| Inflation | 5.3% | 5.4% | 5.4% |
| 1-year T-bill | 9.25% | 9.23% | 9.75% |
| Primary balance / GDP | 2.4% | 2.6% | 1.9% |
| Market confidence | 50.6 | 51.6 | 44.7 |
| Room under the 13% ceiling | Rs 70 bn | Rs 57 bn | −Rs 193 bn |
| Targets met | 5 of 5 | 5 of 5 | 2 of 5 |

The same example is the model regression check in `docs/beta-readiness-checklist.md`.

### Ten years of history

Central government finances, % of GDP (also in the game's FAQ). Definitions differ slightly between sources.

| Year | Revenue & grants | Expenditure | Interest | Primary balance | Overall balance | Source |
| --- | --- | --- | --- | --- | --- | --- |
| 2017 | 13.7 | 19.2 | 5.5 | 0.0 | −5.5 | CBSL Annual Report 2018 (preliminary) |
| 2018 | 13.4 | 18.6 | 5.9 | 0.6 | −5.3 | CBSL Annual Report 2018 (provisional) |
| 2019 | 11.9 | 21.0 | 5.7 | −3.3 | −9.0 | CBSL Socio-Economic Data 2025 (restated) |
| 2020 | 8.8 | 19.4 | 6.3 | −4.4 | −10.7 | CBSL Socio-Economic Data 2025 |
| 2021 | 8.3 | 20.0 | 6.0 | −5.7 | −11.7 | CBSL Socio-Economic Data 2025 |
| 2022 | 8.4 | 18.6 | 6.5 | −3.7 | −10.2 | CBSL Socio-Economic Data 2025 |
| 2023 | 11.2 | 19.5 | 9.0 | 0.7 | −8.3 | CBSL Socio-Economic Data 2025 |
| 2024 | 13.7 | 20.5 | 9.0 | 2.2 | −6.8 | CBSL Socio-Economic Data 2025 (provisional) |
| 2025 | 16.7 | 19.0 | 7.7 | 5.4 | −2.3 | CBSL Annual Economic Review 2025 (interest derived) |
| 2026 | 15.2 | 20.3 | 6.5 | 1.4 | −5.1 | IMF Country Report 26/111 (projection) |
| 2027 | 15.1 | 18.7 | 6.0 | 2.3 | −3.7 | IMF Country Report 26/111 (projection) |

### Sources and assumptions

**From published sources:** the Bill's allocations; the IMF's growth, inflation, revenue, interest, debt and target figures; the Treasury bill rate; the exchange rate; the 13% ceiling; and the ten-year history.

**Game assumptions:** the tax options and their effects; how growth, inflation, the T-bill rate and the rupee respond to the Budget; the foreign and repricing shares of interest and the border-tax shares; the 4% rupee depreciation; the Rs 0 to 750 bn reserve levels; the 80% capital delivery rate used in the explanation; and the status thresholds in the results boxes.

**Left out on purpose:** how the deficit is financed; whether capital projects are delivered; and the revaluation of foreign-currency debt when the rupee weakens (so debt is understated when depreciation exceeds the 4% baseline).

**To check as new data arrive:** the Government's 2027 targets (12 November 2026); whether Public Administration includes pensions; the 2026 comparators for Energy and Digital, which are unverified.

### Workbook sheets

| Sheet | What it holds |
| --- | --- |
| Overview | Order of calculation and notes |
| Inputs | Macro assumptions, Bill allocations, and the yellow cells for the player's choices |
| Engine | Every step above as a formula, plus the results-box statuses |
| History | The ten-year table |
| Sources | Where each figure comes from |

## Inspiration and attribution

This game is an original Sri Lanka-focused educational simulation by Sarika. It is inspired by several public-interest fiscal simulation projects.

Primary inspiration:

- https://ig.ft.com/chancellor-game

Secondary inspirations:

- https://fiscalship.org/
- https://fiscalgame.askperi.kr/?lang=en
- https://iwant2study.org/lookangejss/promptLibrary/ACPcookout2025/users/Budget%20Blueprint%20SG.html
- https://ifs.org.uk/be-chancellor

No endorsement or affiliation with these projects is implied.

## Acknowledgements

A huge thank you to Asel, who spent the last two weeks helping me bring this game to life. Thank you for sharing your knowledge so generously, for helping me get the game onto GitHub, and for transforming how it looks and feels.

A heartfelt thank you to Aneetha, Senith, Thaththi and Ammi for working through the script and questions with me. Your thoughts helped me make the game clearer and more engaging.

And thank you to everyone who has played the game, read through it, shared feedback, asked questions or offered suggestions. Every contribution has helped me see this project differently.

## Code structure

The game page holds only markup. Styles and scripts live in separate files, grouped by concern:

- `budget_game_fixed.html`: page markup for every screen, including all on-screen text and tooltips
- `css/01-base.css` to `css/10-modal-and-cards.css`: styles, loaded in numbered order (the order matters for the cascade)
- `js/data/sectors.js`: sector allocations from the 2027 Appropriation Bill (`SECTORS`)
- `js/data/modal-content.js`: About, FAQ (including the history table) and Sources pop-up text (`MODAL_CONTENT`)
- `js/engine/state.js`: player choices and spending changes against the Bill
- `js/engine/fiscal-engine.js`: macro assumptions (`macro`), fiscal targets (`targets`) and `computeFiscalSnapshot()`
- `js/engine/outcome-explanation.js`: the "why" explanation on the results page
- `js/ui/navigation.js`, `js/ui/modal.js`, `js/ui/stepper.js`: page navigation, pop-ups and step-by-step screens
- `js/ui/sectors.js`, `js/ui/taxes.js`: sector sliders and revenue choices
- `js/ui/dashboard.js`, `js/ui/results.js`: live fiscal dashboard and final results page
- `js/main.js`: start-up

Scripts are plain (non-module) scripts that share globals, so the `<script>` order at the end of `budget_game_fixed.html` must be kept. There is no build step, and the game runs directly from `file://`.

See `docs/segregation-of-duties.md` for who edits which files.

## Project files

- `budget_game_fixed.html`, `css/`, `js/`: the playable game (see Code structure)
- `docs/contribution-guide.md`: role-based guide for developers and policy/budget/econ contributors
- `docs/segregation-of-duties.md`: ownership and integration contract for policy vs engineering edits
- `docs/beta-readiness-checklist.md`: beta test gate and smoke-test protocol
- `docs/github-pages-deployment.md`: setup guide for zero-cost hosting on GitHub Pages
- `index.html`: root entry point for GitHub Pages
- `.nojekyll`: disables Jekyll processing for static asset fidelity
- `README.md`: project overview and contributor guidance
- `LICENSE`: licence information for the repository

## Getting started

1. Open `budget_game_fixed.html` in a modern web browser (directly from disk, or via a static server such as `python -m http.server 8080`).
2. Play through the scenarios and use the on-screen indicators to understand the trade-offs.

## Beta validation

See `docs/beta-readiness-checklist.md` for the beta test gate.

## GitHub Pages hosting

The repository includes a GitHub Actions workflow for zero-cost Pages hosting.

- Workflow file: `.github/workflows/deploy-pages.yml`
- Deploy trigger: push to `main`
- Target URL on Sarika account: `https://sarikawarusavitarana.github.io/sl-budget-game/`

This means updates go live after changes are merged from `dev` into `main`.

Note: GitHub Pages URLs always use the repository owner name. If this repository remains under `sarikawarusavitarana-hash`, the live URL will stay under that owner.

See `docs/github-pages-deployment.md` for account-specific setup and troubleshooting.

## Contributing

For a full contribution workflow, use `docs/contribution-guide.md`.

Quick path by contributor type:

- Developers: focus on `js/ui/`, `js/engine/` and `css/`.
- Policy, budget, and economics contributors: focus on on-screen text in `budget_game_fixed.html`, `js/data/` and the assumptions at the top of `js/engine/fiscal-engine.js`.

For all contributions:

- preserve the educational intent of the game
- keep policy language clear, neutral, and evidence-based
- complete at least one end-to-end browser playthrough with no console errors after your change

## Notes

- This repository uses a static HTML, CSS and JavaScript implementation with no build step.
- The game is a simulation, not a government forecast or policy announcement.
- Future improvements may include richer scenario balancing, accessibility refinements, and expanded policy coverage.

## Licence

See `LICENSE` for the licence terms.
