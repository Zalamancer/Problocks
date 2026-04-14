import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, prompt, html, userId } = body as {
      name: string;
      prompt: string;
      html: string;
      userId?: string;
    };

    if (!name || !prompt || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: name, prompt, html' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        url: null,
        warning: 'Supabase not configured — game saved locally only',
      });
    }

    const resolvedUserId = userId || 'local-user';
    const gameId = crypto.randomUUID();
    const storagePath = `${resolvedUserId}/${gameId}.html`;

    // Upload HTML to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('games')
      .upload(storagePath, html, {
        contentType: 'text/html',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload game file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('games')
      .getPublicUrl(storagePath);

    // Insert row in games table
    const { data: gameRow, error: insertError } = await supabase
      .from('games')
      .insert({
        id: gameId,
        user_id: resolvedUserId,
        name,
        prompt,
        storage_path: storagePath,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Attempt to clean up the uploaded file
      await supabase.storage.from('games').remove([storagePath]);
      return NextResponse.json(
        { error: 'Failed to save game record', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: gameRow.id,
      url: urlData.publicUrl,
    });
  } catch (err) {
    console.error('Save game error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
