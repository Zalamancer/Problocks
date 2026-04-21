// GET /api/schools/search — typeahead source for the teacher setup form.
//
// Strategy, in order:
//   1. region=us  → OpenDataSoft `us-public-schools` dataset (mirrors NCES CCD
//                   with real full-text search). Free, no key, CORS-enabled.
//      https://public.opendatasoft.com/explore/dataset/us-public-schools
//   2. all regions → OpenStreetMap Nominatim, restricted by country code.
//      Used as a fallback when ODS returns nothing or region is non-US.
//
// Results are normalized into a common shape with rich address detail so the
// dropdown can show district/city/state/zip and teachers can disambiguate
// same-named schools across districts (Harmony has ~60 TX campuses).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Normalized = {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  district: string;
  country: string;
  source: 'nces' | 'osm';
};

const REGION_COUNTRY: Record<string, string | undefined> = {
  us: 'us',
  uk: 'gb',
  ca: 'ca',
  au: 'au',
  nz: 'nz',
  other: undefined,
};

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((p) => (/^(\s+|-)$/.test(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');
}

// Escape a user query for OpenDataSoft ODSQL: double-quote the whole string and
// backslash-escape any embedded double quotes.
function odsqlQuote(q: string): string {
  return `"${q.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function searchODS(q: string): Promise<Normalized[]> {
  const url = new URL(
    'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/us-public-schools/records',
  );
  url.searchParams.set('where', `search(name, ${odsqlQuote(q)})`);
  url.searchParams.set('limit', '10');
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: unknown };
    const rows = Array.isArray(data.results) ? data.results : [];
    return rows.map((r) => {
      const s = r as Record<string, unknown>;
      const rawName = String(s.name || '');
      const rawCity = String(s.city || '');
      const rawCounty = String(s.county || '');
      return {
        id: `nces-${String(s.ncesid || s.objectid || Math.random())}`,
        name: titleCase(rawName),
        city: titleCase(rawCity),
        state: String(s.state || ''),
        zip: String(s.zip || '').slice(0, 5),
        county: titleCase(rawCounty),
        district: String(s.districtid || ''),
        country: 'US',
        source: 'nces' as const,
      };
    });
  } catch {
    return [];
  }
}

async function searchNominatim(q: string, country?: string): Promise<Normalized[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  const biased = /school|academy|college|high|elementary|primary|secondary/i.test(q)
    ? q
    : `${q} school`;
  url.searchParams.set('q', biased);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('limit', '10');
  if (country) url.searchParams.set('countrycodes', country);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Problocks/1.0 (https://problocks.app; schools-autocomplete)',
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as Array<Record<string, unknown>>;
    return json
      .map((item): Normalized | null => {
        const a = (item.address as Record<string, string> | undefined) || {};
        const nd = (item.namedetails as Record<string, string> | undefined) || {};
        const name =
          a.school ||
          a.amenity ||
          nd.name ||
          (typeof item.name === 'string' ? item.name : '') ||
          (typeof item.display_name === 'string' ? item.display_name.split(',')[0] : '');
        if (!name) return null;
        return {
          id: `osm-${String(item.place_id)}`,
          name: String(name).trim(),
          city: a.city || a.town || a.village || a.suburb || '',
          state: a.state || '',
          zip: a.postcode || '',
          county: a.county || '',
          district: '',
          country: a.country || '',
          source: 'osm',
        };
      })
      .filter((x): x is Normalized => x !== null);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const region = (searchParams.get('region') || 'other').toLowerCase();
  if (q.length < 2) {
    return NextResponse.json({ results: [] as Normalized[] });
  }

  const country = REGION_COUNTRY[region];
  let results: Normalized[] = [];

  if (region === 'us') {
    results = await searchODS(q);
  }

  if (results.length === 0) {
    results = await searchNominatim(q, country);
  }

  // Dedupe by normalized name + city + state
  const seen = new Set<string>();
  const deduped = results.filter((r) => {
    const k = `${r.name}|${r.city}|${r.state}`.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return NextResponse.json({ results: deduped });
}
