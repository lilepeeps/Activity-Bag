import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get the current user to set as approver
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    const { data, error } = await (supabase as any)
      .from('activity_completions')
      .update({
        parent_approved: true,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error approving completion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to approve completion' },
      { status: 500 },
    );
  }
}
