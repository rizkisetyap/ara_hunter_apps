# ARA Hunter Apps

A modern, high-performance web application and data pipeline backend for the **ARA Hunter** stock analysis system, built using Next.js (App Router), Tailwind CSS, shadcn/ui, and Supabase.

---

## 🌟 Key Features

- **📊 Screening Batches Dashboard:** View daily screening calculations, stock ranks, positions, risk metrics, and time-target (TT) forecasts. Includes client-side filtering by stock Symbol and Screening Date.
- **📜 Journal Audits:** Track deterministic algorithm audit trails, feature snapshots, confidence breakdowns, veto triggers, and fingerprint hashing.
- **🏢 Emiten Management:** Full CRUD dashboard for stock symbols with active/inactive toggling.
- **🐍 Python Pipeline Endpoint:** Specialized lightweight JSON API (`/api/emitens/active`) designed for consumption by external Python pipelines (`ara_hunter.py`). Protected via `x-api-key`.
- **🔐 Session & API Authentication:** Cookie-based session authentication for UI dashboards and `x-api-key` header verification for backend ingestion endpoints.
- **🌓 Dark / Light Theme:** Native theme switcher supporting dark and light modes across all pages.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui & Lucide Icons
- **Database & Auth:** Supabase (`@supabase/ssr`)
- **Data Validation:** Zod
- **Language:** TypeScript

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rizkisetyap/ara_hunter_apps.git
   cd ara_hunter_apps
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and populate it:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ARA_HUNTER_API_KEY=your_secret_pipeline_api_key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_admin_password
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints Summary

| Endpoint | Method | Description | Protection |
| :--- | :--- | :--- | :--- |
| `/api/screening/batch` | `POST` | Ingest daily screening batch data | `x-api-key` |
| `/api/screening/journal` | `POST` | Ingest journal audit log data | `x-api-key` |
| `/api/screening/query` | `GET` | Query screening batch with filters | Session |
| `/api/emitens` | `GET`, `POST` | Fetch or create emiten records | Session |
| `/api/emitens/[id]` | `PATCH`, `DELETE` | Update or remove an emiten | Session |
| `/api/emitens/active` | `GET` | Return list of active emiten symbols for Python | `x-api-key` |
| `/api/auth/login` | `POST`, `DELETE` | Admin login and session logout | Public |

---

## 📄 License

This project is proprietary and built for internal use with the ARA Hunter pipeline system.
