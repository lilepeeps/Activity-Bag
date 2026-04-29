# Activity Bag - Setup Guide

## Project Status

### ✅ Completed
- **Next.js Project Setup** with TypeScript, Tailwind CSS, App Router
- **Authentication System**
  - Login page (`/app/(auth)/login/page.tsx`)
  - Signup page (`/app/(auth)/signup/page.tsx`)
  - Auth hooks (`useAuth`) with session management
  - Protected route wrapper component
- **Parent Onboarding Flow** (4 steps)
  - Step 1: Family name setup
  - Step 2: Child name + avatar animal selection
  - Step 3: Activity selection from defaults
  - Step 4: Confirmation
- **API Routes for Setup**
  - `/api/setup/family` - Create family
  - `/api/setup/child` - Create child
  - `/api/setup/activities` - Copy selected activities to child
- **Data Hooks**
  - `useAuth()` - User authentication state
  - `useFamily()` - Fetch family & children data
  - `useActivities()` - Fetch activities & completions
- **TypeScript Types** - Full database schema types
- **Constants** - Default 18 activities with emojis and categories
- **Utilities** - Shuffle, date formatting, week calculations

### ⏳ Next Steps (Priority Order)

#### Phase 1: Supabase Setup & Database
1. **Create Supabase Project**
   - Go to https://supabase.com
   - Sign up / Log in
   - Click "New Project"
   - Choose region closest to you
   - Set a secure password
   - Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Create Database Tables**
   Run the following SQL in Supabase's SQL Editor:
   
   ```sql
   -- Create families table
   CREATE TABLE families (
     id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
     parent_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     family_name text NOT NULL,
     created_at timestamp DEFAULT now(),
     updated_at timestamp DEFAULT now()
   );

   -- Create children table
   CREATE TABLE children (
     id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
     family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
     name text NOT NULL,
     avatar_animal text NOT NULL DEFAULT 'unicorn',
     monetary_enabled boolean DEFAULT false,
     weekly_allowance_cents integer,
     created_at timestamp DEFAULT now(),
     updated_at timestamp DEFAULT now()
   );

   -- Create activities table
   CREATE TABLE activities (
     id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
     child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
     emoji text NOT NULL,
     label text NOT NULL,
     category text NOT NULL CHECK (category IN ('fun', 'learning', 'creative', 'active', 'helpful')),
     custom boolean DEFAULT false,
     created_at timestamp DEFAULT now(),
     updated_at timestamp DEFAULT now()
   );

   -- Create activity_completions table
   CREATE TABLE activity_completions (
     id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
     activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
     child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
     completed_at timestamp DEFAULT now(),
     parent_approved boolean,
     approved_by uuid REFERENCES auth.users(id),
     approved_at timestamp,
     reward_claimed boolean DEFAULT false,
     created_at timestamp DEFAULT now()
   );

   -- Create default_activities table (seed data)
   CREATE TABLE default_activities (
     id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
     emoji text NOT NULL,
     label text NOT NULL,
     category text NOT NULL CHECK (category IN ('fun', 'learning', 'creative', 'active', 'helpful')),
     created_at timestamp DEFAULT now()
   );

   -- Seed default activities
   INSERT INTO default_activities (emoji, label, category) VALUES
   ('📺', 'Watch TV', 'fun'),
   ('💻', 'Use the computer', 'learning'),
   ('📚', 'Do my homework', 'learning'),
   ('🎨', 'Draw or colour', 'creative'),
   ('📖', 'Read a book', 'learning'),
   ('🧸', 'Play with toys', 'fun'),
   ('🧩', 'Do a puzzle', 'fun'),
   ('🧹', 'Tidy my room', 'helpful'),
   ('🌱', 'Water the plants', 'helpful'),
   ('🍪', 'Help bake something', 'helpful'),
   ('💃', 'Have a dance party', 'active'),
   ('🎲', 'Play a board game', 'fun'),
   ('✂️', 'Make something crafty', 'creative'),
   ('🚶', 'Go for a walk', 'active'),
   ('🧺', 'Help fold laundry', 'helpful'),
   ('🎵', 'Listen to music', 'fun'),
   ('📝', 'Write or make a comic', 'creative'),
   ('🤸', 'Do some stretches', 'active');

   -- Enable RLS
   ALTER TABLE families ENABLE ROW LEVEL SECURITY;
   ALTER TABLE children ENABLE ROW LEVEL SECURITY;
   ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
   ALTER TABLE activity_completions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE default_activities ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   -- families: parents can only see their own
   CREATE POLICY "Parents can view their family"
     ON families FOR SELECT
     USING (auth.uid() = parent_user_id);

   CREATE POLICY "Parents can update their family"
     ON families FOR UPDATE
     USING (auth.uid() = parent_user_id);

   CREATE POLICY "Parents can insert families"
     ON families FOR INSERT
     WITH CHECK (auth.uid() = parent_user_id);

   -- children: parents can see their children
   CREATE POLICY "Parents can view children"
     ON children FOR SELECT
     USING (
       family_id IN (
         SELECT id FROM families WHERE parent_user_id = auth.uid()
       )
     );

   CREATE POLICY "Parents can insert children"
     ON children FOR INSERT
     WITH CHECK (
       family_id IN (
         SELECT id FROM families WHERE parent_user_id = auth.uid()
       )
     );

   CREATE POLICY "Parents can update children"
     ON children FOR UPDATE
     USING (
       family_id IN (
         SELECT id FROM families WHERE parent_user_id = auth.uid()
       )
     );

   -- activities: accessible via child's family
   CREATE POLICY "Parents can view activities"
     ON activities FOR SELECT
     USING (
       child_id IN (
         SELECT id FROM children
         WHERE family_id IN (
           SELECT id FROM families WHERE parent_user_id = auth.uid()
         )
       )
     );

   CREATE POLICY "Parents can insert activities"
     ON activities FOR INSERT
     WITH CHECK (
       child_id IN (
         SELECT id FROM children
         WHERE family_id IN (
           SELECT id FROM families WHERE parent_user_id = auth.uid()
         )
       )
     );

   CREATE POLICY "Parents can update activities"
     ON activities FOR UPDATE
     USING (
       child_id IN (
         SELECT id FROM children
         WHERE family_id IN (
           SELECT id FROM families WHERE parent_user_id = auth.uid()
         )
       )
     );

   CREATE POLICY "Parents can delete activities"
     ON activities FOR DELETE
     USING (
       child_id IN (
         SELECT id FROM children
         WHERE family_id IN (
           SELECT id FROM families WHERE parent_user_id = auth.uid()
         )
       )
     );

   -- activity_completions: children can insert their own, parents can update
   CREATE POLICY "Children can complete activities"
     ON activity_completions FOR INSERT
     WITH CHECK (
       child_id = ANY(
         SELECT id FROM children
         WHERE family_id IN (
           SELECT id FROM families WHERE parent_user_id = auth.uid() OR id IN (
             SELECT family_id FROM children WHERE id = auth.uid()
           )
         )
       )
     );

   CREATE POLICY "Parents can view completions"
     ON activity_completions FOR SELECT
     USING (
       child_id IN (
         SELECT id FROM children
         WHERE family_id IN (
           SELECT id FROM families WHERE parent_user_id = auth.uid()
         )
       )
     );

   CREATE POLICY "Parents can update completions"
     ON activity_completions FOR UPDATE
     USING (
       child_id IN (
         SELECT id FROM children
         WHERE family_id IN (
           SELECT id FROM families WHERE parent_user_id = auth.uid()
         )
       )
     );

   -- default_activities: everyone can read
   CREATE POLICY "Anyone can view default activities"
     ON default_activities FOR SELECT
     USING (true);
   ```

3. **Add Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and Anon Key

#### Phase 2: Main Activity Bag Page
Build `/app/activity-bag/[childId]/page.tsx` with:
- ActivityCard component (display activity emoji + label)
- ActivityCarousel component (swipe/arrow navigation, shuffle algorithm)
- Category filter buttons
- "Surprise me!" button with spinning animation
- "Mark as done" button for completion
- Display current position with dot indicators

Components to create:
- `components/ActivityCard.tsx` - Single activity card
- `components/ActivityCarousel.tsx` - Card carousel with swipe
- `components/CategoryFilter.tsx` - Filter by category
- Integrate spin/reveal animations from original component

#### Phase 3: Rewards & Completion Tracking
- Create `components/RewardAnimation.tsx` - Cute animal reward animation
- Create `components/CompletionHistory.tsx` - Show completed activities
- Add celebration animation when activity marked done
- Show reward count for day/week
- Create `/api/activities/complete` route

#### Phase 4: Dashboard
Build `/app/dashboard/page.tsx`:
- List children in family
- Create new child button
- Link to edit child settings
- Link to each child's activity bag

Components:
- `components/ChildCard.tsx` - Display child with avatar
- `components/CreateChildModal.tsx` - Form to add new child

#### Phase 5: Polish & Deployment
- Add error boundaries
- Add loading states
- Mobile responsiveness testing
- Accessibility improvements
- Deploy to Vercel
- Set Vercel environment variables

---

## Running Locally

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
# Add your Supabase credentials

# Run dev server
npm run dev

# Open http://localhost:3000
```

## File Structure
```
activity-bag/
├── app/
│   ├── (auth)/              # Auth routes (group)
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── setup/               # Onboarding flow
│   ├── activity-bag/        # Main app (TO BUILD)
│   ├── dashboard/           # Child management (TO BUILD)
│   ├── api/
│   │   └── setup/           # Setup API routes
│   ├── layout.tsx
│   └── page.tsx             # Root redirect
├── components/
│   ├── setup/               # Onboarding components
│   ├── ActivityCard.tsx     # (TO BUILD)
│   ├── ActivityCarousel.tsx # (TO BUILD)
│   ├── RewardAnimation.tsx  # (TO BUILD)
│   ├── ProtectedRoute.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useFamily.ts
│   └── useActivities.ts
├── lib/
│   ├── types.ts
│   ├── constants.ts
│   ├── utils.ts
│   ├── supabase-client.ts
│   └── supabase-server.ts
└── ...
```

## Key Architecture Decisions
- **Supabase** for multi-tenant data isolation with RLS
- **Server Components** for API routes (secure)
- **Client Components** for interactive pages
- **TypeScript** for type safety
- **Tailwind CSS** for styling (consistent with original design)
- **Next.js App Router** for modern routing

## Testing Checklist
- [ ] Signup → email verification
- [ ] Login → redirect to dashboard (if family exists)
- [ ] Complete onboarding flow
- [ ] Activities load in bag
- [ ] Swipe/click to reveal activity
- [ ] "Surprise me!" animation works
- [ ] Mark activity as complete
- [ ] Reward animation displays
- [ ] Completion history shows
- [ ] Mobile touch gestures work
- [ ] RLS policies prevent data leakage

## Deployment to Vercel

```bash
# Create GitHub repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/activity-bag.git
git push -u origin main

# Connect to Vercel
# Go to https://vercel.com
# Click "New Project"
# Select GitHub repo
# Add environment variables:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
# Deploy!
```

---

## Next: Start Supabase Setup!
The best next step is to create your Supabase project and set up the database with the SQL above. Once that's done, you can test the login/signup and onboarding flow!
