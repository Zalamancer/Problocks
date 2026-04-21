// GET /api/classes/:classId/students — real roster for a class.
// Public read for now (mirrors quiz_rooms pattern + the permissive RLS in
// migration 004). Returns the rows in join-order for stable display.

import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  const { classId } = await params;
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('students')
    .select('id, google_sub, email, full_name, given_name, family_name, picture_url, joined_at')
    .eq('class_id', classId)
    .order('joined_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data ?? [] });
}
