/**
 * Read-only audit: find gallery photos that won't display on the site.
 *
 * The public gallery only renders an item if (a) its category has a real page,
 * and (b) for categories that have subsections, its subcategory matches a known
 * one. Anything else is uploaded "successfully" but silently invisible.
 *
 * This script ONLY reads. It never patches, creates, or deletes.
 * Run with: node scripts/audit-subcategories.js
 */

import { createClient } from '@sanity/client';

// Same public, token-less config the website uses to read the gallery.
const client = createClient({
  projectId: '7pjigdmm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Source of truth — must match src/sanity/schemaTypes/galleryItem.ts
const VALID_SUBCATEGORIES = {
  concrete: ['walkways-steps', 'flatwork-patios', 'driveways', 'stone-work'],
  'fire-features': ['fire-pits', 'fire-pit-tables', 'fireplaces'],
  landscaping: ['water-features', 'turf', 'gardens'],
};
// Categories that have a gallery page but render every item regardless of subcategory.
const NO_SUBCATEGORY_CATEGORIES = ['outdoor-kitchens', 'covered-patios', 'iron-work'];
const VALID_CATEGORIES = [...Object.keys(VALID_SUBCATEGORIES), ...NO_SUBCATEGORY_CATEGORIES];

async function audit() {
  const items = await client.fetch(
    `*[_type == "galleryItem"]{ _id, title, category, subcategory, isVideo }`
  );

  console.log(`\nScanned ${items.length} gallery item(s).\n`);

  const noPage = []; // category has no gallery page at all (e.g. old "pools-spas")
  const orphanSub = []; // category has subsections but item's subcategory is missing/unknown

  for (const item of items) {
    if (!VALID_CATEGORIES.includes(item.category)) {
      noPage.push(item);
      continue;
    }
    const validSubs = VALID_SUBCATEGORIES[item.category];
    if (validSubs && !validSubs.includes(item.subcategory)) {
      orphanSub.push(item);
    }
  }

  const fmt = (i) =>
    `  - "${i.title || '(untitled)'}"  [${i.isVideo ? 'video' : 'photo'}]  ` +
    `category=${i.category}  subcategory=${i.subcategory ?? '(none)'}  _id=${i._id}`;

  if (noPage.length === 0 && orphanSub.length === 0) {
    console.log('✅ No stuck items. Every photo lands on a page the site displays.\n');
    return;
  }

  if (noPage.length > 0) {
    console.log(`🔴 ${noPage.length} item(s) in a category with NO gallery page (404, never shown):`);
    noPage.forEach((i) => console.log(fmt(i)));
    console.log('');
  }

  if (orphanSub.length > 0) {
    console.log(`🟠 ${orphanSub.length} item(s) whose subcategory the gallery won't display:`);
    orphanSub.forEach((i) => console.log(fmt(i)));
    console.log('');
  }

  console.log('Nothing was changed. Re-run after any fix to confirm it is clean.\n');
}

audit().catch((err) => {
  console.error('Audit failed:', err.message);
  process.exit(1);
});
