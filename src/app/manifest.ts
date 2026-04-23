import type { MetadataRoute } from 'next';

// PWA manifest. Next.js converts this file into /manifest.webmanifest at
// build time. Kept minimal — no full install story yet, but having this
// fixes the Lighthouse "no manifest" warning and means mobile "Add to
// home screen" uses our colors instead of the browser default.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Playdemy',
    short_name: 'Playdemy',
    description: 'AI-powered game creation for classrooms.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff7e6',
    theme_color: '#1d1a14',
    orientation: 'portrait-primary',
    // Next will serve favicon.ico at the root already; adding a couple of
    // size entries lets "Add to home screen" and app switchers pick
    // reasonable assets. Replace with pixel-perfect exports when we have
    // them.
    icons: [
      { src: '/favicon.ico', sizes: '32x32 48x48', type: 'image/x-icon' },
    ],
  };
}
