# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 application called "AI 痛风饮食助手" (AI Gout Health Assistant) - a Chinese health app that helps users with gout/high uric acid conditions by identifying food purine levels through image recognition and providing dietary guidance.

## Development Commands

```bash
# Development
npm run dev          # Start development server on port 13000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Development server runs on: http://localhost:13000
```

## Architecture

### Next.js App Router Structure
- Uses Next.js 14 with App Router (`app/` directory)
- TypeScript enabled with strict mode
- Edge Runtime for API routes when needed

### Core Directories

**`app/`** - Next.js App Router pages and API routes
- `page.tsx` - Main homepage
- `records/` - Uric acid tracking page
- `future/` - Future features page
- `api/` - API endpoints using App Router
  - `identify/` - Food image identification using Ali VL service
  - `foods/` - Food database operations
  - `purine/` - Purine level analysis
  - `uric-acid/` - Uric acid record management
  - `auth/` - User authentication (login/register)

**`components/`** - React components
- `HomePageClient.tsx` - Main client component with state management
- `ImageUploadButton.tsx`, `upload-button.tsx` - File upload functionality
- `ResultCard.tsx` - Food analysis results display
- `AuthForm.tsx`, `LoginModal.tsx` - User authentication
- `UricAcidManager.tsx` - Uric acid tracking
- `TrendAnalysis.tsx` - Data visualization with Recharts
- `FoodSearch.tsx` - Food database search
- `UserProfile.tsx` - User profile management

**`lib/`** - Utility libraries and business logic
- `supabase.ts` - Database operations and data models
- `ali-vl.ts` - Ali Vision API integration for food identification
- `purine.ts` - Purine level calculations and guidance
- `synonyms.ts` - Food name normalization and keyword expansion

### Key Technologies

**Database**: Supabase (PostgreSQL) with tables:
- `food_library` - Food items with purine data
- `users` - User authentication and profiles
- `uric_acid_records` - User uric acid tracking

**External APIs**:
- Ali Vision (阿里云视觉智能) - Food image recognition
- Uses Edge Runtime for API compatibility

**Frontend**:
- React 18 with TypeScript
- Tailwind CSS with custom gradient design
- Recharts for data visualization
- No component library (custom components)

### Authentication & State
- Custom authentication using bcryptjs for password hashing
- JWT-free session management (simpler approach)
- React state management (no Redux/Zustand)
- Context API for user state (`UserContext`)

### Environment Variables Required
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Ali Vision API key (if needed for image identification)
```

### Food Identification Flow
1. User uploads food photo via `ImageUploadButton`
2. `app/api/identify/route.ts` processes image using Edge Runtime
3. Calls Ali VL API in `lib/ali-vl.ts`
4. Returns food name which is used to query Supabase
5. `lib/supabase.ts` searches food library with fuzzy matching
6. Results displayed in `ResultCard` with dietary guidance

### Key Features
- **Image Recognition**: Upload food photos for instant purine analysis
- **Food Database**: Search 1000+ foods with purine levels and dietary advice
- **Uric Acid Tracking**: Monitor levels and view trends over time
- **User Authentication**: Simple email/password system
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Chinese Language**: All UI text and content in Chinese

### Development Notes
- Uses port 13000 to avoid conflicts
- Edge Runtime configured for API routes that need it
- Image processing limited to 5MB uploads
- Supports both exact and fuzzy food name matching
- All user-facing text is in Chinese
- Custom gradient color scheme (`from-[#f0fff4] to-[#e6f7ff]`)