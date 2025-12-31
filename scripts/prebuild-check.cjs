const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (stat.isFile()) files.push(full);
  }
  return files;
}

function fileContains(fp, needles) {
  const text = fs.readFileSync(fp, 'utf8');
  return needles.some((n) => text.includes(n));
}

function fail(msg) {
  console.error('\n[prebuild-check] ' + msg);
  process.exit(1);
}

// 1) Block hardcoded Render backend references
const forbiddenStrings = [
  'deliverei-backend.onrender.com',
  '/api/public/',
];

const files = walk(SRC);
const offenders = files.filter((fp) => fileContains(fp, forbiddenStrings));
if (offenders.length > 0) {
  console.error('[prebuild-check] Found forbidden backend references:');
  offenders.forEach((o) => console.error(' - ' + path.relative(ROOT, o)));
  fail('Remove references to onrender backend and /api/public before building.');
}

// 2) Warn if Supabase envs are missing
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnon) {
  console.warn('[prebuild-check] WARNING: Supabase envs missing at build time (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  console.warn('[prebuild-check] The storefront may not load products in production without these.');
}

// 3) Prevent VITE_API_URL pointing to onrender
const viteApi = process.env.VITE_API_URL || '';
if (viteApi && /onrender\.com/i.test(viteApi)) {
  fail('VITE_API_URL points to onrender.com which is deprecated. Use Supabase or correct backend.');
}

console.log('[prebuild-check] Passed. Proceeding with build.');
