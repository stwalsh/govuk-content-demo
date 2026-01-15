#!/usr/bin/env node

/**
 * Fetch GOV.UK content via the Content API and convert to markdown
 *
 * Supports both Whitehall (detailed_guide) and Mainstream Publisher (guide) formats.
 *
 * Usage:
 *   node fetch-govuk.js /guidance/page-slug
 *   node fetch-govuk.js /guidance/page-slug output-folder
 *   node fetch-govuk.js https://www.gov.uk/guidance/page-slug
 *   node fetch-govuk.js /universal-credit --split    # Multi-part: one file per part
 *
 * Examples:
 *   node fetch-govuk.js /guidance/how-to-collect-your-packaging-data-for-extended-producer-responsibility
 *   node fetch-govuk.js /universal-credit "Benefits guidance"
 *   node fetch-govuk.js /universal-credit "Benefits guidance" --split
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
// Output Generators
// ============================================================================

function buildMetadataBlock(data, extraFields = {}) {
  const lines = [
    '---',
    `source: https://www.gov.uk${data.base_path}`,
    `updated: ${data.public_updated_at?.split('T')[0] || 'unknown'}`,
    `document_type: ${data.document_type}`,
  ];
  for (const [key, value] of Object.entries(extraFields)) {
    lines.push(`${key}: ${value}`);
  }
  lines.push('---');
  return lines.join('\n');
}

// Generate markdown for single-body content (Whitehall detailed_guide)
function generateSingleBodyMarkdown(data) {
  const lines = [];

  lines.push(`# ${data.title}`);
  lines.push('');
  lines.push(buildMetadataBlock(data));
  lines.push('');

  if (data.description) {
    lines.push(data.description);
    lines.push('');
  }

  const bodyMarkdown = htmlToMarkdown(data.details.body);
  lines.push(bodyMarkdown);

  return lines.join('\n');
}

// Generate markdown for multi-part content (Mainstream Publisher guide)
function generateMultiPartMarkdown(data, options = {}) {
  const parts = data.details.parts || [];

  if (options.split) {
    // Return array of { filename, content } for separate files
    return parts.map((part, index) => {
      const lines = [];

      lines.push(`# ${part.title}`);
      lines.push('');
      lines.push(buildMetadataBlock(data, {
        part: `${index + 1} of ${parts.length}`,
        slug: part.slug,
        parent: data.title
      }));
      lines.push('');

      const bodyMarkdown = htmlToMarkdown(part.body);
      lines.push(bodyMarkdown);

      return {
        filename: `${slugify(data.title)}-${String(index + 1).padStart(2, '0')}-${part.slug}.md`,
        content: lines.join('\n'),
        title: part.title
      };
    });
  } else {
    // Combined single file
    const lines = [];

    lines.push(`# ${data.title}`);
    lines.push('');
    lines.push(buildMetadataBlock(data, { parts: parts.length }));
    lines.push('');

    if (data.description) {
      lines.push(data.description);
      lines.push('');
    }

    // Table of contents
    lines.push('## Contents');
    lines.push('');
    parts.forEach((part, i) => {
      lines.push(`${i + 1}. [${part.title}](#${part.slug})`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');

    // Each part as a section
    parts.forEach((part, i) => {
      lines.push(`## ${part.title}`);
      lines.push('');
      const bodyMarkdown = htmlToMarkdown(part.body);
      lines.push(bodyMarkdown);
      lines.push('');
      if (i < parts.length - 1) {
        lines.push('---');
        lines.push('');
      }
    });

    return lines.join('\n');
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const flags = args.filter(a => a.startsWith('--'));
  const positional = args.filter(a => !a.startsWith('--'));

  const splitMode = flags.includes('--split');

  if (positional.length === 0) {
    console.log(`
Usage: node fetch-govuk.js <path-or-url> [output-folder] [--split]

Options:
  --split    For multi-part guides: create one file per part (default: combined)

Examples:
  node fetch-govuk.js /guidance/how-to-collect-your-packaging-data-for-extended-producer-responsibility
  node fetch-govuk.js https://www.gov.uk/guidance/extended-producer-responsibility-for-packaging-who-is-affected
  node fetch-govuk.js /guidance/some-page "Existing guidance"
  node fetch-govuk.js /universal-credit "Benefits guidance"          # Combined file
  node fetch-govuk.js /universal-credit "Benefits guidance" --split  # Separate files

Supports:
  - Whitehall content (detailed_guide) - single body
  - Mainstream Publisher (guide) - multi-part
`);
    process.exit(0);
  }

  const inputPath = extractPath(positional[0]);
  const outputFolder = positional[1] || '.';

  const apiUrl = `https://www.gov.uk/api/content${inputPath}`;

  console.log(`Fetching: ${apiUrl}`);

  try {
    const data = await fetchJson(apiUrl);

    if (!data.title) {
      console.error('Error: Could not find title in API response');
      process.exit(1);
    }

    // Ensure output folder exists
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    const isMultiPart = Array.isArray(data.details?.parts) && data.details.parts.length > 0;

    console.log(`Document type: ${data.document_type}${isMultiPart ? ` (${data.details.parts.length} parts)` : ''}`);

    if (isMultiPart) {
      // Multi-part guide (Mainstream Publisher)
      const result = generateMultiPartMarkdown(data, { split: splitMode });

      if (splitMode) {
        // Multiple files
        result.forEach(file => {
          const outputPath = path.join(outputFolder, file.filename);
          fs.writeFileSync(outputPath, file.content);
          console.log(`  Saved: ${file.filename} - ${file.title}`);
        });
        console.log(`\nCreated ${result.length} files in ${outputFolder}`);
      } else {
        // Single combined file
        const slug = slugify(data.title);
        const filename = `${slug}.md`;
        const outputPath = path.join(outputFolder, filename);
        fs.writeFileSync(outputPath, result);
        console.log(`\nSaved: ${outputPath}`);
        console.log(`Parts: ${data.details.parts.length}`);
        console.log(`Words: ~${result.split(/\s+/).length}`);
      }
    } else if (data.details?.body) {
      // Single-body content (Whitehall)
      const markdown = generateSingleBodyMarkdown(data);
      const slug = slugify(data.title);
      const filename = `${slug}.md`;
      const outputPath = path.join(outputFolder, filename);
      fs.writeFileSync(outputPath, markdown);

      console.log(`\nSaved: ${outputPath}`);
      console.log(`Words: ~${markdown.split(/\s+/).length}`);
    } else {
      console.error('Error: Unrecognised content structure');
      console.error('Expected details.body or details.parts[]');
      process.exit(1);
    }

    console.log(`Title: ${data.title}`);
    console.log(`Updated: ${data.public_updated_at?.split('T')[0] || 'unknown'}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
