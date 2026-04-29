export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          parent_user_id: string;
          family_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_user_id: string;
          family_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          family_name?: string;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          avatar_animal: string;
          monetary_enabled: boolean;
          weekly_allowance_cents: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          avatar_animal: string;
          monetary_enabled?: boolean;
          weekly_allowance_cents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          avatar_animal?: string;
          monetary_enabled?: boolean;
          weekly_allowance_cents?: number | null;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          child_id: string;
          emoji: string;
          label: string;
          category: 'fun' | 'learning' | 'creative' | 'active' | 'helpful';
          custom: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          emoji: string;
          label: string;
          category: 'fun' | 'learning' | 'creative' | 'active' | 'helpful';
          custom?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          emoji?: string;
          label?: string;
          category?: 'fun' | 'learning' | 'creative' | 'active' | 'helpful';
          updated_at?: string;
        };
      };
      activity_completions: {
        Row: {
          id: string;
          activity_id: string;
          child_id: string;
          completed_at: string;
          parent_approved: boolean | null;
          approved_by: string | null;
          approved_at: string | null;
          reward_claimed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          child_id: string;
          completed_at?: string;
          parent_approved?: boolean | null;
          approved_by?: string | null;
          approved_at?: string | null;
          reward_claimed?: boolean;
          created_at?: string;
        };
        Update: {
          parent_approved?: boolean | null;
          approved_by?: string | null;
          approved_at?: string | null;
          reward_claimed?: boolean;
        };
      };
      default_activities: {
        Row: {
          id: string;
          emoji: string;
          label: string;
          category: 'fun' | 'learning' | 'creative' | 'active' | 'helpful';
          created_at: string;
        };
        Insert: {
          id?: string;
          emoji: string;
          label: string;
          category: 'fun' | 'learning' | 'creative' | 'active' | 'helpful';
          created_at?: string;
        };
        Update: {
          emoji?: string;
          label?: string;
          category?: 'fun' | 'learning' | 'creative' | 'active' | 'helpful';
        };
      };
    };
  };
};

export type Family = Database['public']['Tables']['families']['Row'];
export type Child = Database['public']['Tables']['children']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type ActivityCompletion = Database['public']['Tables']['activity_completions']['Row'];
export type DefaultActivity = Database['public']['Tables']['default_activities']['Row'];

export type CategoryType = Activity['category'];

export const CATEGORIES: CategoryType[] = ['fun', 'learning', 'creative', 'active', 'helpful'];

export const CATEGORY_STYLES = {
  fun: { card: '#FFF3E0', border: '#FF9500', glow: 'rgba(255,149,0,0.6)', back: '#e8720a' },
  learning: { card: '#E8F4FD', border: '#34AADC', glow: 'rgba(52,170,220,0.6)', back: '#1a85b8' },
  creative: { card: '#F3E8FD', border: '#AF52DE', glow: 'rgba(175,82,222,0.6)', back: '#8a2fba' },
  active: { card: '#E8FDF0', border: '#4CD964', glow: 'rgba(76,217,100,0.6)', back: '#28a845' },
  helpful: { card: '#FDE8E8', border: '#FF3B30', glow: 'rgba(255,59,48,0.6)', back: '#cc1a10' },
};

export const CATEGORY_LABELS = {
  all: { label: '🎒 All', color: '#D63087' },
  fun: { label: '🎉 Fun', color: '#FF9500' },
  learning: { label: '📚 Learn', color: '#34AADC' },
  creative: { label: '🎨 Create', color: '#AF52DE' },
  active: { label: '⚡ Active', color: '#4CD964' },
  helpful: { label: '🌟 Helpful', color: '#FF3B30' },
};

export const ANIMALS = ['unicorn', 'dragon', 'cat', 'dog', 'penguin', 'bear', 'butterfly', 'bunny'];

export const ANIMAL_EMOJIS: Record<string, string> = {
  unicorn: '🦄',
  dragon: '🐉',
  cat: '🐱',
  dog: '🐶',
  penguin: '🐧',
  bear: '🐻',
  butterfly: '🦋',
  bunny: '🐰',
};
