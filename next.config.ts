import type { NextConfig } from "next";

// Allowlist every origin we serve images from via <Image>. The default
// Next Image optimizer 400s any remote host not listed here, so any
// Supabase-hosted cover image, Google avatar, or Classroom photo would
// break in production without this. Wildcards are used where the origin
// pattern is stable (Supabase uses `<project-ref>.supabase.co`).

const SUPABASE_HOST = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return '**.supabase.co';
    return new URL(url).hostname;
  } catch {
    return '**.supabase.co';
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage public URLs — game covers, any future avatars,
      // data-export signed URLs (though those are JSON, not images).
      { protocol: 'https', hostname: SUPABASE_HOST },
      // Google profile photos for signed-in teachers + students. Both
      // lh3.googleusercontent.com and the legacy CDN variants show up.
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      // Google Classroom photoUrls — some accounts return protocol-
      // relative `//lh3...` that we normalise server-side, others come
      // from classroom.googleapis.com directly.
      { protocol: 'https', hostname: 'classroom.googleapis.com' },
    ],
  },
  // Strip the "X-Powered-By: Next.js" response header — small
  // fingerprinting win, zero cost.
  poweredByHeader: false,
};

export default nextConfig;
