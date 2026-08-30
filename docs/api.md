# ARA Hunter Pipeline API Documentation

## Overview
REST endpoints receiving daily screening calculation results and deterministic journal audit trails from the ARA Hunter system.

## Authentication
All requests to ARA Hunter endpoints MUST include:
- `Content-Type: application/json`
- `x-api-key: <YOUR_SECRET_KEY>`

Requests missing or sending invalid `x-api-key` receive `401 Unauthorized`.

---

## Endpoints

### POST /api/screening/batch

Receives daily screening calculation results.

**Request Body**
Array of objects:

| Field          | Type            | Description                  |
|----------------|-----------------|------------------------------|
| `Rank`         | number          | Screening rank               |
| `Symbol`       | string          | Ticker symbol                |
| `Date`         | string/date     | Screening date               |
| `Close`        | number/float    | Closing price                |
| `Low_3M`       | number/float    | 3-month low                  |
| `Position`     | string          | Position string              |
| `PricePosition`| number/float    | Price position score         |
| `Forecast`     | string          | Forecast value               |
| `Confidence`   | number          | Confidence score (0-100)     |
| `Risk`         | string          | Risk level                   |
| `LiquidityScore`| number/float   | Liquidity score              |
| `TT1`          | string/date     | Target time 1                |
| `TT2`          | string/date     | Target time 2                |
| `TT3`          | string/date/nullable | Target time 3 (nullable)  |

**Example**
```json
[
  {
    "Rank": 1,
    "Symbol": "AAPL",
    "Date": "2024-01-15",
    "Close": 187.23,
    "Low_3M": 162.50,
    "Position": "Above 3M Low",
    "PricePosition": 0.85,
    "Forecast": "Bullish",
    "Confidence": 82,
    "Risk": "Medium",
    "LiquidityScore": 9.2,
    "TT1": "2024-02-01",
    "TT2": "2024-03-01",
    "TT3": null
  }
]
```

**Validation**
Zod schema (`screeningBatchPayloadSchema`) validates all required fields and types. Invalid payloads return `400 Bad Request` with error details.

**Database**
Validated data is bulk-inserted into `screening_batches` via Supabase admin client. Maps to columns:
`rank`, `symbol`, `screening_date`, `close`, `low_3m`, `position`, `price_position`, `forecast`, `confidence`, `risk`, `liquidity_score`, `tt1`, `tt2`, `tt3`.

**Responses**
| Status | Description                                  |
|--------|----------------------------------------------|
| 401    | Unauthorized — missing/invalid `x-api-key`   |
| 400    | Invalid payload — schema validation failed   |
| 200    | Success `{ success: true, inserted: <n> }`   |

---

### POST /api/screening/journal

Receives deterministic audit trails for algorithm validation.

**Request Body**
Array of objects:

| Field                    | Type      | Description                               |
|--------------------------|-----------|-------------------------------------------|
| `symbol`                 | string    | Ticker symbol                             |
| `analysis_date`          | string    | Analysis date                             |
| `tt_id`                  | string    | Target time ID (e.g. "TT-1")              |
| `anchor_date`            | string    | Anchor reference date                     |
| `projected_date`         | string    | Projected target date                     |
| `forecast`               | string    | Forecast direction                        |
| `action`                 | string    | Trading action                            |
| `confidence`             | number    | Confidence score                          |
| `confidence_breakdown`   | object    | See breakdown fields below                |
| `hard_vetoes`            | string[]  | Hard veto reasons (empty if none)         |
| `feature_snapshot`       | object    | See snapshot fields below                 |
| `parameter_version`      | string    | Parameter version identifier              |
| `event_fingerprint`      | string    | SHA-256 event hash                        |
| `decision_fingerprint`   | string    | SHA-256 decision hash                     |

#### confidence_breakdown fields (all floats)
`time`, `price`, `momentum`, `trend`, `compression`, `volume`, `penalty`

#### feature_snapshot fields (all floats)
`close`, `low_3m`, `high_3m`, `position`, `volume_ratio`, `upper_wick_ratio`

**Example**
```json
[
  {
    "symbol": "AAPL",
    "analysis_date": "2024-01-15",
    "tt_id": "TT-1",
    "anchor_date": "2024-01-15",
    "projected_date": "2024-02-01",
    "forecast": "Bullish",
    "action": "Hold",
    "confidence": 82.5,
    "confidence_breakdown": {
      "time": 0.9,
      "price": 0.85,
      "momentum": 0.92,
      "trend": 0.88,
      "compression": 0.7,
      "volume": 0.95,
      "penalty": 0.1
    },
    "hard_vetoes": [],
    "feature_snapshot": {
      "close": 187.23,
      "low_3m": 162.50,
      "high_3m": 195.40,
      "position": 0.85,
      "volume_ratio": 1.2,
      "upper_wick_ratio": 0.3
    },
    "parameter_version": "v2.1.0",
    "event_fingerprint": "a1b2c3d4e5f6...",
    "decision_fingerprint": "f9e8d7c6b5a4..."
  }
]
```

**Validation**
Zod schemas (`confidenceBreakdownSchema`, `featureSnapshotSchema`, `journalAuditItemSchema`, `journalAuditPayloadSchema`) enforce strict types and structure including nested objects and arrays. Invalid payloads return `400 Bad Request` with error details.

**Database**
Validated data is bulk-inserted into `journal_audits` via Supabase admin client, storing nested JSON objects directly in Supabase `jsonb` columns.

**Responses**
| Status | Description                                  |
|--------|----------------------------------------------|
| 401    | Unauthorized — missing/invalid `x-api-key`   |
| 400    | Invalid payload — schema validation failed   |
| 200    | Success `{ success: true, inserted: <n> }`   |

---

## Environment Variables

| Variable                          | Required | Scope   | Description                          |
|-----------------------------------|----------|---------|--------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | yes      | public  | Supabase project URL                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes   | public  | Supabase anon key                    |
| `SUPABASE_SERVICE_ROLE_KEY`       | yes      | server  | Admin key for batch inserts (secure) |
| `ARA_HUNTER_API_KEY`              | yes      | server  | Primary API authentication key       |

Store these in `.env.local`.

## Validation Layer
All payloads validated against Zod schemas in `src/lib/schemas/ara-hunter.ts` before reaching Supabase. This ensures type safety at the network boundary — malformed data is rejected before database interaction.
