// GET /api/classes/:classId — public class lookup for the /join page.
// Returns non-sensitive fields only (name, subject, grade).
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
  const row = await supabase
    .from('classes')
    .select('id, name, subject, grade')
    .eq('id', classId)
    .maybeSingle();
  if (row.error) return NextResponse.json({ error: row.error.message }, { status: 500 });
  if (!row.data) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  return NextResponse.json({ class: row.data });
}
