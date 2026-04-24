// Project-owner short-circuit. Powers the "Switch to teacher / Switch to
// student" header button that should only ever appear for the developer
// running the project end-to-end against their own data. Gate by email
// rather than a role/flag so we don't have to ship a migration just to
// flip a UI toggle.
//
// To add other owner accounts, set OWNER_EMAILS in .env.local
// (comma-separated). The hardcoded fallback is the project owner so the
// button always works locally without any extra config.

const FALLBACK = 'duruihsan@gmail.com';

function set(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_OWNER_EMAILS ?? '';
  const parsed = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set(parsed.length > 0 ? parsed : [FALLBACK]);
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return set().has(email.trim().toLowerCase());
}
