# SORA Prime · Singapore SORA Calculator & MAS Serverless Integration
## Conversation & Development Log

---

### Turn 1: Project Initialization & Initial Brief

**User Request:**
> Build me a simple Singapore based SORA calculator that reads MAS backed overnight rates for calculating interest payments accurately and efficiently. Just the frontend for now, I will include the backend integration later.

**Actions Taken:**
- Reviewed guidelines, domain reference (`references/3_saas_dashboard.md`), and financial invariants.
- Updated `metadata.json` with title `"Singapore SORA Loan & Interest Calculator"`.
- Synchronized `index.html` with matching titles, metadata, and typography (`Plus Jakarta Sans`, `JetBrains Mono`).
- Built the SORA Domain Models & Types (`src/types/sora.ts`):
  - Benchmarks: Spot Overnight SORA, 1-Month Compounded SORA, 3-Month Compounded SORA, 6-Month Compounded SORA, Custom Benchmark.
  - Property types: HDB, Private Residential / Condo, Commercial.
  - Full amortization schedule row interfaces.
- Built the Monetary Authority of Singapore (MAS) Data Service (`src/services/masSoraService.ts`):
  - High-fidelity daily business day overnight rate sequence (180+ business days).
  - Business day day-weighting ($n_i = 3$ for Friday fixings, $n_i = 1$ for Monday–Thursday).
  - Official MAS Compounded SORA equation implementation:
    $$\text{Compounded SORA} = \left[ \prod_{i=1}^{d_b} \left( 1 + \frac{r_i \times n_i}{36500} \right) - 1 \right] \times \frac{365}{d} \times 100$$
  - SORA Index compounding verification.
- Built the Financial & Regulatory Calculation Engine (`src/utils/loanCalculations.ts`):
  - Monthly payment amortization formula: $M = P \frac{r(1+r)^N}{(1+r)^N - 1}$.
  - Interest decomposition: SORA Base Interest component vs. Bank Spread Margin.
  - MAS regulatory Total Debt Servicing Ratio (TDSR) with 4.00% p.a. stress test floor and 55% threshold.
  - HDB Mortgage Servicing Ratio (MSR) with 30% ceiling.
  - CSV export utility for amortization schedules.
- Built Singapore Bank Packages Presets (`src/data/bankPackages.ts`):
  - DBS/POSB 3M SORA Home Package, OCBC 1M SORA Agile Mortgage, UOB 3M SORA Value Loan, HSBC Green Mortgage, Standard Chartered MortgageOne, and 2-Year Fixed Rate sanctuary.
- Built Interactive UI Suite:
  - `TopHeader.tsx`: 3-Zone contract, quick action triggers.
  - `RateTickerBar.tsx`: High-density live MAS rate metric ticker with day-on-day deltas.
  - `MortgageCalculatorView.tsx`: Two-column layout with instant calculations, visual progress bars, interactive SVG amortization curve, and paginated schedules.
  - `MasCompoundingEngineView.tsx`: Step-by-step audit table of MAS daily fixings and compounding factors.
  - `HistoricalRatesView.tsx`: Multi-series SVG historical rate chart, volatility stats ($\sigma$), and searchable table.
  - `BankPackagesView.tsx`: Side-by-side bank package comparison with 1-click apply action.
  - `MasApiSpecView.tsx`: Technical API specifications and backend proxy contract.

---

### Turn 2: GitHub Repository Setup & Initial Push

**User Request:**
> git push PAT is [REDACTED_GH_PAT] and git repo is https://github.com/weekee76-cpu/Interest-Rates-SMU.git

**Actions Taken:**
- Verified Git installation (`git version 2.34.1`).
- Initialized local repository at `/app/applet`.
- Configured user credentials:
  - `user.name`: `"weekee76-cpu"`
  - `user.email`: `"weekee76@gmail.com"`
- Staged all 22 codebase files and created initial commit:
  - Commit `93643c9`: `"feat: Singapore SORA Loan and Interest Calculator with MAS rates"`
- Authenticated and pushed to `main` branch:
  `git push -u origin main`
- Sanitized local remote URL immediately to ensure no Personal Access Token remained in `.git/config`.

---

### Turn 3: MAS Serverless Endpoints Implementation

**User Request:**
> Add a serverless connection that pulls MAS data using the following end points:
> - Store this in /api folder (at project root level) NOT src file
> - Include /health.ts and /sora.ts with the same subfolder
> - Do not hardcode any api keys, I will include them manually
> 
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
> 
> # All requests need the header: KeyId: <MAS_KEY_ID>

**Actions Taken:**
- Created `/api/health.ts` at project root level:
  - Verifies serverless health status and checks if `MAS_KEY_ID` or `MAS_API_KEY` is present in environment variables.
  - Supports CORS and preflight `OPTIONS` requests.
- Created `/api/sora.ts` at project root level:
  - Calls official MAS Gateway endpoint:
    `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
  - Attaches header `KeyId: <MAS_KEY_ID>`.
  - Reads dynamically from `process.env.MAS_KEY_ID` (or `process.env.MAS_API_KEY` or request header). No hardcoded keys.
  - Implements 15-minute in-memory caching to avoid MAS rate limiting.
  - Normalizes daily rates, 1M, 3M, 6M compounded rates, and SORA index.
  - Universal runtime compatibility helper (`sendResponse`) supporting Vite Connect dev middleware, raw Node `http.ServerResponse`, Express, and Web Standard `Response` (Vercel/Netlify/Edge).
- Configured `.env.example`:
  - Documented `MAS_KEY_ID="YOUR_MAS_KEY_ID"`.
- Configured `vite.config.ts`:
  - Added dev server middleware so calls to `/api/health` and `/api/sora` route directly to the serverless files in local development.
- Updated `src/services/masSoraService.ts`:
  - Prioritizes `/api/sora` serverless endpoint with automatic fallback.
- Updated `src/components/MasApiSpecView.tsx`:
  - Added live interactive testers for both `/api/health` and `/api/sora` with formatted JSON inspection.
- Tested endpoints via curl:
  - Verified `GET /api/health` returns HTTP 200 with service health info.
  - Verified `GET /api/sora` returns structured rate data with diagnostic messages if key is missing or invalid.
- Committed and pushed to GitHub:
  - Commit `eb45c39`: `"feat: add serverless /api/health and /api/sora endpoints for MAS data"`
  - Commit `2b1db87`: `"fix: universal response handling for connect, node and web serverless runtimes"`
  - Sanitized remote credentials in local git configuration.

---

### Turn 4: Auto-Commit & Push Workflow Directive

**User Request:**
> git push and commit. Do it everytime I make changes.

**Actions Taken:**
- Verified git status (working tree clean on `main`).
- Confirmed protocol to automatically stage, commit, and push changes to `https://github.com/weekee76-cpu/Interest-Rates-SMU.git` upon each modification.

---

### Turn 5: Chat History Export

**User Request:**
> export this entire chat to an .md file

**Actions Taken:**
- Exported the complete conversation history, architecture documentation, formulas, and serverless specs to `CHAT_HISTORY.md`.
- Staged, committed, and pushed `CHAT_HISTORY.md` to GitHub.
