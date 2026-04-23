// Twitter card image. Reuses the OG image — same dimensions work for
// both summary_large_image and Open Graph. `runtime` can't be re-exported
// across convention files (Next build hard-error), so we re-declare it
// here and share the rest via a module-level re-export.

export const runtime = 'edge';

export { default, alt, size, contentType } from './opengraph-image';
