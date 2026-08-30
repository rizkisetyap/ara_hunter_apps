**Role & Objective**
You are an Expert Full-Stack Developer strictly adhering to the `AGENTS.md` guidelines. 
Your task is to build a full CRUD management interface and API endpoints for the `emitens` table using Next.js (App Router), Tailwind CSS, shadcn/ui, and Supabase.

**Database Schema: `emitens`**
- `id` (UUID, Primary Key)
- `symbol` (String, max 10, uppercase, UNIQUE)
- `name` (String)
- `is_active` (Boolean, default true)
- `created_at` (Timestamp)

**Task 1: Build the API Route Handlers**
Create robust API endpoints in `app/api/emitens/route.ts` and `app/api/emitens/[id]/route.ts`:
1. **GET `/api/emitens`**: Fetch all emitens (for the UI dashboard).
2. **POST `/api/emitens`**: Create a new emiten. Must convert the `symbol` to uppercase before inserting.
3. **PATCH `/api/emitens/[id]`**: Update existing emiten (name or toggle `is_active`).
4. **DELETE `/api/emitens/[id]`**: Delete an emiten.
*Strict Requirement:* All POST, PATCH, and DELETE operations must use Zod schemas to validate the payload before interacting with Supabase. Use the `SUPABASE_SERVICE_ROLE_KEY` (via your admin client) for these write operations to bypass RLS.

**Task 2: Build the Special Consumption Endpoint for Python**
Create a new endpoint at `app/api/emitens/active/route.ts` specifically designed to be consumed by an external Python pipeline (`ara_hunter.py`).
- **Method:** GET
- **Logic:** Return a lightweight JSON array of strings containing ONLY the `symbol` of emitens where `is_active` is true (e.g., `["BBCA", "BREN", "AMMN"]`).
- **Security:** This endpoint MUST be protected. It must check for the `x-api-key` header and match it against the `ARA_HUNTER_API_KEY` environment variable. If missing or mismatched, return a 401 Unauthorized response.

**Task 3: Build the UI (CRUD Dashboard)**
Create a responsive management page at `app/dashboard/emitens/page.tsx`:
- **Table:** Display all emitens using a shadcn/ui Data Table. Show columns for Symbol, Name, Status (Active/Inactive badge), and Actions.
- **Forms:** Create a form inside a shadcn/ui Dialog/Modal for adding and editing emitens. Use `react-hook-form` integrated with the Zod schema.
- **UX:** Provide toast notifications for success and error states (e.g., handling unique constraint errors if a user tries to add a duplicate symbol).