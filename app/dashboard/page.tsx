'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/hooks/useAuth';
import { Family, Child } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ANIMAL_EMOJIS } from '@/lib/types';
import { signOut } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .select('*')
          .eq('parent_user_id', user.id)
          .single();

        if (familyError && familyError.code !== 'PGRST116') {
          throw familyError;
        }

        if (familyData) {
          setFamily(familyData);

          const { data: childrenData, error: childrenError } = await supabase
            .from('children')
            .select('*')
            .eq('family_id', familyData.id)
            .order('created_at', { ascending: true });

          if (childrenError) throw childrenError;
          setChildren(childrenData || []);
        }

        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handleNewChild = () => {
    router.push('/setup');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
            @keyframes pulse-glow {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
            .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          `}</style>
          <div className="text-center">
            <div className="text-6xl mb-4 pulse-glow">🎒</div>
            <div className="text-white text-xl font-bold">Loading your activity bags...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen pb-12"
        style={{
          background: 'linear-gradient(160deg,#160428 0%,#0c1630 55%,#082010 100%)',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
          body, * { font-family: 'Nunito', cursive, sans-serif; }
          @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .card-animation { animation: slide-in 0.5s ease-out; }
        `}</style>

        {/* Hero Section */}
        <div className="relative pt-12 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-2">
              <div>
                <h1 className="text-6xl sm:text-7xl font-black mb-3">
                  <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-yellow-300 bg-clip-text text-transparent">
                    🎒 Activity Bag
                  </span>
                </h1>
                {family && (
                  <p className="text-xl text-white/70 font-semibold">{family.family_name}</p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
              >
                Logout
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-200 mb-8">
                ⚠️ {error}
              </div>
            )}

            {/* Welcome or Children Grid */}
            {!family ? (
              <div className="py-20 text-center">
                <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-md mx-auto">
                  <div className="text-7xl mb-6 animate-bounce">👋</div>
                  <h2 className="text-3xl font-black text-white mb-3">Welcome!</h2>
                  <p className="text-gray-200 mb-8 text-lg">
                    Let's create your first activity bag. Your kids will love it!
                  </p>
                  <button
                    onClick={handleNewChild}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-black py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 text-lg shadow-lg"
                  >
                    ✨ Create First Activity Bag
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Section Title */}
                <div className="my-12">
                  <p className="text-white/60 text-sm font-bold uppercase tracking-widest">
                    {children.length === 0 ? 'Get Started' : 'Your Children'}
                  </p>
                  <h2 className="text-3xl font-black text-white mt-2">
                    {children.length === 0
                      ? 'Create your first activity bag'
                      : `${children.length} Activity Bag${children.length !== 1 ? 's' : ''}`}
                  </h2>
                </div>

                {/* Children Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {children.map((child, idx) => (
                    <div
                      key={child.id}
                      className="card-animation"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div
                        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 h-full flex flex-col hover:from-white/20 hover:to-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer group"
                        onClick={() => router.push(`/activity-bag/${child.id}`)}
                      >
                        {/* Animal Emoji */}
                        <div className="text-8xl mb-6 text-center group-hover:scale-125 transition-transform duration-300">
                          {ANIMAL_EMOJIS[
                            child.avatar_animal as keyof typeof ANIMAL_EMOJIS
                          ] || '🎒'}
                        </div>

                        {/* Child Info */}
                        <h3 className="text-3xl font-black text-white mb-2 text-center">
                          {child.name}
                        </h3>
                        <p className="text-white/50 text-sm text-center mb-6 font-semibold">
                          {new Date(child.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>

                        {/* Button */}
                        <button
                          className="mt-auto w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-black py-3 rounded-2xl transition-all duration-200 transform hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/activity-bag/${child.id}`);
                          }}
                        >
                          Open Bag 🎒
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Child Button */}
                  <div
                    className="card-animation"
                    style={{ animationDelay: `${children.length * 0.1}s` }}
                  >
                    <div
                      className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl border-2 border-dashed border-pink-400/50 rounded-3xl p-8 h-full flex items-center justify-center hover:from-white/10 hover:border-pink-400 transition-all duration-300 transform hover:scale-105 cursor-pointer group min-h-72"
                      onClick={handleNewChild}
                    >
                      <div className="text-center">
                        <div className="text-7xl mb-4 group-hover:scale-125 transition-transform duration-300">
                          ➕
                        </div>
                        <p className="text-white font-black text-xl mb-2">Add Child</p>
                        <p className="text-white/50 text-sm">Create a new activity bag</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
