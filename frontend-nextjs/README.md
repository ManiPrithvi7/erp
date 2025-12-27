# IDURAR ERP CRM - Next.js 15 Migration

This is the Next.js 15 migration of IDURAR ERP CRM, built with:
- **Next.js 15** (App Router)
- **React Server Components** (RSC)
- **Server Actions** for mutations
- **shadcn/ui** for UI components
- **TypeScript** for type safety
- **Zustand** for client state
- **Zod** for validation

## 🚀 Getting Started

### Prerequisites
- Node.js 20.9.0 or higher
- npm 10.2.4 or higher
- MongoDB database
- Backend API running on port 8888

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8888
BACKEND_URL=http://localhost:8888
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend-nextjs/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   └── login/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── invoice/
│   │   └── layout.tsx
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard components
│   ├── invoice/            # Invoice components
│   ├── layout/             # Layout components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities and helpers
│   ├── actions/            # Server Actions
│   ├── auth.ts             # Authentication utilities
│   ├── store/              # Client state (Zustand)
│   ├── utils/              # Utility functions
│   └── validations.ts      # Zod schemas
└── middleware.ts           # Route protection middleware
```

## 🎯 Key Features

### ✅ Implemented
- [x] Next.js 15 with App Router
- [x] Server-Side Rendering (SSR)
- [x] Server Actions for mutations
- [x] HTTP-only cookie authentication
- [x] Route protection middleware
- [x] Dashboard with data fetching
- [x] Invoice list page
- [x] shadcn/ui components
- [x] Responsive design

### 🚧 In Progress
- [ ] Invoice create/edit pages
- [ ] Quote pages
- [ ] Payment pages
- [ ] Customer pages
- [ ] Company pages
- [ ] Settings pages

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Server Actions Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## 🔐 Authentication

Authentication uses HTTP-only cookies for security. The JWT token is stored server-side and automatically included in requests.

### Login Flow
1. User submits login form
2. Server Action validates credentials
3. Backend API returns user data
4. Server creates JWT and sets HTTP-only cookie
5. User is redirected to dashboard

## 🎨 UI Components

All UI components use shadcn/ui, which provides:
- Accessible components
- Customizable styling
- TypeScript support
- Dark mode ready

## 📝 Notes

- This is a migration from React + Vite to Next.js 15
- Backend API remains unchanged (Express.js)
- All API calls use Server Actions or Server Components
- Client components are marked with `'use client'`
- Server components are the default

## 🤝 Contributing

This is an active migration project. See `IMPLEMENTATION_PROGRESS.md` for current status.
