#!/usr/bin/env node

/**
 * fetch-legislation.js
 *
 * Fetches UK legislation from legislation.gov.uk and converts it to markdown.
 *
 * Usage:
 *   node fetch-legislation.js uksi/2024/1332
 *   node fetch-legislation.js ukpga/2021/30
 *   node fetch-legislation.js --help
 *
 * Output:
 *   Creates a directory structure under legislation/ with:
 *   - README.md (overview)
 *   - part-XX-title.md (one file per Part)
 *   - schedule-XX-title.md (one file per Schedule)
 */

const fs = require('fs');
const path = require('path');

// Simple XML parser - extracts structure without external dependencies
class LegislationParser {
  constructor(xml) {
    this.xml = xml;
    this.ns = 'http://www.legislation.gov.uk/namespaces/legislation';
  }

  // Extract metadata
  getMetadata() {
    const title = this.extractText(/<dc:title>([^<]+)<\/dc:title>/);
    const number = this.extractText(/<ukm:Number Value="(\d+)"\/>/);
    const year = this.extractText(/<ukm:Year Value="(\d+)"\/>/);
    const subject = this.extractText(/<dc:subject[^>]*>([^<]+)<\/dc:subject>/);
    const description = this.extractText(/<dc:description>([^<]+)<\/dc:description>/);

    return { title, number, year, subject, description };
  }

  extractText(regex) {
    const match = this.xml.match(regex);
    return match ? match[1] : null;
  }

  // Get all Parts
  getParts() {
    const parts = [];
    const partRegex = /<Part[^>]*id="(part-\d+)"[^>]*>([\s\S]*?)<\/Part>/g;
    let match;

    while ((match = partRegex.exec(this.xml)) !== null) {
      const partXml = match[2];
      const id = match[1];
      const number = this.extractFromBlock(partXml, /<Number>([^<]+)<\/Number>/);
      const title = this.extractFromBlock(partXml, /<Title[^>]*>([^<]+)<\/Title>/);

      parts.push({
        id,
        number,
        title,
        content: partXml
      });
    }

    return parts;
  }

  // Get all Schedules
  getSchedules() {
    const schedules = [];
    const schedRegex = /<Schedule[^>]*id="(schedule-\d+)"[^>]*>([\s\S]*?)<\/Schedule>/g;
    let match;

    while ((match = schedRegex.exec(this.xml)) !== null) {
      const schedXml = match[2];
      const id = match[1];
      const number = this.extractFromBlock(schedXml, /<Number>([^<]+)<\/Number>/);
      const title = this.extractFromBlock(schedXml, /<Title[^>]*>([^<]+)<\/Title>/);

      // Only include schedules that have content
      if (schedXml.includes('<P1') || schedXml.includes('<P1group') || schedXml.includes('<Tabular')) {
        schedules.push({
          id,
          number,
          title,
          content: schedXml
        });
      }
    }

    return schedules;
  }

  extractFromBlock(block, regex) {
    const match = block.match(regex);
    return match ? match[1] : null;
  }
}

// Converts legislation XML block to markdown
class MarkdownConverter {
  constructor() {
    this.currentRegNum = null;
  }

  convertPart(part) {
    let md = `## ${part.number} - ${part.title}\n\n`;
    md += this.convertContent(part.content);
    return md;
  }

  convertSchedule(schedule) {
    let md = `## ${schedule.number} - ${schedule.title}\n\n`;
    md += this.convertContent(schedule.content);
    return md;
  }

  convertContent(xml) {
    let md = '';

    // Process P1groups (grouped provisions with titles)
    const p1groups = this.extractP1Groups(xml);
    for (const group of p1groups) {
      md += this.convertP1Group(group);
    }

    // If no P1groups, process standalone P1s
    if (p1groups.length === 0) {
      const p1s = this.extractP1s(xml);
      for (const p1 of p1s) {
        md += this.convertP1(p1);
      }
    }

    // Process tables
    const tables = this.extractTables(xml);
    for (const table of tables) {
      md += this.convertTable(table);
    }

    return md;
  }

  extractP1Groups(xml) {
    const groups = [];
    const regex = /<P1group[^>]*>([\s\S]*?)<\/P1group>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      const groupXml = match[1];
      const title = this.extractText(groupXml, /<Title>([^<]+)<\/Title>/);
      groups.push({ title, content: groupXml });
    }

    return groups;
  }

  extractP1s(xml) {
    const p1s = [];
    const regex = /<P1[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/P1>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      p1s.push({ id: match[1], content: match[2] });
    }

    return p1s;
  }

  extractTables(xml) {
    const tables = [];
    const regex = /<Tabular[^>]*>([\s\S]*?)<\/Tabular>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      tables.push(match[1]);
    }

    return tables;
  }

  convertP1Group(group) {
    let md = '';
    if (group.title) {
      md += `### ${group.title}\n\n`;
    }

    const p1s = this.extractP1s(group.content);
    for (const p1 of p1s) {
      md += this.convertP1(p1);
    }

    return md;
  }

  convertP1(p1) {
    // Extract Pnumber - handle nested CommentaryRef tags
    const pnumberMatch = p1.content.match(/<Pnumber[^>]*>([\s\S]*?)<\/Pnumber>/);
    let pnumber = '?';
    if (pnumberMatch) {
      // Strip out CommentaryRef and other inline tags, keep just the number
      pnumber = pnumberMatch[1].replace(/<[^>]+>/g, '').trim() || '?';
    }

    let md = `**${pnumber}.**\n\n`;

    // Extract P2s (sub-paragraphs)
    const p2s = this.extractP2s(p1.content);

    if (p2s.length > 0) {
      for (const p2 of p2s) {
        md += this.convertP2(p2);
      }
    } else {
      // Direct text in P1
      const text = this.extractAllText(p1.content);
      if (text) {
        md += text + '\n\n';
      }
    }

    return md;
  }

  extractP2s(xml) {
    const p2s = [];
    const regex = /<P2[^>]*>([\s\S]*?)<\/P2>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      p2s.push(match[1]);
    }

    return p2s;
  }

  convertP2(p2Xml) {
    // Extract Pnumber - handle nested tags
    const pnumberMatch = p2Xml.match(/<Pnumber[^>]*>([\s\S]*?)<\/Pnumber>/);
    let pnumber = null;
    if (pnumberMatch) {
      pnumber = pnumberMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    let md = '';

    if (pnumber) {
      md += `(${pnumber}) `;
    }

    // Get direct text (first Text element before any P3s)
    const firstTextMatch = p2Xml.match(/<P2para>\s*<Text>([^<]*(?:<(?!\/Text>)[^<]*)*)<\/Text>/);
    if (firstTextMatch) {
      md += this.cleanText(firstTextMatch[1]) + '\n\n';
    }

    // Process P3s (sub-sub-paragraphs)
    const p3s = this.extractP3s(p2Xml);
    for (const p3 of p3s) {
      md += this.convertP3(p3);
    }

    if (p3s.length > 0) {
      md += '\n';
    }

    // Process lists (but avoid if we already have P3s with the content)
    if (p3s.length === 0) {
      md += this.convertLists(p2Xml);
    }

    return md;
  }

  extractP3s(xml) {
    const p3s = [];
    const regex = /<P3[^>]*>([\s\S]*?)<\/P3>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      p3s.push(match[1]);
    }

    return p3s;
  }

  convertP3(p3Xml) {
    // Extract Pnumber - handle nested tags, letters or roman numerals
    const pnumberMatch = p3Xml.match(/<Pnumber[^>]*>([\s\S]*?)<\/Pnumber>/);
    let pnumber = null;
    if (pnumberMatch) {
      pnumber = pnumberMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    const text = this.extractAllText(p3Xml);

    if (pnumber && text) {
      return `  (${pnumber}) ${text}\n`;
    } else if (text) {
      return `  - ${text}\n`;
    }
    return '';
  }

  convertLists(xml) {
    let md = '';

    // Unordered lists (definitions)
    const ulRegex = /<UnorderedList[^>]*>([\s\S]*?)<\/UnorderedList>/g;
    let match;

    while ((match = ulRegex.exec(xml)) !== null) {
      const items = this.extractListItems(match[1]);
      for (const item of items) {
        const text = this.cleanText(item);
        if (text) {
          md += `- ${text}\n`;
        }
      }
      md += '\n';
    }

    // Ordered lists
    const olRegex = /<OrderedList[^>]*>([\s\S]*?)<\/OrderedList>/g;
    while ((match = olRegex.exec(xml)) !== null) {
      const items = this.extractListItems(match[1]);
      let i = 1;
      for (const item of items) {
        const text = this.cleanText(item);
        if (text) {
          md += `${i}. ${text}\n`;
          i++;
        }
      }
      md += '\n';
    }

    return md;
  }

  extractListItems(listXml) {
    const items = [];
    const regex = /<ListItem[^>]*>([\s\S]*?)<\/ListItem>/g;
    let match;

    while ((match = regex.exec(listXml)) !== null) {
      items.push(match[1]);
    }

    return items;
  }

  convertTable(tableXml) {
    const number = this.extractText(tableXml, /<Number>([^<]+)<\/Number>/);
    const title = this.extractText(tableXml, /<Title>([^<]+)<\/Title>/);

    let md = '';
    if (number || title) {
      md += `#### ${number || 'Table'}: ${title || ''}\n\n`;
    }

    // Extract headers
    const headerMatch = tableXml.match(/<thead>([\s\S]*?)<\/thead>/);
    const headers = [];
    if (headerMatch) {
      const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/g;
      let match;
      while ((match = thRegex.exec(headerMatch[1])) !== null) {
        headers.push(this.cleanText(match[1]));
      }
    }

    if (headers.length > 0) {
      md += '| ' + headers.join(' | ') + ' |\n';
      md += '|' + headers.map(() => '---').join('|') + '|\n';
    }

    // Extract body rows
    const bodyMatch = tableXml.match(/<tbody>([\s\S]*?)<\/tbody>/);
    if (bodyMatch) {
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
      let rowMatch;
      while ((rowMatch = rowRegex.exec(bodyMatch[1])) !== null) {
        const cells = [];
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
        let tdMatch;
        while ((tdMatch = tdRegex.exec(rowMatch[1])) !== null) {
          cells.push(this.cleanText(tdMatch[1]));
        }
        if (cells.length > 0) {
          md += '| ' + cells.join(' | ') + ' |\n';
        }
      }
    }

    md += '\n';
    return md;
  }

  extractText(xml, regex) {
    const match = xml.match(regex);
    return match ? match[1] : null;
  }

  extractDirectTexts(xml) {
    const texts = [];
    // Match Text elements that are direct children (not in nested P3s)
    const regex = /<Text>([^<]+)<\/Text>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      texts.push(this.cleanText(match[1]));
    }

    return texts;
  }

  extractAllText(xml) {
    // Get all text content, cleaning XML tags
    const texts = [];
    const regex = /<Text>([^<]*(?:<[^>]+>[^<]*)*)<\/Text>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      texts.push(this.cleanText(match[1]));
    }

    return texts.join(' ');
  }

  cleanText(text) {
    if (!text) return '';

    return text
      // Remove XML tags but keep their content
      .replace(/<Term[^>]*>([^<]+)<\/Term>/g, '"$1"')
      .replace(/<InternalLink[^>]*>([^<]+)<\/InternalLink>/g, '$1')
      .replace(/<leg:InternalLink[^>]*>([^<]+)<\/leg:InternalLink>/g, '$1')
      .replace(/<FootnoteRef[^>]*\/>/g, '')
      .replace(/<CommentaryRef[^>]*\/>/g, '')
      .replace(/<[^>]+>/g, '')
      // Clean up entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Clean whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Main function
async function fetchLegislation(identifier) {
  const url = `https://www.legislation.gov.uk/${identifier}/data.xml`;

  console.log(`Fetching ${url}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  console.log(`Received ${(xml.length / 1024).toFixed(1)}KB of XML`);

  const parser = new LegislationParser(xml);
  const converter = new MarkdownConverter();

  const metadata = parser.getMetadata();
  const parts = parser.getParts();
  const schedules = parser.getSchedules();

  console.log(`Found ${parts.length} parts and ${schedules.length} schedules with content`);

  // Create output directory
  const dirName = identifier.replace(/\//g, '-');
  const outDir = path.join('legislation', dirName);
  fs.mkdirSync(outDir, { recursive: true });

  // Generate README
  let readme = `# ${metadata.title || 'Untitled'}\n\n`;
  readme += `**${identifier.toUpperCase().replace('/', ' ')}**\n\n`;

  if (metadata.description) {
    readme += `${metadata.description}\n\n`;
  }

  if (parts.length > 0) {
    readme += `## Parts\n\n`;
    readme += `| File | Part | Title |\n`;
    readme += `|------|------|-------|\n`;

    for (const part of parts) {
      const numMatch = part.number.match(/\d+/);
      const num = numMatch ? numMatch[0].padStart(2, '0') : '00';
      const slug = part.title ? slugify(part.title) : 'untitled';
      const filename = `part-${num}-${slug}.md`;
      readme += `| [${filename}](${filename}) | ${part.number} | ${part.title || ''} |\n`;
    }
    readme += '\n';
  }

  if (schedules.length > 0) {
    readme += `## Schedules\n\n`;
    readme += `| File | Schedule | Title |\n`;
    readme += `|------|----------|-------|\n`;

    for (const sched of schedules) {
      const numMatch = sched.number ? sched.number.match(/\d+/) : null;
      const num = numMatch ? numMatch[0].padStart(2, '0') : '00';
      const slug = sched.title ? slugify(sched.title) : 'untitled';
      const filename = `schedule-${num}-${slug}.md`;
      readme += `| [${filename}](${filename}) | ${sched.number || ''} | ${sched.title || ''} |\n`;
    }
    readme += '\n';
  }

  readme += `---\n\n`;
  readme += `*Generated from legislation.gov.uk on ${new Date().toISOString().split('T')[0]}*\n`;

  fs.writeFileSync(path.join(outDir, 'README.md'), readme);
  console.log(`Written README.md`);

  // Generate Part files
  for (const part of parts) {
    const numMatch = part.number.match(/\d+/);
    const num = numMatch ? numMatch[0].padStart(2, '0') : '00';
    const slug = part.title ? slugify(part.title) : 'untitled';
    const filename = `part-${num}-${slug}.md`;

    const md = converter.convertPart(part);
    fs.writeFileSync(path.join(outDir, filename), md);
    console.log(`Written ${filename}`);
  }

  // Generate Schedule files
  for (const sched of schedules) {
    const numMatch = sched.number ? sched.number.match(/\d+/) : null;
    const num = numMatch ? numMatch[0].padStart(2, '0') : '00';
    const slug = sched.title ? slugify(sched.title) : 'untitled';
    const filename = `schedule-${num}-${slug}.md`;

    const md = converter.convertSchedule(sched);
    fs.writeFileSync(path.join(outDir, filename), md);
    console.log(`Written ${filename}`);
  }

  console.log(`\nDone! Output written to ${outDir}/`);
  return outDir;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}

function printHelp() {
  console.log(`
fetch-legislation.js - Fetch UK legislation and convert to markdown

Usage:
  node fetch-legislation.js <identifier>

Examples:
  node fetch-legislation.js uksi/2024/1332    # UK Statutory Instrument
  node fetch-legislation.js ukpga/2021/30     # UK Public General Act
  node fetch-legislation.js uksi/2023/1234    # Another SI

The identifier follows the legislation.gov.uk URL pattern:
  uksi  = UK Statutory Instrument
  ukpga = UK Public General Act
  ukla  = UK Local Act
  etc.

Output:
  Creates legislation/<identifier>/ directory with:
  - README.md (overview with links)
  - part-XX-title.md (one per Part)
  - schedule-XX-title.md (one per Schedule)
`);
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printHelp();
  process.exit(0);
}

fetchLegislation(args[0])
  .then(outDir => {
    console.log(`\nSuccess! Review the output in ${outDir}/`);
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
