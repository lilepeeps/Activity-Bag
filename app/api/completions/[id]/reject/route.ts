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

    // Delete the rejected completion
    const { error } = await (supabase as any)
      .from('activity_completions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting completion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reject completion' },
      { status: 500 },
    );
  }
}
