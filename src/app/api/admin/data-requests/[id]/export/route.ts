import { NextResponse } from 'next/server';
import { isPlatformAdmin } from '@/lib/teacher-auth';
import { buildExportBundle } from '@/lib/export-bundle';

// GET /api/admin/data-requests/:id/export
// Admin-only direct JSON download. Streams whatever buildExportBundle()
// finds for the referenced student — same data the email delivery path
// uploads to Storage in Sprint 9.1.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const bundle = await buildExportBundle(id);
  if (!bundle) {
    return NextResponse.json({ error: 'Request not found or admin client not configured' }, { status: 404 });
  }

  const filename = `problocks-export-${id}-${Date.now()}.json`;
  return new NextResponse(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });
}
