import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_ACTIVITIES } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { childId, defaultActivityIds } = await req.json();

    const supabase = await createClient();

    // Filter default activities to those selected
    const selectedActivities = DEFAULT_ACTIVITIES.filter((_, index) =>
      defaultActivityIds.includes(`default-${index}`),
    ).map((activity) => ({
      child_id: childId,
      emoji: activity.emoji,
      label: activity.label,
      category: activity.category,
      custom: false,
    }));

    const { data, error } = await supabase
      .from('activities')
      .insert(selectedActivities)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating activities:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create activities' },
      { status: 500 },
    );
  }
}
