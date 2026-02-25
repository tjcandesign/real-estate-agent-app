# Agent Pro - Real Estate Assistant

A complete real estate agent management platform with client onboarding, preferences management, and smart checklists.

## Features

- **Agent Dashboard** - Manage all your clients and checklists in one place
- **Client Onboarding** - QR code-based intake forms for effortless client registration
- **Preferences Management** - Edit and track client property preferences
- **Smart Checklists** - Template-based checklists with tracking
- **Multi-tenant Architecture** - Built for teams with role-based access

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Auth**: Clerk (OAuth 2.0)
- **ORM**: Prisma

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account with PostgreSQL database
- Clerk account for authentication

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   DATABASE_URL="your_supabase_connection_string"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
   CLERK_SECRET_KEY="your_clerk_secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3003"
   ```

4. Set up the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3003`

## Project Structure

```
real-estate-agent-app/
├── app/
│   ├── agents/         # Agent dashboard routes
│   ├── clients/        # Client onboarding routes
│   ├── api/           # API endpoints
│   └── layout.tsx     # Root layout
├── components/
│   ├── agents/        # Agent-specific components
│   ├── clients/       # Client-specific components
│   ├── onboarding/    # Intake form components
│   └── checklists/    # Checklist components
├── lib/
│   └── db.ts          # Prisma client
├── prisma/
│   └── schema.prisma  # Database schema
└── public/            # Static assets
```

## Database Setup

The project uses Prisma ORM with PostgreSQL. Database schema includes:
- Agents
- Clients
- ClientPreferences
- ChecklistTemplate & ChecklistTemplateItem
- DocumentChecklist & ChecklistItem
- ClientOnboardingLink
- AuditLog

Run migrations:
```bash
npm run prisma:migrate
```

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Deployment

The app is designed for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on each push to main

## License

Proprietary - Real Estate Agent Tool
