# 🎓 Faculty Superlatives Poll

A lighthearted Civil Engineering faculty voting game. Vote for your favorite faculty members across 41 fun superlative categories!

Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **Recharts**.

## Features

- 🗳️ **One-question-at-a-time** voting flow with progress indicator
- 🔍 **Searchable faculty dropdown** with keyboard navigation
- 👥 **Duo selector** for "Best faculty duo" with duplicate prevention
- ✍️ **Write-in "Other" answers** for every question
- ⏭️ **Skip / No opinion** option for every question
- 🔒 **Access codes** for one-person-one-vote protection
- 🕵️ **Anonymous voting** — no link between codes and answers
- 📊 **Admin dashboard** with bar charts, vote counts, and percentages
- 🛡️ **Admin moderation** tool to map "Other" answers to faculty
- 🚪 **Poll control** — open/close voting at any time
- 📱 **Fully responsive** for phones and laptops

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend/DB | Supabase (PostgreSQL, Row-Level Security) |
| Charts | Recharts |
| Testing | Vitest |
| Deployment | Vercel + Supabase Cloud |

---

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### 1. Clone and install

```bash
cd faculty-superlatives
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon key** (from Settings → API)
3. Note your **service_role key** (from Settings → API → Service Role)

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-role-key
ADMIN_PASSWORD=choose-a-strong-password
```

### 4. Run the database migration

Option A: Via the Supabase Dashboard:
1. Go to your Supabase project → SQL Editor
2. Copy and paste the contents of `supabase/migrations/00001_create_tables.sql`
3. Run it
4. Then copy and paste `supabase/seed.sql` and run it

Option B: Via the Supabase CLI:
```bash
npx supabase init
npx supabase link --project-ref your-project-ref
npx supabase db push
npx supabase db seed
```

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Try it out

- Use one of the seeded access codes to vote (check `supabase/seed.sql` for codes)
- Visit [http://localhost:3000/admin](http://localhost:3000/admin) to see results

---

## Access Codes

The seed file generates 100 access codes. Each code can only be used once. Example codes from the seed:

```
ABCF-GHKM, NPQR-STVW, XYZB-CDFE, ...
```

To generate more codes, insert them into the `access_codes` table:

```sql
INSERT INTO access_codes (code) VALUES
('YOUR1-CODE'),
('YOUR2-CODE');
```

---

## Project Structure

```
faculty-superlatives/
├── supabase/
│   ├── migrations/           # Database schema and RLS policies
│   └── seed.sql              # Sample data and access codes
├── src/
│   ├── app/
│   │   ├── page.tsx          # Welcome / access code entry
│   │   ├── poll/page.tsx     # Voting flow
│   │   ├── done/page.tsx     # Thank you screen
│   │   ├── admin/            # Admin pages (login, results, moderation)
│   │   └── api/              # API routes
│   ├── components/           # Reusable React components
│   ├── lib/                  # Constants, types, utilities, Supabase clients
│   └── __tests__/            # Vitest tests
```

---

## Admin Features

### Results Dashboard (`/admin/results`)
- Bar charts for every question
- Vote counts and percentages
- Leading answer highlighted
- "Other" submissions shown separately

### Moderation (`/admin/moderate`)
- Review write-in "Other" answers
- Map them to existing faculty members
- Dismiss irrelevant entries

### Poll Control
- Open or close voting at any time
- Votes are rejected when poll is closed

---

## Testing

```bash
# Run all tests
npx vitest run

# Run tests in watch mode
npx vitest
```

Tests cover:
- Vote submission validation (23 tests)
- Duo question validation (9 tests)
- Percentage calculations (11 tests)

---

## Deployment

### Frontend (Vercel)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add your environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Deploy

### Database (Supabase Cloud)

Your Supabase project is already cloud-hosted. Make sure:
1. The migration has been applied
2. The seed data (access codes) has been inserted
3. RLS is enabled on all tables (the migration handles this)

---

## Security

- **Anonymous voting**: No foreign key between `votes` and `access_codes`
- **Row-Level Security**: Voters can only INSERT votes; never read them
- **Service role isolation**: Admin operations use the service_role key server-side
- **Rate limiting**: Code validation is rate-limited (5 attempts/minute/IP)
- **Input sanitization**: All inputs are trimmed, stripped of control characters, and length-limited
- **httpOnly cookies**: Session tokens are stored in httpOnly, SameSite cookies
- **Poll control**: Server-side enforcement — votes are rejected when poll is closed

---

## License

Private project. Not for public distribution.
# POLL
# Teachers-day
