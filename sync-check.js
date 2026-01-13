#!/usr/bin/env node

/**
 * GOV.UK Guidance Sync Checker
 *
 * Compares local markdown files against live GOV.UK guidance
 * to detect when content has drifted.
 *
 * Usage:
 *   node sync-check.js           # Check all mapped files
 *   node sync-check.js --diff    # Include content diff
 *   node sync-check.js --reset   # Reset last-checked timestamps
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_FILE = './sync-config.json';
const STATE_FILE = './sync-state.json';
const GOVUK_API_BASE = 'https://www.gov.uk/api/content';

// Simple HTML to Markdown conversion (Govspeak-aware)
function htmlToMarkdown(html) {
  if (!html) return '';

  let md = html
    // Remove govspeak wrapper
    .replace(/<div class="govspeak">/g, '')
    .replace(/<\/div>/g, '')

    // Headings
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n')

    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')

    // Lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')

    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

    // Bold/italic
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')

    // Govspeak callouts (these render as specific divs)
    .replace(/<div class="call-to-action"[^>]*>(.*?)<\/div>/gis, '$CTA\n$1\n$CTA\n')
    .replace(/<div class="application-notice info-notice"[^>]*>(.*?)<\/div>/gis, '^$1\n')
    .replace(/<div class="application-notice help-notice"[^>]*>(.*?)<\/div>/gis, '%$1%\n')

    // Tables (basic)
    .replace(/<table[^>]*>/gi, '\n')
    .replace(/<\/table>/gi, '\n')
    .replace(/<thead[^>]*>/gi, '')
    .replace(/<\/thead>/gi, '')
    .replace(/<tbody[^>]*>/gi, '')
    .replace(/<\/tbody>/gi, '')
    .replace(/<tr[^>]*>/gi, '|')
    .replace(/<\/tr>/gi, '|\n')
    .replace(/<th[^>]*>(.*?)<\/th>/gi, ' $1 |')
    .replace(/<td[^>]*>(.*?)<\/td>/gi, ' $1 |')

    // Clean up remaining HTML
    .replace(/<[^>]+>/g, '')

    // Clean up whitespace
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return md;
}

// Fetch from GOV.UK Content API
function fetchGovUK(urlPath) {
  return new Promise((resolve, reject) => {
    const url = `${GOVUK_API_BASE}${urlPath}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON from ${url}`));
          }
        } else if (res.statusCode === 404) {
          reject(new Error(`Not found: ${url}`));
        } else {
          reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        }
      });
    }).on('error', reject);
  });
}

// Load state (last-checked timestamps)
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastChecked: {}, lastUpdated: {} };
  }
}

// Save state
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Simple diff - returns lines that differ
function simpleDiff(localContent, remoteContent) {
  const localLines = localContent.split('\n').map(l => l.trim()).filter(Boolean);
  const remoteLines = remoteContent.split('\n').map(l => l.trim()).filter(Boolean);

  const localSet = new Set(localLines);
  const remoteSet = new Set(remoteLines);

  const onlyInRemote = remoteLines.filter(l => !localSet.has(l));
  const onlyInLocal = localLines.filter(l => !remoteSet.has(l));

  return { onlyInRemote, onlyInLocal };
}

// Main sync check
async function checkSync(options = {}) {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  const state = options.reset ? { lastChecked: {}, lastUpdated: {} } : loadState();

  const results = [];
  const now = new Date().toISOString();

  console.log('GOV.UK Guidance Sync Checker\n');
  console.log('Checking', config.mappings.length, 'files...\n');

  for (const mapping of config.mappings) {
    const localPath = path.join(process.cwd(), mapping.local);
    const shortName = path.basename(mapping.local);

    process.stdout.write(`  ${shortName}... `);

    try {
      // Check local file exists
      if (!fs.existsSync(localPath)) {
        console.log('LOCAL FILE MISSING');
        results.push({
          file: shortName,
          status: 'error',
          message: 'Local file not found'
        });
        continue;
      }

      // Fetch from GOV.UK
      const govukData = await fetchGovUK(mapping.govuk);
      const remoteUpdated = govukData.public_updated_at;
      const lastKnown = state.lastUpdated[mapping.govuk];

      // Check if GOV.UK has been updated since we last checked
      const hasRemoteChanges = !lastKnown || new Date(remoteUpdated) > new Date(lastKnown);

      if (!hasRemoteChanges) {
        console.log('OK (no changes on GOV.UK)');
        results.push({
          file: shortName,
          status: 'ok',
          message: 'No changes detected on GOV.UK',
          lastUpdated: remoteUpdated
        });
      } else {
        // Content has changed - do diff if requested
        if (options.diff) {
          const localContent = fs.readFileSync(localPath, 'utf8');
          const remoteHtml = govukData.details?.body || '';
          const remoteMarkdown = htmlToMarkdown(remoteHtml);

          const diff = simpleDiff(localContent, remoteMarkdown);
          const changeCount = diff.onlyInRemote.length + diff.onlyInLocal.length;

          if (changeCount > 0) {
            console.log(`DRIFTED (${changeCount} differences)`);
            results.push({
              file: shortName,
              status: 'drifted',
              message: `${diff.onlyInRemote.length} lines added/changed on GOV.UK, ${diff.onlyInLocal.length} lines only in local`,
              lastUpdated: remoteUpdated,
              diff: options.verbose ? diff : undefined
            });
          } else {
            console.log('OK (content matches)');
            results.push({
              file: shortName,
              status: 'ok',
              message: 'Content matches',
              lastUpdated: remoteUpdated
            });
          }
        } else {
          console.log(`UPDATED on GOV.UK (${remoteUpdated.split('T')[0]})`);
          results.push({
            file: shortName,
            status: 'updated',
            message: `GOV.UK updated: ${remoteUpdated}`,
            lastUpdated: remoteUpdated,
            previouslyKnown: lastKnown
          });
        }
      }

      // Update state
      state.lastChecked[mapping.govuk] = now;
      state.lastUpdated[mapping.govuk] = remoteUpdated;

      // Be nice to GOV.UK - small delay between requests
      await new Promise(r => setTimeout(r, 200));

    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      results.push({
        file: shortName,
        status: 'error',
        message: err.message
      });
    }
  }

  // Save state
  saveState(state);

  // Summary
  console.log('\n' + '='.repeat(50));
  const drifted = results.filter(r => r.status === 'drifted' || r.status === 'updated');
  const errors = results.filter(r => r.status === 'error');
  const ok = results.filter(r => r.status === 'ok');

  console.log(`\nSummary: ${ok.length} OK, ${drifted.length} need attention, ${errors.length} errors`);

  if (drifted.length > 0) {
    console.log('\nFiles that may need updating:');
    drifted.forEach(r => console.log(`  - ${r.file}: ${r.message}`));
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(r => console.log(`  - ${r.file}: ${r.message}`));
  }

  return results;
}

// CLI
const args = process.argv.slice(2);
const options = {
  diff: args.includes('--diff'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  reset: args.includes('--reset')
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
GOV.UK Guidance Sync Checker

Usage:
  node sync-check.js [options]

Options:
  --diff      Compare content (not just timestamps)
  --verbose   Show detailed diff output
  --reset     Reset last-checked timestamps
  --help      Show this help
`);
  process.exit(0);
}

checkSync(options).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
