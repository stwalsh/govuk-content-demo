#!/usr/bin/env node

/**
 * Fetch GOV.UK content via the Content API and convert to markdown
 *
 * Usage:
 *   node fetch-govuk.js /guidance/page-slug
 *   node fetch-govuk.js /guidance/page-slug output-folder
 *   node fetch-govuk.js https://www.gov.uk/guidance/page-slug
 *
 * Examples:
 *   node fetch-govuk.js /guidance/how-to-collect-your-packaging-data-for-extended-producer-responsibility
 *   node fetch-govuk.js /guidance/extended-producer-responsibility-for-packaging-who-is-affected
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================================================
// HTML to Markdown Converter
// ============================================================================

function htmlToMarkdown(html) {
  let md = html;

  // Remove the govspeak wrapper div
  md = md.replace(/<div class="govspeak">/gi, '');
  md = md.replace(/<\/div>\s*$/gi, '');

  // Handle info callouts (govspeak style)
  md = md.replace(
    /<div[^>]*class="[^"]*application-notice[^"]*info-notice[^"]*"[^>]*>\s*<p>([\s\S]*?)<\/p>\s*<\/div>/gi,
    (match, content) => `\n\n^${cleanInlineHtml(content).trim()}^\n\n`
  );

  // Handle warning callouts
  md = md.replace(
    /<div[^>]*class="[^"]*application-notice[^"]*help-notice[^"]*"[^>]*>\s*<p>([\s\S]*?)<\/p>\s*<\/div>/gi,
    (match, content) => `\n\n%${cleanInlineHtml(content).trim()}%\n\n`
  );

  // Handle call-to-action boxes (convert to blockquote for now)
  md = md.replace(
    /<div[^>]*class="[^"]*call-to-action[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    (match, content) => {
      const cleaned = htmlToMarkdown(content);
      return '\n\n' + cleaned.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
    }
  );

  // Handle remaining generic notice divs
  md = md.replace(
    /<div[^>]*role="note"[^>]*>\s*<p>([\s\S]*?)<\/p>\s*<\/div>/gi,
    (match, content) => `\n\n^${cleanInlineHtml(content).trim()}^\n\n`
  );

  // Headers
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (match, content) => `\n\n## ${cleanInlineHtml(content).trim()}\n\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (match, content) => `\n\n### ${cleanInlineHtml(content).trim()}\n\n`);
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (match, content) => `\n\n#### ${cleanInlineHtml(content).trim()}\n\n`);

  // Lists - need to handle before paragraphs
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const mdItems = items.map(item => {
      const text = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/i, '$1');
      return `- ${cleanInlineHtml(text).trim()}`;
    });
    return '\n\n' + mdItems.join('\n') + '\n\n';
  });

  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const mdItems = items.map((item, i) => {
      const text = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/i, '$1');
      return `${i + 1}. ${cleanInlineHtml(text).trim()}`;
    });
    return '\n\n' + mdItems.join('\n') + '\n\n';
  });

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, content) => {
    return '\n\n' + convertTable(content) + '\n\n';
  });

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, content) => `\n\n${cleanInlineHtml(content).trim()}\n\n`);

  // Clean up inline elements
  md = cleanInlineHtml(md);

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

function cleanInlineHtml(html) {
  let text = html;

  // Links
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (match, href, content) => {
    const cleanContent = cleanInlineHtml(content).trim();
    // Make relative links absolute
    if (href.startsWith('/')) {
      href = 'https://www.gov.uk' + href;
    }
    return `[${cleanContent}](${href})`;
  });

  // Bold
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');

  // Italic
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

  // Abbreviations - just use the text
  text = text.replace(/<abbr[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/abbr>/gi, '$2');

  // Line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Remove any remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&ndash;/g, '–');
  text = text.replace(/&mdash;/g, '—');

  return text;
}

function convertTable(tableHtml) {
  const rows = [];

  // Extract header row
  const theadMatch = tableHtml.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
  if (theadMatch) {
    const headerCells = theadMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/gi) || [];
    const headers = headerCells.map(cell => {
      const content = cell.replace(/<th[^>]*>([\s\S]*?)<\/th>/i, '$1');
      return cleanInlineHtml(content).trim();
    });
    if (headers.length > 0) {
      rows.push('| ' + headers.join(' | ') + ' |');
      rows.push('| ' + headers.map(() => '---').join(' | ') + ' |');
    }
  }

  // Extract body rows
  const tbodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  const bodyContent = tbodyMatch ? tbodyMatch[1] : tableHtml;

  const trMatches = bodyContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  for (const tr of trMatches) {
    // Skip if this is in thead
    if (theadMatch && theadMatch[0].includes(tr)) continue;

    const cells = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
    const rowData = cells.map(cell => {
      const content = cell.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/i, '$1');
      return cleanInlineHtml(content).trim().replace(/\|/g, '\\|');
    });
    if (rowData.length > 0) {
      rows.push('| ' + rowData.join(' | ') + ' |');
    }
  }

  return rows.join('\n');
}

// ============================================================================
// API Fetching
// ============================================================================

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function extractPath(input) {
  // Handle full URLs
  if (input.startsWith('http')) {
    const url = new URL(input);
    return url.pathname;
  }
  // Handle paths with or without leading slash
  return input.startsWith('/') ? input : '/' + input;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: node fetch-govuk.js <path-or-url> [output-folder]

Examples:
  node fetch-govuk.js /guidance/how-to-collect-your-packaging-data-for-extended-producer-responsibility
  node fetch-govuk.js https://www.gov.uk/guidance/extended-producer-responsibility-for-packaging-who-is-affected
  node fetch-govuk.js /guidance/some-page "Existing guidance"

The script will:
  1. Fetch content from the GOV.UK Content API
  2. Convert HTML to clean markdown (with govspeak callouts)
  3. Save to the specified folder (default: current directory)
`);
    process.exit(0);
  }

  const inputPath = extractPath(args[0]);
  const outputFolder = args[1] || '.';

  const apiUrl = `https://www.gov.uk/api/content${inputPath}`;

  console.log(`Fetching: ${apiUrl}`);

  try {
    const data = await fetchJson(apiUrl);

    if (!data.title || !data.details?.body) {
      console.error('Error: Could not find content in API response');
      console.error('Document type:', data.document_type);
      process.exit(1);
    }

    // Build markdown content
    const lines = [];

    // Title
    lines.push(`# ${data.title}`);
    lines.push('');

    // Metadata block
    lines.push('---');
    lines.push(`source: https://www.gov.uk${data.base_path}`);
    lines.push(`updated: ${data.public_updated_at?.split('T')[0] || 'unknown'}`);
    lines.push(`document_type: ${data.document_type}`);
    lines.push('---');
    lines.push('');

    // Description/standfirst if present
    if (data.description) {
      lines.push(data.description);
      lines.push('');
    }

    // Main content
    const bodyMarkdown = htmlToMarkdown(data.details.body);
    lines.push(bodyMarkdown);

    const markdown = lines.join('\n');

    // Determine output filename
    const slug = slugify(data.title);
    const filename = `${slug}.md`;
    const outputPath = path.join(outputFolder, filename);

    // Ensure output folder exists
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    fs.writeFileSync(outputPath, markdown);

    console.log(`\nSaved: ${outputPath}`);
    console.log(`Title: ${data.title}`);
    console.log(`Updated: ${data.public_updated_at?.split('T')[0] || 'unknown'}`);
    console.log(`Words: ~${markdown.split(/\s+/).length}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
