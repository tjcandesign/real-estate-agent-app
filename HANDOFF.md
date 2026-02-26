# Agent Pro — OpenClaw Handoff Document
## Real Estate Agent Transaction Management Platform

**Date:** February 26, 2026
**Prepared by:** Claude (AI) + TJ Cichecki
**For:** OpenClaw overnight team + agent advisors
**Goal:** Transform Agent Pro from a basic CRM into a transaction-focused platform that agents will pay $29-79/mo for

---

## TABLE OF CONTENTS
1. [Current State](#current-state)
2. [Vision & Value Proposition](#vision)
3. [Core Feature: Transaction Management](#transactions)
4. [Core Feature: Commission Tracker](#commissions)
5. [Core Feature: Key Dates & Deadlines](#deadlines)
6. [Core Feature: Client-Facing Portal](#client-portal)
7. [Core Feature: Document Tracking](#documents)
8. [Core Feature: Follow-up & Nurture System](#followups)
9. [Dashboard Redesign](#dashboard)
10. [Database Schema Changes](#schema)
11. [API Routes Needed](#api-routes)
12. [UI/UX Design Specifications](#ui-specs)
13. [Investor Demo Data Requirements](#demo-data)
14. [Technical Stack & Architecture](#tech-stack)
15. [Priority Order](#priorities)

---

## 1. CURRENT STATE <a name="current-state"></a>

### What exists today:
- **Auth:** Clerk OAuth (Google, LinkedIn, email) — WORKING
- **Database:** Supabase PostgreSQL via Prisma ORM — WORKING
- **Deployment:** Vercel (real-estate-agent-app-ashen.vercel.app) — LIVE
- **Client Management:** Basic CRUD for clients with status tracking
- **Onboarding:** QR code generation for client intake forms
- **Checklists:** Template-based checklists (generic, not transaction-specific)
- **Dashboard:** Basic stats (client count, active, onboarding)
- **Settings:** Workspace name, MLS integration toggle

### What's wrong with current state:
- It's a **generic CRM** — agents wouldn't pay for this over a spreadsheet
- Checklists are disconnected from actual transactions
- No transaction lifecycle management
- No financial tracking (commissions, deal values)
- No deadline/date management (the #1 thing that kills deals)
- No client-facing view (agents waste hours on "what's next?" calls)
- No differentiation from Zillow, Follow Up Boss, or kvCORE

---

## 2. VISION & VALUE PROPOSITION <a name="vision"></a>

### The Problem:
Real estate agents juggle 5-15 active transactions simultaneously. Each transaction has:
- 30-50 individual tasks and milestones
- Critical deadlines that, if missed, kill the deal or create legal liability
- Multiple parties (buyer, seller, lender, inspector, appraiser, title company, attorney)
- Dozens of documents that need to be tracked
- A client who constantly asks "what's next?"

**Agents lose deals, miss deadlines, and burn out because they're managing all of this in spreadsheets, email, and their heads.**

### The Solution:
Agent Pro is a **transaction command center** that:
1. Tracks every active deal through its lifecycle stages
2. Surfaces critical deadlines before they're missed
3. Shows projected commission income across all deals
4. Gives clients their own portal so they stop calling
5. Tracks every document per transaction
6. Automates follow-ups with past clients for referral business

### Pricing Model (target):
- **Starter:** $29/mo — Up to 10 active transactions, basic features
- **Pro:** $49/mo — Unlimited transactions, client portal, commission tracking
- **Team:** $79/mo/seat — Multi-agent brokerage features, shared templates

### Target Customer:
- Independent residential real estate agents
- Small teams (2-5 agents)
- Both buyer's agents and listing agents
- Agents doing 12-50+ transactions/year

---

## 3. CORE FEATURE: TRANSACTION MANAGEMENT <a name="transactions"></a>

### What it does:
Every client engagement becomes a **Transaction** — the central object that tracks a real estate deal from first contact to closing and beyond.

### Transaction Stages (in order):

#### For BUYER transactions:
```
LEAD → CONSULTATION → SEARCHING → OFFER_SUBMITTED → UNDER_CONTRACT →
DUE_DILIGENCE → INSPECTION → APPRAISAL → CLEAR_TO_CLOSE → CLOSING → CLOSED → POST_CLOSING
```

#### For SELLER/LISTING transactions:
```
LEAD → LISTING_CONSULTATION → PRE_LISTING_PREP → ACTIVE_LISTING →
SHOWING_FEEDBACK → OFFER_RECEIVED → UNDER_CONTRACT → INSPECTION_RESPONSE →
APPRAISAL → CLEAR_TO_CLOSE → CLOSING → CLOSED → POST_CLOSING
```

### Transaction Data Model:
```
Transaction {
  id: string
  agentId: string (FK → Agent)
  clientId: string (FK → Client)

  // Transaction type
  type: BUYER | SELLER | DUAL (representing both sides)

  // Current stage in the pipeline
  stage: enum (see stages above)
  stageUpdatedAt: DateTime

  // Property info
  propertyAddress: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  propertyType: SINGLE_FAMILY | CONDO | TOWNHOUSE | MULTI_FAMILY | LAND | COMMERCIAL

  // Financial
  listPrice: float
  offerPrice: float (nullable — filled when offer made)
  contractPrice: float (nullable — filled when under contract)
  finalPrice: float (nullable — filled at closing)

  // Commission
  commissionType: PERCENTAGE | FLAT_FEE
  commissionRate: float (e.g., 2.5 for 2.5%, or flat dollar amount)
  estimatedCommission: float (calculated)
  actualCommission: float (nullable — filled at closing)

  // Key Dates (all nullable, filled as deal progresses)
  leadDate: DateTime
  consultationDate: DateTime
  offerDate: DateTime
  contractDate: DateTime (aka "under contract" date)
  dueDiligenceDeadline: DateTime *** CRITICAL ***
  inspectionDeadline: DateTime *** CRITICAL ***
  appraisalDeadline: DateTime
  financingContingencyDeadline: DateTime *** CRITICAL ***
  clearToCloseDate: DateTime
  closingDate: DateTime *** CRITICAL ***
  actualClosingDate: DateTime

  // Parties involved
  opposingAgentName: string
  opposingAgentPhone: string
  opposingAgentEmail: string
  lenderName: string
  lenderContact: string
  titleCompanyName: string
  titleCompanyContact: string
  inspectorName: string
  inspectorContact: string
  attorneyName: string
  attorneyContact: string

  // Status
  status: ACTIVE | ON_HOLD | FELL_THROUGH | CLOSED | CANCELLED
  fallThroughReason: string (nullable)

  // Notes
  notes: text

  // Timestamps
  createdAt: DateTime
  updatedAt: DateTime
}
```

### UI: Transaction Pipeline View

```
┌─────────────────────────────────────────────────────────────────────┐
│  Active Transactions (8)                              [+ New Deal]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─ UNDER CONTRACT ─────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  🏠 123 Oak Street, Raleigh          BUYER                  │  │
│  │  James Henderson · $485,000                                   │  │
│  │  ⚠️ Due diligence expires in 3 days                          │  │
│  │  Commission: $12,125 (2.5%)                                   │  │
│  │  ████████████░░░░░░░░ 65%                                    │  │
│  │                                                               │  │
│  │  🏠 456 Pine Ave, Cary              SELLER                  │  │
│  │  Maria Santos · $650,000                                      │  │
│  │  ✅ Inspection complete · Appraisal pending                  │  │
│  │  Commission: $19,500 (3%)                                     │  │
│  │  ██████████████░░░░░░ 75%                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ SEARCHING ──────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  🔍 Emily Rodriguez · Budget: $380K-$520K                   │  │
│  │  Holly Springs, Fuquay-Varina · Single Family                │  │
│  │  Last showing: 2 days ago · 7 homes viewed                   │  │
│  │  ████░░░░░░░░░░░░░░░░ 25%                                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ OFFER SUBMITTED ────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  📋 789 Elm Dr, Apex                BUYER                   │  │
│  │  Kevin Brown · Offered $525,000 (listed at $549K)            │  │
│  │  Submitted yesterday · Waiting for response                   │  │
│  │  Commission: $13,125 (2.5%)                                   │  │
│  │  ██████░░░░░░░░░░░░░░ 35%                                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### UI: Single Transaction Detail View

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back to Transactions                                             │
│                                                                     │
│  🏠 123 Oak Street, Raleigh NC 27601                               │
│  BUYER Transaction · James Henderson                                │
│                                                                     │
│  ┌─────────┬─────────┬──────────┬──────────┬────────────┐          │
│  │  Under  │  Due    │ Inspect- │ Apprais- │  Closing   │          │
│  │Contract │Diligence│   ion    │    al    │            │          │
│  │   ✅    │  ⚠️ 3d │   📅     │   ○      │  ○ Mar 28  │          │
│  └─────────┴─────────┴──────────┴──────────┴────────────┘          │
│                                                                     │
│  ┌─ Deal Overview ──────────────────────────────────────────────┐  │
│  │  Contract Price    $485,000                                   │  │
│  │  Commission        $12,125 (2.5%)                             │  │
│  │  Closing Date      March 28, 2026                             │  │
│  │  Days in Contract  12 of 45                                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ Key Dates ──────────────────────────────────────────────────┐  │
│  │  ✅ Contract signed         Feb 14                            │  │
│  │  ⚠️ Due diligence ends     Feb 28 (3 DAYS LEFT)              │  │
│  │  📅 Inspection scheduled    Mar 2                             │  │
│  │  ○  Appraisal deadline      Mar 10                            │  │
│  │  ○  Financing contingency   Mar 15                            │  │
│  │  ○  Clear to close          Mar 21                            │  │
│  │  ○  Closing day             Mar 28                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ Parties ────────────────────────────────────────────────────┐  │
│  │  Listing Agent    Mike Rivera    (555) 234-5678               │  │
│  │  Lender           Wells Fargo    Sarah Kim (555) 345-6789    │  │
│  │  Title Company    First American  (555) 456-7890             │  │
│  │  Inspector        ABC Inspect     Mar 2 @ 10am              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ Documents ──────────────────────────────────────────────────┐  │
│  │  ✅ Purchase Agreement          Uploaded Feb 14               │  │
│  │  ✅ Pre-Approval Letter         Uploaded Feb 10               │  │
│  │  ⚠️ Inspection Report           Due Mar 4                    │  │
│  │  ○  Appraisal Report            Pending                      │  │
│  │  ○  Title Search                Pending                      │  │
│  │  ○  Closing Disclosure          Due 3 days before closing    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ Notes ──────────────────────────────────────────────────────┐  │
│  │  Feb 25: Buyer wants to negotiate repairs after inspection    │  │
│  │  Feb 20: Seller countered at $485K, buyer accepted            │  │
│  │  Feb 18: Initial offer at $475K submitted                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### API Routes for Transactions:

```
GET    /api/agents/transactions              — List all transactions (filterable by status, stage, type)
POST   /api/agents/transactions              — Create new transaction
GET    /api/agents/transactions/[id]         — Get single transaction detail
PUT    /api/agents/transactions/[id]         — Update transaction
DELETE /api/agents/transactions/[id]         — Delete/archive transaction
PUT    /api/agents/transactions/[id]/stage   — Advance transaction to next stage
GET    /api/agents/transactions/pipeline     — Get pipeline summary (count per stage)
```

### What each API returns:

**GET /api/agents/transactions**
```json
{
  "transactions": [
    {
      "id": "...",
      "type": "BUYER",
      "stage": "UNDER_CONTRACT",
      "status": "ACTIVE",
      "client": { "id": "...", "firstName": "James", "lastName": "Henderson" },
      "propertyAddress": "123 Oak Street",
      "propertyCity": "Raleigh",
      "contractPrice": 485000,
      "estimatedCommission": 12125,
      "closingDate": "2026-03-28",
      "nextDeadline": { "name": "Due Diligence", "date": "2026-02-28", "daysLeft": 3 },
      "progressPercent": 65,
      "updatedAt": "..."
    }
  ],
  "summary": {
    "totalActive": 8,
    "totalPendingCommission": 87500,
    "urgentDeadlines": 2
  }
}
```

**PUT /api/agents/transactions/[id]/stage**
```json
// Request:
{ "stage": "INSPECTION", "notes": "Inspection scheduled for March 2" }

// Response:
{ "success": true, "transaction": { ... }, "nextStage": "APPRAISAL" }
```

---

## 4. CORE FEATURE: COMMISSION TRACKER <a name="commissions"></a>

### What it does:
Shows agents their projected income across all active and closed deals. This is the #1 thing agents care about — money.

### UI: Commission Dashboard Widget

```
┌─────────────────────────────────────────────────────────────────────┐
│  💰 Commission Overview                                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   $24,750    │  │   $87,500    │  │   $142,250   │             │
│  │  Closed MTD  │  │   Pending    │  │  YTD Earned  │             │
│  │  ↑ 18% vs   │  │  6 deals in  │  │  On track    │             │
│  │  last month  │  │  pipeline    │  │  for $285K   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│  Projected Income by Month:                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Mar ████████████████████ $37,500 (3 closings)                 │ │
│  │ Apr ████████████ $25,000 (2 closings)                         │ │
│  │ May ████████ $15,000 (1 closing)                              │ │
│  │ Jun ████ $10,000 (projected from pipeline)                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Recent Closings:                                                   │
│  ✅ 123 Oak St — James Henderson — $12,125 — Closed Feb 22        │
│  ✅ 789 Maple — Maria Santos — $12,625 — Closed Feb 15            │
└─────────────────────────────────────────────────────────────────────┘
```

### API Route:

**GET /api/agents/commissions**
```json
{
  "closedMTD": 24750,
  "closedMTDChange": 18,
  "pendingTotal": 87500,
  "pendingDeals": 6,
  "ytdEarned": 142250,
  "projectedAnnual": 285000,
  "monthlyProjections": [
    { "month": "Mar", "amount": 37500, "deals": 3 },
    { "month": "Apr", "amount": 25000, "deals": 2 },
    { "month": "May", "amount": 15000, "deals": 1 }
  ],
  "recentClosings": [
    { "property": "123 Oak St", "client": "James Henderson", "commission": 12125, "closedDate": "2026-02-22" }
  ]
}
```

---

## 5. CORE FEATURE: KEY DATES & DEADLINES <a name="deadlines"></a>

### What it does:
Surfaces the most critical deadlines across ALL active transactions. This is where agents lose deals — a missed due diligence deadline means the buyer loses their earnest money deposit.

### UI: Deadline Alert System

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚡ Upcoming Deadlines                                    View All  │
│                                                                     │
│  🔴 TODAY                                                           │
│  ├─ Due Diligence — 789 Elm Dr (Kevin Brown)                       │
│  │  Expires at 5:00 PM today. Must decide: proceed or terminate.   │
│  │  [Extend] [Mark Complete]                                        │
│  │                                                                   │
│  🟡 THIS WEEK                                                       │
│  ├─ Inspection Deadline — 123 Oak St (James Henderson) — Feb 28    │
│  │  Inspector: ABC Inspections, 10:00 AM                            │
│  │  [Mark Complete] [Reschedule]                                    │
│  │                                                                   │
│  ├─ Financing Contingency — 456 Pine Ave (Maria Santos) — Mar 1    │
│  │  Lender: Wells Fargo, Contact: Sarah Kim                        │
│  │  [Mark Complete]                                                  │
│  │                                                                   │
│  🟢 NEXT 2 WEEKS                                                    │
│  ├─ Appraisal Deadline — 123 Oak St — Mar 10                       │
│  ├─ Closing Day — 789 Maple Dr — Mar 12                            │
│  └─ Clear to Close — 456 Pine Ave — Mar 15                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Deadline Priority Logic:
- **RED (Critical):** Deadline is TODAY or OVERDUE
- **YELLOW (Warning):** Deadline within 3 days
- **GREEN (Upcoming):** Deadline within 14 days
- **Gray:** Deadline > 14 days out

### API Route:

**GET /api/agents/deadlines**
```json
{
  "critical": [
    {
      "transactionId": "...",
      "type": "DUE_DILIGENCE",
      "label": "Due Diligence Deadline",
      "date": "2026-02-26",
      "daysLeft": 0,
      "property": "789 Elm Dr, Apex",
      "client": "Kevin Brown",
      "notes": "Must decide today"
    }
  ],
  "warning": [ ... ],
  "upcoming": [ ... ],
  "totalUrgent": 3
}
```

---

## 6. CORE FEATURE: CLIENT-FACING PORTAL <a name="client-portal"></a>

### What it does:
Gives each client a unique URL (no login required) where they can see:
- Where their transaction is in the process
- What's been completed vs what's next
- Key upcoming dates
- What documents they need to provide
- Their agent's contact info

### Why this matters:
Agents report spending 2-5 hours/week answering "what's happening with my house?" calls. This portal eliminates those calls.

### UI: Client Portal View (what the CLIENT sees)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏠 Your Home Purchase — 123 Oak Street, Raleigh                   │
│  Agent: Sarah Mitchell · (555) 234-5678                            │
│                                                                     │
│  ┌─ PROGRESS ───────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  ✅ ────── ✅ ────── ✅ ────── 🔵 ────── ○ ────── ○        │  │
│  │  Offer    Contract   Due      Inspect   Apprais  Closing    │  │
│  │  Made     Signed     Dilig.   -ion      -al      Day       │  │
│  │                                                               │  │
│  │  You are currently in: INSPECTION PHASE                      │  │
│  │  Estimated closing: March 28, 2026                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ WHAT'S HAPPENING NOW ───────────────────────────────────────┐  │
│  │                                                               │  │
│  │  Your home inspection is scheduled for March 2 at 10:00 AM.  │  │
│  │  The inspector (ABC Inspections) will evaluate the property   │  │
│  │  for structural, electrical, plumbing, and other issues.     │  │
│  │                                                               │  │
│  │  After the inspection, Sarah will review the report with     │  │
│  │  you and discuss any items to negotiate with the seller.     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ YOUR TO-DO LIST ────────────────────────────────────────────┐  │
│  │  ✅ Submit pre-approval letter                                │  │
│  │  ✅ Sign purchase agreement                                   │  │
│  │  ✅ Submit earnest money deposit                              │  │
│  │  📋 Schedule homeowner's insurance quote                     │  │
│  │  📋 Provide updated bank statements to lender                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ KEY DATES ──────────────────────────────────────────────────┐  │
│  │  Mar 2    Home Inspection (10:00 AM)                          │  │
│  │  Mar 10   Appraisal                                           │  │
│  │  Mar 15   Financing must be approved                          │  │
│  │  Mar 25   Final walkthrough                                   │  │
│  │  Mar 28   🎉 CLOSING DAY                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Questions? Contact Sarah: (555) 234-5678 · sarah@realty.com       │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation:
- Reuse existing `ClientOnboardingLink` pattern with unique tokens
- New route: `/clients/portal/[token]` — no auth required
- Portal is read-only for clients
- Agent can toggle portal visibility per transaction
- Optional: Email/SMS notifications when stage changes

### API Route:

**GET /api/clients/portal/[token]**
```json
{
  "client": { "firstName": "James", "lastName": "Henderson" },
  "agent": { "firstName": "Sarah", "lastName": "Mitchell", "phone": "(555) 234-5678", "email": "sarah@realty.com" },
  "transaction": {
    "type": "BUYER",
    "stage": "INSPECTION",
    "propertyAddress": "123 Oak Street, Raleigh NC 27601",
    "contractPrice": 485000,
    "estimatedClosing": "2026-03-28",
    "progressPercent": 55,
    "stages": [
      { "name": "Offer Made", "status": "complete", "date": "2026-02-16" },
      { "name": "Under Contract", "status": "complete", "date": "2026-02-18" },
      { "name": "Due Diligence", "status": "complete", "date": "2026-02-25" },
      { "name": "Inspection", "status": "current", "date": "2026-03-02" },
      { "name": "Appraisal", "status": "pending", "date": "2026-03-10" },
      { "name": "Closing", "status": "pending", "date": "2026-03-28" }
    ],
    "currentStageDescription": "Your home inspection is scheduled...",
    "clientTasks": [
      { "task": "Submit pre-approval letter", "complete": true },
      { "task": "Sign purchase agreement", "complete": true },
      { "task": "Schedule homeowner's insurance quote", "complete": false }
    ],
    "keyDates": [
      { "date": "2026-03-02", "label": "Home Inspection" },
      { "date": "2026-03-10", "label": "Appraisal" },
      { "date": "2026-03-28", "label": "Closing Day" }
    ]
  }
}
```

---

## 7. CORE FEATURE: DOCUMENT TRACKING <a name="documents"></a>

### What it does:
Per-transaction document tracking. Not file storage (that's a liability), but **status tracking** of required documents.

### Document Data Model:
```
TransactionDocument {
  id: string
  transactionId: string (FK → Transaction)
  name: string (e.g., "Purchase Agreement", "Inspection Report")
  category: PRE_CONTRACT | UNDER_CONTRACT | INSPECTION | FINANCING | CLOSING
  status: NOT_STARTED | REQUESTED | RECEIVED | REVIEWED | APPROVED
  dueDate: DateTime (nullable)
  receivedDate: DateTime (nullable)
  notes: string
  isRequired: boolean
  order: int
}
```

### Default Document Templates per Transaction Type:

**BUYER documents:**
1. Pre-Approval Letter (PRE_CONTRACT, required)
2. Proof of Funds / Earnest Money (PRE_CONTRACT, required)
3. Buyer Agency Agreement (PRE_CONTRACT, required)
4. Purchase Agreement (UNDER_CONTRACT, required)
5. Property Disclosure (UNDER_CONTRACT, required)
6. Inspection Report (INSPECTION, required)
7. Repair Request/Addendum (INSPECTION, optional)
8. Appraisal Report (FINANCING, required)
9. Loan Commitment Letter (FINANCING, required)
10. Homeowner's Insurance Binder (FINANCING, required)
11. Title Search / Title Insurance (CLOSING, required)
12. Closing Disclosure (CLOSING, required)
13. Final Walkthrough Confirmation (CLOSING, required)
14. Settlement Statement (CLOSING, required)

**SELLER documents:**
1. Listing Agreement (PRE_CONTRACT, required)
2. Property Disclosure Statement (PRE_CONTRACT, required)
3. Lead Paint Disclosure (PRE_CONTRACT, required if pre-1978)
4. HOA Documents (PRE_CONTRACT, if applicable)
5. Purchase Agreement (UNDER_CONTRACT, required)
6. Inspection Response (INSPECTION, required)
7. Repair Completion Receipts (INSPECTION, optional)
8. Appraisal (FINANCING, required)
9. Title / Deed (CLOSING, required)
10. Closing Disclosure (CLOSING, required)
11. Settlement Statement (CLOSING, required)

### API Routes:

```
GET    /api/agents/transactions/[id]/documents     — List all docs for a transaction
PUT    /api/agents/transactions/[id]/documents/[docId]  — Update document status
POST   /api/agents/transactions/[id]/documents     — Add custom document
```

---

## 8. CORE FEATURE: FOLLOW-UP & NURTURE SYSTEM <a name="followups"></a>

### What it does:
Helps agents stay in touch with past clients (the #1 source of referral business) and nurture prospects.

### Types of follow-ups:
1. **Post-closing check-in** — 7 days, 30 days, 90 days, 1 year after closing
2. **Home anniversary** — Annual "happy home anniversary" reminder
3. **Prospect nurture** — Follow up with prospects who haven't converted
4. **Market update** — Reminder to send market updates to past clients
5. **Custom reminder** — Agent-defined follow-up tasks

### Follow-Up Data Model:
```
FollowUp {
  id: string
  agentId: string
  clientId: string (nullable — can be for non-client contacts)
  transactionId: string (nullable)
  type: POST_CLOSING | ANNIVERSARY | PROSPECT_NURTURE | MARKET_UPDATE | CUSTOM
  title: string
  description: string
  dueDate: DateTime
  status: PENDING | COMPLETED | SNOOZED | CANCELLED
  completedAt: DateTime (nullable)
  snoozeUntil: DateTime (nullable)
}
```

### Auto-generated Follow-ups:
When a transaction moves to CLOSED:
- Create "7-day check-in" follow-up (7 days later)
- Create "30-day check-in" follow-up (30 days later)
- Create "Home Anniversary" follow-up (1 year later)
- Create "Ask for referral/review" follow-up (14 days later)

### UI (Future): Follow-Up Queue
```
┌─────────────────────────────────────────────────────────────────────┐
│  📬 Follow-Up Queue (12 pending)                       [+ New]     │
│                                                                     │
│  TODAY (3)                                                          │
│  ├─ ☎️ Call James Henderson — 7-day post-closing check-in          │
│  │     Closed on 123 Oak St on Feb 22                              │
│  │     [Complete] [Snooze 3 days]                                  │
│  ├─ 📧 Email market update to past clients (quarterly)             │
│  │     12 past clients due for update                              │
│  │     [Complete] [Snooze 1 week]                                  │
│  ├─ 💬 Text Jennifer Taylor — prospect follow-up                   │
│  │     Showed interest 5 days ago, no response                     │
│  │     [Complete] [Snooze 3 days] [Remove]                         │
│                                                                     │
│  THIS WEEK (4)                                                      │
│  ├─ 🎉 Happy Home Anniversary — Lisa Patel (Feb 28)               │
│  ├─ ⭐ Ask for Google review — Robert Chen                         │
│  ├─ ☎️ Call Maria Santos — 30-day check-in                        │
│  └─ 📧 Follow up with Daniel Anderson (prospect)                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. DASHBOARD REDESIGN <a name="dashboard"></a>

### The new dashboard should show (in priority order):

```
┌─────────────────────────────────────────────────────────────────────┐
│  Agent Pro                Dashboard  Transactions  Clients  Settings│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Good morning, Sarah.                              [+ New Deal]     │
│                                                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────────┐  │
│  │   8    │ │   3    │ │ $87.5K │ │ $24.7K │ │  2 URGENT      │  │
│  │ Active │ │ Closed │ │Pending │ │  MTD   │ │  DEADLINES     │  │
│  │ Deals  │ │  MTD   │ │Commiss.│ │ Earned │ │  ⚠️ Action     │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────────────┘  │
│                                                                     │
│  ┌─ Urgent Deadlines ────────────────────────────────────────────┐ │
│  │  🔴 Due Diligence — 789 Elm Dr — TODAY 5PM — Kevin Brown     │ │
│  │  🟡 Inspection — 123 Oak St — In 3 days — James Henderson    │ │
│  │  🟡 Financing — 456 Pine Ave — In 5 days — Maria Santos      │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Deal Pipeline ──────────────────┐ ┌─ Commission Forecast ───┐ │
│  │  Searching      ███ 3            │ │  Mar  ████████ $37.5K   │ │
│  │  Offer Out      █ 1              │ │  Apr  █████ $25K        │ │
│  │  Under Contract ████ 4           │ │  May  ███ $15K          │ │
│  │  Clear to Close                  │ │                          │ │
│  │  Closing        █ 1              │ │  YTD: $142K             │ │
│  └──────────────────────────────────┘ │  Proj: $285K            │ │
│                                        └─────────────────────────┘ │
│                                                                     │
│  ┌─ Follow-Ups Due ─────────────────┐ ┌─ Recent Activity ───────┐ │
│  │  3 due today                      │ │ Emily made an offer     │ │
│  │  7 due this week                  │ │ James inspection done   │ │
│  │  [View Queue]                     │ │ New lead: Nicole Garcia │ │
│  └──────────────────────────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. DATABASE SCHEMA CHANGES <a name="schema"></a>

### New Models to add to `prisma/schema.prisma`:

```prisma
// ============ TRANSACTIONS (THE CORE) ============

enum TransactionType {
  BUYER
  SELLER
  DUAL
}

enum TransactionStage {
  // Buyer stages
  LEAD
  CONSULTATION
  SEARCHING
  OFFER_SUBMITTED
  UNDER_CONTRACT
  DUE_DILIGENCE
  INSPECTION
  APPRAISAL
  CLEAR_TO_CLOSE
  CLOSING
  CLOSED
  POST_CLOSING
  // Seller-specific stages
  LISTING_CONSULTATION
  PRE_LISTING_PREP
  ACTIVE_LISTING
  SHOWING_FEEDBACK
  OFFER_RECEIVED
  INSPECTION_RESPONSE
}

enum TransactionStatus {
  ACTIVE
  ON_HOLD
  FELL_THROUGH
  CLOSED
  CANCELLED
}

enum DocumentStatus {
  NOT_STARTED
  REQUESTED
  RECEIVED
  REVIEWED
  APPROVED
}

enum DocumentCategory {
  PRE_CONTRACT
  UNDER_CONTRACT
  INSPECTION
  FINANCING
  CLOSING
}

enum FollowUpType {
  POST_CLOSING
  ANNIVERSARY
  PROSPECT_NURTURE
  MARKET_UPDATE
  CUSTOM
}

enum FollowUpStatus {
  PENDING
  COMPLETED
  SNOOZED
  CANCELLED
}

model Transaction {
  id                    String   @id @default(cuid())
  agentId               String
  agent                 Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  clientId              String
  client                Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)

  type                  TransactionType
  stage                 TransactionStage @default(LEAD)
  stageUpdatedAt        DateTime @default(now())
  status                TransactionStatus @default(ACTIVE)
  fallThroughReason     String?

  // Property
  propertyAddress       String
  propertyCity          String
  propertyState         String   @default("NC")
  propertyZip           String?
  propertyType          String?

  // Financial
  listPrice             Float?
  offerPrice            Float?
  contractPrice         Float?
  finalPrice            Float?
  commissionType        String   @default("PERCENTAGE")
  commissionRate        Float    @default(2.5)
  estimatedCommission   Float?
  actualCommission      Float?

  // Key Dates
  leadDate              DateTime?
  consultationDate      DateTime?
  offerDate             DateTime?
  contractDate          DateTime?
  dueDiligenceDeadline  DateTime?
  inspectionDeadline    DateTime?
  appraisalDeadline     DateTime?
  financingDeadline     DateTime?
  clearToCloseDate      DateTime?
  closingDate           DateTime?
  actualClosingDate     DateTime?

  // Parties
  opposingAgentName     String?
  opposingAgentPhone    String?
  opposingAgentEmail    String?
  lenderName            String?
  lenderContact         String?
  titleCompanyName      String?
  titleCompanyContact   String?
  inspectorName         String?
  inspectorContact      String?
  attorneyName          String?
  attorneyContact       String?

  notes                 String?

  // Relations
  documents             TransactionDocument[]
  followUps             FollowUp[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([agentId, status])
  @@index([agentId, stage])
}

model TransactionDocument {
  id                    String   @id @default(cuid())
  transactionId         String
  transaction           Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  name                  String
  category              DocumentCategory
  status                DocumentStatus @default(NOT_STARTED)
  dueDate               DateTime?
  receivedDate          DateTime?
  notes                 String?
  isRequired            Boolean  @default(true)
  order                 Int      @default(0)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([transactionId])
}

model FollowUp {
  id                    String   @id @default(cuid())
  agentId               String
  agent                 Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  clientId              String?
  client                Client?  @relation(fields: [clientId], references: [id], onDelete: SetNull)
  transactionId         String?
  transaction           Transaction? @relation(fields: [transactionId], references: [id], onDelete: SetNull)

  type                  FollowUpType
  title                 String
  description           String?
  dueDate               DateTime
  status                FollowUpStatus @default(PENDING)
  completedAt           DateTime?
  snoozeUntil           DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([agentId, status])
  @@index([agentId, dueDate])
}
```

### Updates to existing models:

Add to **Agent** model:
```prisma
  transactions          Transaction[]
  followUps             FollowUp[]
```

Add to **Client** model:
```prisma
  transactions          Transaction[]
  followUps             FollowUp[]
```

---

## 11. API ROUTES NEEDED <a name="api-routes"></a>

### Transaction APIs:
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/agents/transactions` | List all (filter: status, stage, type) |
| POST | `/api/agents/transactions` | Create new transaction |
| GET | `/api/agents/transactions/[id]` | Get transaction detail with docs, parties |
| PUT | `/api/agents/transactions/[id]` | Update transaction fields |
| PUT | `/api/agents/transactions/[id]/stage` | Advance to next stage |
| DELETE | `/api/agents/transactions/[id]` | Archive transaction |
| GET | `/api/agents/transactions/pipeline` | Pipeline summary counts |

### Commission APIs:
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/agents/commissions` | Commission overview + projections |

### Deadline APIs:
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/agents/deadlines` | All upcoming deadlines, sorted by urgency |

### Document APIs:
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/agents/transactions/[id]/documents` | List docs for transaction |
| PUT | `/api/agents/transactions/[id]/documents/[docId]` | Update doc status |
| POST | `/api/agents/transactions/[id]/documents` | Add custom doc |

### Follow-Up APIs:
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/agents/followups` | List follow-ups (filter: status, due date) |
| POST | `/api/agents/followups` | Create follow-up |
| PUT | `/api/agents/followups/[id]` | Update (complete, snooze, etc.) |
| DELETE | `/api/agents/followups/[id]` | Delete follow-up |

### Client Portal API:
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/clients/portal/[token]` | Get client-facing transaction view |

---

## 12. UI/UX DESIGN SPECIFICATIONS <a name="ui-specs"></a>

### Design System:
- **Primary:** Blue-600 (#2563eb) to Indigo-600 (#4f46e5) gradient
- **Success/Closed:** Green-600 (#16a34a)
- **Warning/Deadline:** Amber-500 (#f59e0b)
- **Critical/Overdue:** Red-600 (#dc2626)
- **Cards:** White with border-slate-100, rounded-xl, shadow-sm
- **Typography:** Inter font, bold headings, slate-900 body
- **Spacing:** Compact cards (p-4), generous section spacing (gap-6)
- **Header:** Sticky with glassmorphism (backdrop-blur-xl) on scroll

### Navigation:
Change nav from: Dashboard | Clients | Checklists | Settings
To: **Dashboard | Transactions | Clients | Follow-ups | Settings**

### Key Pages to Build:
1. `/agents/transactions` — Pipeline view (kanban or list)
2. `/agents/transactions/new` — New transaction form
3. `/agents/transactions/[id]` — Transaction detail with timeline, docs, parties
4. `/agents/commissions` — Commission overview (could be dashboard widget)
5. `/agents/followups` — Follow-up queue
6. `/clients/portal/[token]` — Client-facing portal (public, no auth)

---

## 13. INVESTOR DEMO DATA REQUIREMENTS <a name="demo-data"></a>

### The demo account should have:

**8 Active Transactions:**
1. UNDER_CONTRACT (Buyer) — 123 Oak St, Raleigh — $485K — Due diligence expiring soon
2. UNDER_CONTRACT (Seller) — 456 Pine Ave, Cary — $650K — Inspection complete
3. SEARCHING (Buyer) — Emily Rodriguez — Budget $380-520K
4. OFFER_SUBMITTED (Buyer) — 789 Elm Dr, Apex — $525K offered
5. ACTIVE_LISTING (Seller) — 321 Birch Ln, Durham — $399K — 5 showings, 2 offers
6. INSPECTION (Buyer) — 555 Maple Ct, Morrisville — $720K
7. CLEAR_TO_CLOSE (Buyer) — 888 Cedar Way, Holly Springs — $460K — Closing next week
8. CLOSING (Seller) — 222 Spruce Dr, Fuquay — $340K — Closing tomorrow

**5 Recently Closed:**
- Demonstrate commission history and post-closing follow-ups

**5 Prospects:**
- Show lead pipeline and nurture flow

**Commission Data:**
- $24,750 closed this month
- $87,500 pending across active deals
- $142,250 YTD
- Show monthly projections

**Deadlines:**
- At least 2 CRITICAL (today/tomorrow)
- 3-4 WARNING (this week)
- 5+ upcoming

**Follow-ups:**
- 3 due today
- 7 due this week
- Mix of post-closing check-ins, prospect follow-ups, anniversary reminders

**Documents per transaction:**
- Show various completion states (50% docs received on one, 90% on another)

---

## 14. TECHNICAL STACK & ARCHITECTURE <a name="tech-stack"></a>

### Current Stack:
- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Auth:** Clerk (@clerk/nextjs v6.38.2)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma 5.22.0
- **Styling:** Tailwind CSS v4 with @tailwindcss/postcss
- **Deployment:** Vercel
- **Repo:** github.com/tjcandesign/real-estate-agent-app

### File Structure:
```
app/
├── api/
│   ├── agents/
│   │   ├── transactions/          ← NEW
│   │   │   ├── route.ts           (GET list, POST create)
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts       (GET, PUT, DELETE)
│   │   │   │   ├── stage/route.ts (PUT advance stage)
│   │   │   │   └── documents/
│   │   │   │       ├── route.ts   (GET, POST)
│   │   │   │       └── [docId]/route.ts (PUT)
│   │   │   └── pipeline/route.ts  (GET summary)
│   │   ├── commissions/route.ts   ← NEW
│   │   ├── deadlines/route.ts     ← NEW
│   │   ├── followups/
│   │   │   ├── route.ts           ← NEW
│   │   │   └── [id]/route.ts      ← NEW
│   │   ├── dashboard-data/route.ts (UPDATE to include new data)
│   │   ├── clients/               (existing)
│   │   ├── checklists/            (existing — keep for now)
│   │   └── settings/route.ts      (existing)
│   └── clients/
│       ├── portal/[token]/route.ts ← NEW
│       └── ...existing
├── agents/
│   ├── dashboard/page.tsx          (REDESIGN)
│   ├── transactions/               ← NEW
│   │   ├── page.tsx               (pipeline view)
│   │   ├── new/page.tsx           (new transaction form)
│   │   └── [id]/page.tsx          (transaction detail)
│   ├── commissions/page.tsx        ← NEW (or dashboard widget)
│   ├── followups/page.tsx          ← NEW
│   ├── clients/                    (existing)
│   ├── checklists/                 (existing — keep)
│   └── settings/page.tsx           (existing)
├── clients/
│   ├── portal/[token]/page.tsx     ← NEW
│   └── ...existing
├── layout.tsx
└── page.tsx
```

### Important Notes for Developers:
1. All API routes use `auth()` from `@clerk/nextjs/server` — middleware MUST be present
2. Prisma client is imported from `@/lib/db` (singleton pattern)
3. Dynamic routes in Next.js 16 require `params` to be typed as `Promise` and await'd
4. The build command runs `prisma generate && next build`
5. DATABASE_URL uses Supabase connection pooler (IPv4 compatible)
6. After schema changes, run `npx prisma migrate dev --name <name>` locally, then `npx prisma db push` for production

---

## 15. PRIORITY ORDER <a name="priorities"></a>

### For the investor demo (do these first):

1. **Schema changes** — Add Transaction, TransactionDocument, FollowUp models
2. **Transaction CRUD** — API routes + pipeline view page
3. **Transaction Detail** — Single transaction view with timeline, dates, parties, docs
4. **Dashboard Redesign** — Wire up to show real transaction data, deadlines, commissions
5. **Seed Script** — Comprehensive demo data with realistic transactions
6. **Commission Widget** — Dashboard or dedicated page showing projected income
7. **Deadline Alerts** — Surface critical dates prominently

### Phase 2 (after funding):
8. Client-facing portal
9. Follow-up queue system
10. Automated follow-up generation
11. Email/SMS notifications
12. MLS integration (property search)
13. Multi-agent team features
14. Mobile responsive optimization
15. Analytics & reporting

---

## QUICK REFERENCE: What to Build Tonight

### Step 1: Schema (30 min)
Update `prisma/schema.prisma` with Transaction, TransactionDocument, FollowUp models. Run migration.

### Step 2: Transaction APIs (2 hrs)
Build all CRUD routes for transactions. Focus on list, create, detail, stage advancement.

### Step 3: Transaction UI (3 hrs)
Build pipeline view (list grouped by stage), new transaction form, transaction detail page with timeline.

### Step 4: Dashboard (1 hr)
Wire dashboard to pull from transactions instead of just clients. Show deadlines, commission, pipeline.

### Step 5: Seed Data (1 hr)
Create realistic seed script with 8 active transactions, 5 closed, 5 prospects, documents, deadlines.

### Step 6: Deploy & Test (30 min)
Run migration on Supabase, seed data, push to Vercel, verify everything works.

---

**End of handoff document. Let's build something agents will actually pay for.** 🏠
