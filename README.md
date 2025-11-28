# Agency Dashboard

A Next.js 16 application for managing agencies and contacts with role-based access control and usage limiting.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase Project
- Clerk Project

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

**Auth (Clerk)**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Database (Supabase)**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
```
### 5. Run Development Server
```bash
npm run dev
```

---

## 🔑 Key Features
- **Auth:** Clerk (Webhook-based user sync).  
- **Limits:** Standard users are limited to 50 contact views/day.  
- **Admin:** Admins have unlimited access.  
- **API:** Secure endpoints with Row Level Security (RLS).  

