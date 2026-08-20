# Government Authentication & Tourism Administration Flow

## Overview
Jharkhand Diaries features a dedicated **Government Login** portal designed exclusively for authorized personnel from the **Department of Tourism, Arts, Culture, Sports & Youth Affairs, Government of Jharkhand**.

Government administrators possess the `admin` authorization role, which unlocks complete platform oversight:
- Official destination catalogue management (CMS, drafts, publications)
- Verification and KYC review for local homestays, tour guides, and artisans
- District-level tourism statistics, footfall, and engagement analytics
- Emergency alerts, monsoon/forest safety advisories, and tourist feedback triage

---

## 1. Authentication & Security Architecture

### Flow Diagram
```
                          [ Public / Footer / Direct URL ]
                                         │
                                         ▼
                            /auth/government
                         (Government Login UI)
                                         │
                       Submits Official Email & Password
                                         │
                                         ▼
                          Supabase / Clerk Authentication
                                         │
                                         ▼
                          Verify Account & Profile Role
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
          role === "admin"                               role !== "admin"
                 │                                               │
                 ▼                                               ▼
       Grant Portal Access                                Deny Access
       Navigate to /admin/dashboard                       Immediate Sign Out
                                                          Display Access Denied Error
```

### Key Security Principles
1. **No Public Admin Self-Registration**:
   - The public registration page (`/register`) strictly permits only `tourist` or `provider` roles.
   - Normal users cannot assign or elevate themselves to `admin` through the UI or API payloads.
2. **Strict Route Protection**:
   - All `/admin/*` routes are encapsulated within `ProtectedRoute` and `RoleRoute` (`allowedRoles={['admin']}`).
   - Unauthenticated attempts to access `/admin/*` are automatically redirected to `/auth/government`.
   - Authenticated non-admin accounts attempting to access `/admin/*` are bounced to `/access-denied`.
3. **Database-Level Role Integrity**:
   - The `public.profiles` table enforces `check (role in ('tourist', 'provider', 'admin'))`.
   - Update RLS policies forbid standard users from mutating their own `role` column.

---

## 2. Setting Up a Development Admin Account

To test and access the Government Portal in local development:

### Step 1: Create an Account
Register a user account through the standard registration interface at `http://localhost:5173/register` (or create a user directly in the Supabase Auth Dashboard) using your designated development email (e.g., `admin@jharkhandtourism.gov.in`).

### Step 2: Elevate to Admin Role via SQL
Open your **Supabase Dashboard → SQL Editor** (or run against your local database instance) and execute:

```sql
-- See supabase/seed/create_admin.sql
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = now()
WHERE 
  email = 'admin@jharkhandtourism.gov.in';
```

### Step 3: Verify Role Update
```sql
SELECT id, full_name, email, role FROM public.profiles WHERE role = 'admin';
```

---

## 3. Accessing the Government Dashboard

1. Navigate to:
   ```
   http://localhost:5173/auth/government
   ```
   *(or click **Government Login** in the top navigation or footer)*
2. Sign in with the promoted admin account credentials.
3. Upon successful role verification, you will be redirected to:
   ```
   http://localhost:5173/admin/dashboard
   ```

---

## 4. Security Constraints & Frontend Hygiene

> [!CAUTION]
> - **Never include Supabase `service_role` keys in frontend code or environment files (`.env`).**
> - **Never add a public "admin" selection option to public sign-up forms.**
> - **All administrative mutations must rely on Supabase Row-Level Security (RLS) policies checking the authenticated user's profile role.**
