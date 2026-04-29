# 🎒 Activity Bag

A lightweight, engaging web app that helps children get activity ideas and earn rewards!

Parents set up personalized activity bags with customized suggestions, and children can browse, complete, and celebrate their activities.

## Features

### For Parents
- 👨‍👩‍👧‍👦 Multi-family support with secure data isolation
- 🎨 Customize activities for each child
- 🎁 Configure reward animals
- 📊 Track activity completion (optional parent approval)
- 💰 Optional monetary allowance system

### For Children  
- 🎲 Browse and complete activities
- 🎉 Celebrate with cute animal rewards
- 📝 Self-report completions
- 📱 Mobile-friendly swipe navigation

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel
- **Auth**: Supabase Email/Password

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works great!)
- GitHub account (for Vercel deployment)

### Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/activity-bag.git
   cd activity-bag
   npm install
   ```

2. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy your credentials

3. **Set Environment Variables**
   ```bash
   cp .env.local.example .env.local
   # Add your Supabase URL and Anon Key
   ```

4. **Setup Database**
   - Follow the SQL setup in `SETUP_GUIDE.md`

5. **Run Dev Server**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

6. **Deploy**
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy!

## Project Structure

```
├── app/
│   ├── (auth)/           # Login/Signup
│   ├── setup/            # Parent onboarding
│   ├── activity-bag/     # Main app
│   ├── dashboard/        # Child management
│   └── api/              # Backend routes
├── components/           # React components
├── hooks/                # Custom hooks
├── lib/                  # Utilities & types
└── SETUP_GUIDE.md        # Detailed setup instructions
```

## Development Roadmap

### v1 (MVP)
- ✅ Parent signup & setup flow
- ✅ Activity customization
- ✅ Basic activity bag UI
- ⏳ Activity completion tracking
- ⏳ Digital rewards
- ⏳ Dashboard

### v2+
- [ ] Multiple children per family
- [ ] Parent approval workflow
- [ ] Monetary rewards & allowance tracking
- [ ] Activity streaks & weekly summaries
- [ ] Custom reward animals (photo upload)
- [ ] Activity templates (share with other families)
- [ ] Mobile app

## Contributing

This is a personal/family project. Feel free to fork and customize for your needs!

## License

MIT

---

**Get started:** See `SETUP_GUIDE.md` for detailed setup instructions!
