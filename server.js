const express = require('express');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Configure marked for GOV.UK-style output
marked.use({
  renderer: {
    // Add IDs to headings for contents list linking
    heading(text, level) {
      const id = text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      return `<h${level} id="${id}">${text}</h${level}>\n`;
    },
    // Style lists properly
    list(body, ordered) {
      const tag = ordered ? 'ol' : 'ul';
      const cls = ordered ? 'govuk-list govuk-list--number' : 'govuk-list govuk-list--bullet';
      return `<${tag} class="${cls}">\n${body}</${tag}>\n`;
    },
    // Style links
    link(href, title, text) {
      const external = href.startsWith('http') && !href.includes('gov.uk');
      const rel = external ? ' rel="external"' : '';
      return `<a href="${href}" class="govuk-link"${rel}>${text}</a>`;
    },
    // Style paragraphs
    paragraph(text) {
      // Check for Govspeak callout patterns
      if (text.startsWith('^') && text.endsWith('^')) {
        // Information callout
        const content = text.slice(1, -1).trim();
        return `<div role="note" aria-label="Information" class="application-notice info-notice"><p>${content}</p></div>\n`;
      }
      if (text.startsWith('%') && text.endsWith('%')) {
        // Warning callout
        const content = text.slice(1, -1).trim();
        return `<div role="note" aria-label="Warning" class="application-notice help-notice"><p>${content}</p></div>\n`;
      }
      return `<p>${text}</p>\n`;
    }
  }
});

// Extract metadata and content from markdown
function parseMarkdown(content) {
  const lines = content.split('\n');
  let title = 'Untitled';
  let leadParagraph = '';
  let body = content;

  // Extract title from first h1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    title = h1Match[1];
    // Remove the h1 from body
    body = content.replace(/^#\s+.+$/m, '').trim();
  }

  // Extract lead paragraph (first paragraph after title)
  const firstParaMatch = body.match(/^([^#\n][^\n]+)/);
  if (firstParaMatch) {
    leadParagraph = firstParaMatch[1].trim();
    body = body.replace(firstParaMatch[0], '').trim();
  }

  return { title, leadParagraph, body };
}

// Generate table of contents from markdown headings
function generateContents(markdown) {
  const headings = [];
  const regex = /^##\s+(.+)$/gm;
  let match;
  let index = 1;

  while ((match = regex.exec(markdown)) !== null) {
    const text = match[1];
    const id = text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    headings.push({ text, id, index: index++ });
  }

  return headings;
}

// Detailed guide template (Whitehall Publisher style)
function template(title, leadParagraph, contents, bodyHtml, filename) {
  const contentsHtml = contents.length > 0 ? `
    <nav data-module="ga4-link-tracker" aria-label="Contents" class="gem-c-contents-list govuk-!-margin-bottom-4">
      <h2 class="gem-c-contents-list__title">Contents</h2>
      <ol class="gem-c-contents-list__list">
        ${contents.map(h => `
          <li class="gem-c-contents-list__list-item gem-c-contents-list__list-item--dashed">
            <span class="gem-c-contents-list__list-item-dash" aria-hidden="true"></span>
            <a class="gem-c-contents-list__link govuk-link govuk-link--no-underline" href="#${h.id}">${h.text}</a>
          </li>
        `).join('')}
      </ol>
    </nav>` : '';

  return `<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title} - GOV.UK</title>
  <link rel="stylesheet" href="/assets/govuk-frontend.css">
  <style>
    /* Local overrides for preview */
    .gem-c-heading__context {
      display: block;
      color: #505a5f;
      font-size: 1.125rem;
      font-weight: 400;
      margin-bottom: 5px;
    }
    .gem-c-lead-paragraph {
      font-size: 1.25rem;
      line-height: 1.4;
      margin-bottom: 30px;
      color: #0b0c0c;
    }
    @media (min-width: 40.0625em) {
      .gem-c-lead-paragraph { font-size: 1.5rem; }
    }
    .gem-c-metadata { margin-bottom: 30px; }
    .gem-c-metadata__list { margin: 0; padding: 0; }
    .gem-c-metadata__term {
      display: inline;
      font-weight: 400;
      color: #505a5f;
    }
    .gem-c-metadata__definition {
      display: inline;
      margin-left: 0;
    }
    .gem-c-metadata__definition::after {
      content: "";
      display: block;
      margin-bottom: 10px;
    }
    .application-notice {
      padding: 15px;
      margin: 20px 0;
      border-left: 10px solid #1d70b8;
      background: #f3f2f1;
    }
    .application-notice.info-notice {
      border-color: #1d70b8;
    }
    .application-notice.help-notice {
      border-color: #d4351c;
    }
    .application-notice p {
      margin: 0;
    }
    .govspeak h2 {
      font-size: 1.5rem;
      margin-top: 40px;
      margin-bottom: 20px;
      font-weight: 700;
    }
    @media (min-width: 40.0625em) {
      .govspeak h2 { font-size: 1.875rem; }
    }
    .govspeak h3 {
      font-size: 1.25rem;
      margin-top: 30px;
      margin-bottom: 15px;
      font-weight: 700;
    }
    @media (min-width: 40.0625em) {
      .govspeak h3 { font-size: 1.5rem; }
    }
    .govspeak h4 {
      font-size: 1.125rem;
      margin-top: 25px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .govspeak p { margin-bottom: 20px; }
    .preview-banner {
      background: #1d70b8;
      color: white;
      padding: 10px 15px;
      font-size: 0.875rem;
    }
    .preview-banner a { color: white; }
  </style>
</head>
<body class="govuk-template__body">
  <script>document.body.className += ' js-enabled';</script>

  <div class="preview-banner">
    Draft preview: <strong>${filename}</strong> | <a href="/">Back to drafts</a>
  </div>

  <a href="#main-content" class="govuk-skip-link">Skip to main content</a>

  <header class="govuk-header" role="banner" data-module="govuk-header">
    <div class="govuk-header__container govuk-width-container">
      <div class="govuk-header__logo">
        <a href="/" class="govuk-header__link govuk-header__link--homepage">
          <span class="govuk-header__logotype">
            <span class="govuk-header__logotype-text">GOV.UK</span>
          </span>
        </a>
      </div>
    </div>
  </header>

  <div class="govuk-width-container">
    <main class="govuk-main-wrapper" id="main-content" role="main">

      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          <div class="gem-c-heading govuk-!-margin-bottom-4">
            <span class="govuk-caption-xl gem-c-heading__context">Guidance</span>
            <h1 class="govuk-heading-l">${title}</h1>
          </div>
        </div>
      </div>

      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          ${leadParagraph ? `<p class="gem-c-lead-paragraph">${leadParagraph}</p>` : ''}
        </div>
      </div>

      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          <div class="gem-c-metadata">
            <dl class="gem-c-metadata__list">
              <dt class="gem-c-metadata__term">From:</dt>
              <dd class="gem-c-metadata__definition">
                <a href="#" class="govuk-link">Department for Environment, Food & Rural Affairs</a>
              </dd>
              <dt class="gem-c-metadata__term">Status:</dt>
              <dd class="gem-c-metadata__definition">Draft preview</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          ${contentsHtml}

          <div class="gem-c-govspeak govuk-govspeak">
            <div class="govspeak">
              ${bodyHtml}
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>

  <footer class="govuk-footer" role="contentinfo">
    <div class="govuk-width-container">
      <div class="govuk-footer__meta">
        <div class="govuk-footer__meta-item">
          <span class="govuk-footer__licence-description">
            Draft preview - not live GOV.UK content
          </span>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// Index page - list all markdown files in drafts/
app.get('/', (req, res) => {
  const draftsDir = path.join(__dirname, 'drafts');

  let files = [];
  if (fs.existsSync(draftsDir)) {
    files = fs.readdirSync(draftsDir).filter(f => f.endsWith('.md'));
  }

  let content = `
    <div class="govuk-grid-row">
      <div class="govuk-grid-column-two-thirds">
        <h1 class="govuk-heading-xl">Draft guidance</h1>
  `;

  if (files.length === 0) {
    content += '<p class="govuk-body">No markdown files found in drafts/ directory.</p>';
  } else {
    content += '<ul class="govuk-list govuk-list--spaced">';
    files.forEach(file => {
      // Try to extract title from file
      const filepath = path.join(draftsDir, file);
      const markdown = fs.readFileSync(filepath, 'utf-8');
      const h1Match = markdown.match(/^#\s+(.+)$/m);
      const title = h1Match ? h1Match[1] : file.replace('.md', '').replace(/-/g, ' ');

      content += `<li>
        <a href="/drafts/${encodeURIComponent(file)}" class="govuk-link govuk-!-font-weight-bold">${title}</a>
        <br><span class="govuk-body-s govuk-!-font-weight-regular" style="color: #505a5f">${file}</span>
      </li>`;
    });
    content += '</ul>';
  }

  content += '</div></div>';

  const html = `<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Draft guidance - GOV.UK</title>
  <link rel="stylesheet" href="/assets/govuk-frontend.css">
</head>
<body class="govuk-template__body">
  <script>document.body.className += ' js-enabled';</script>
  <header class="govuk-header" role="banner">
    <div class="govuk-header__container govuk-width-container">
      <div class="govuk-header__logo">
        <span class="govuk-header__logotype">
          <span class="govuk-header__logotype-text">GOV.UK</span>
        </span>
      </div>
      <div class="govuk-header__content">
        <span class="govuk-header__service-name">Guidance Preview</span>
      </div>
    </div>
  </header>
  <div class="govuk-width-container">
    <main class="govuk-main-wrapper" id="main-content" role="main">
      ${content}
    </main>
  </div>
  <footer class="govuk-footer" role="contentinfo">
    <div class="govuk-width-container">
      <div class="govuk-footer__meta">
        <div class="govuk-footer__meta-item">
          <span class="govuk-footer__licence-description">Draft preview server</span>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;

  res.send(html);
});

// Render individual draft
app.get('/drafts/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'drafts', filename);

  if (!fs.existsSync(filepath)) {
    res.status(404).send('<h1>Page not found</h1>');
    return;
  }

  const markdown = fs.readFileSync(filepath, 'utf-8');
  const { title, leadParagraph, body } = parseMarkdown(markdown);
  const contents = generateContents(markdown);
  const bodyHtml = marked(body);

  res.send(template(title, leadParagraph, contents, bodyHtml, filename));
});

app.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
  console.log('Serving drafts with Whitehall Publisher styling');
});
