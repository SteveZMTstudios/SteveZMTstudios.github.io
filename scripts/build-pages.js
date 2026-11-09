/*
 * 从 site.yml 生成首页和旧版页。
 *
 * 用法：
 *     node scripts/build-pages.js
 *     npm run build
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

const data = yaml.load(fs.readFileSync('site.yml', 'utf8'));

// Use a content hash so unchanged builds keep the same asset URLs.
const sourceFiles = [
    'site.yml',
    '_templates/index.template.html',
    '_templates/legacy.template.html',
    'assets/css/main.css',
    'assets/js/main.js',
    'assets/js/boot.js',
    'assets/js/terminal.js',
    'scripts/build-pages.js',
].filter((file) => fs.existsSync(file));

const digest = crypto
    .createHash('sha1')
    .update(sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n'))
    .digest('hex')
    .slice(0, 8);

const version = process.env.BUILD_VERSION || [
    new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    digest,
].join('-');

function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[ch]));
}

function zh(value) {
    return value && typeof value === 'object' ? value.zh : value;
}

function en(value) {
    return value && typeof value === 'object' ? value.en : value;
}

function renderMeta() {
    const meta = data.meta;
    return `<title data-zh="${escapeHtml(meta.title.zh)}" data-en="${escapeHtml(meta.title.en)}">${escapeHtml(meta.title.zh)}</title>
    <meta name="description" content="${escapeHtml(meta.description.zh)}">
    <meta name="keywords" content="${escapeHtml(meta.keywords)}">
    <meta name="author" content="${escapeHtml(meta.author)}">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${escapeHtml(meta.ogTitle)}">
    <meta property="og:description" content="${escapeHtml(meta.ogDescription)}">
    <meta property="og:image" content="${escapeHtml(meta.ogImage)}">
    <meta property="og:url" content="${escapeHtml(meta.url)}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="${escapeHtml(meta.twitterCard)}">
    <meta name="twitter:title" content="${escapeHtml(meta.ogTitle)}">
    <meta name="twitter:description" content="${escapeHtml(meta.ogDescription)}">
    <meta name="twitter:image" content="${escapeHtml(meta.ogImage)}">
    <link rel="canonical" href="${escapeHtml(meta.url)}">
    <link rel="icon" href="${escapeHtml(meta.favicon)}" type="image/png">`;
}

function renderAnalytics() {
    const id = data.meta.analyticsId;
    if (!id) return '';
    return `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${escapeHtml(id)}');
    </script>`;
}

function renderHero() {
    const profile = data.profile;
    const hero = data.hero;
    const socials = hero.socials.map((item) => {
        const external = /^https?:/i.test(item.href);
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `                    <a href="${escapeHtml(item.href)}" class="badge-link"${attrs}>
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}">
                    </a>`;
    }).join('\n');

    return `<section class="hero">
            <div class="hero-avatar">
                <div class="avatar-inner">
                    <img src="${escapeHtml(profile.avatar)}" alt="Steve ZMT Avatar" class="avatar-default">
                    <img src="${escapeHtml(profile.avatarHover)}" alt="Steve ZMT Avatar Hover" class="avatar-hover">
                </div>
            </div>
            <div class="hero-content">
                <h1 data-i18n="welcome_title">${escapeHtml(profile.name.zh)}</h1>
                <p class="typing-container" aria-label="${escapeHtml(hero.typingLabel)}">
                    <span class="typing-text" id="typing-text" aria-hidden="true" data-typing-lines="${escapeHtml(JSON.stringify(hero.typingLines))}"></span><span class="typing-cursor" aria-hidden="true"></span>
                </p>

                <div class="social-links">
${socials}
                </div>
            </div>
        </section>`;
}

function renderSectionTitle(id, icon, key, title, extra = '') {
    return `<h2 class="section-title" id="${id}">
            <span class="material-symbols-outlined">${escapeHtml(icon)}</span>
            <span data-i18n="${key}">${escapeHtml(zh(title))}</span>${extra}
        </h2>`;
}

function renderUpdates() {
    const section = data.sections.updates;
    const cards = section.items.map((item) => `            <a href="${escapeHtml(item.href)}" class="card">
                <span class="material-symbols-outlined icon">${escapeHtml(item.icon)}</span>
                <h3 data-i18n="update_${escapeHtml(item.id)}_title">${escapeHtml(zh(item.title))}</h3>
                <p data-i18n="update_${escapeHtml(item.id)}_desc">${escapeHtml(zh(item.desc))}</p>
            </a>`).join('\n');

    return `${renderSectionTitle('recent-activity', section.icon, 'blog_title', section.title)}
        <div class="grid">
${cards}
        </div>`;
}

function renderFeatured() {
    const section = data.sections.featured;
    return `${renderSectionTitle('pinned-projects-title', section.icon, 'projects_title', section.title)}
        <div class="grid" id="featured-projects">
            <!-- Dynamic Content -->
            <div class="card loading">
                <p data-i18n="loading_text">${escapeHtml(zh(data.ui.loading))}</p>
            </div>
        </div>`;
}

function renderAllProjects() {
    const section = data.sections.allProjects;
    return `${renderSectionTitle('all-projects-title', section.icon, 'all_projects_title', section.title)}
        <div class="github-project-list" id="all-projects">
            <!-- Dynamic Content -->
        </div>`;
}

function renderSupport() {
    const section = data.sections.support;
    const cards = section.items.map((item) => {
        const external = /^https?:/i.test(item.href);
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `            <a href="${escapeHtml(item.href)}" class="card support-card"${attrs}>
                <span class="material-symbols-outlined icon">${escapeHtml(item.icon)}</span>
                <h3 data-i18n="support_${escapeHtml(item.id)}_title">${escapeHtml(zh(item.title))}</h3>
                <p data-i18n="support_${escapeHtml(item.id)}_desc">${escapeHtml(zh(item.desc))}</p>
                <span class="btn-outlined">
                    <span data-i18n="support_${escapeHtml(item.id)}_cta">${escapeHtml(zh(item.cta))}</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                </span>
            </a>`;
    }).join('\n');

    return `${renderSectionTitle('support-title', section.icon, 'support_title', section.title)}
        <div class="grid">
${cards}
        </div>`;
}

function renderAcademic() {
    const section = data.sections.academic;
    const cards = section.items.map((item, index) => `            <div class="card">
                <span class="material-symbols-outlined icon">${escapeHtml(item.icon)}</span>
                <h3 data-i18n="academic_item_${index}_title">${escapeHtml(zh(item.title))}</h3>
                <p data-i18n="academic_item_${index}_text">${escapeHtml(zh(item.text))}</p>
            </div>`).join('\n');

    return `${renderSectionTitle('academic-title', section.icon, 'academic_title', section.title)}
        <div class="grid">
${cards}
        </div>`;
}

function renderContact() {
    const section = data.sections.contact;
    const cards = section.items.map((item) => {
        if (item.kind === 'email') {
            return `            <div class="card card-clickable">
                <span class="material-symbols-outlined icon">${escapeHtml(item.icon)}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p><a href="${escapeHtml(item.href)}" class="card-main-link">${escapeHtml(item.text)}</a></p>
                <a href="${escapeHtml(item.pgp.href)}" target="_blank" rel="noopener noreferrer" class="btn-outlined">
                    <span class="material-symbols-outlined">key</span>
                    <span data-i18n="contact_${escapeHtml(item.id)}_pgp">${escapeHtml(zh(item.pgp.label))}</span>
                </a>
            </div>`;
        }

        const note = item.note
            ? `\n                <p data-i18n="contact_${escapeHtml(item.id)}_note">${escapeHtml(zh(item.note))}</p>`
            : '';

        return `            <a href="${escapeHtml(item.href)}" class="card">
                <span class="material-symbols-outlined icon">${escapeHtml(item.icon)}</span>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>${note}
            </a>`;
    }).join('\n');

    const localTime = ' <span id="local-time" style="font-size: 0.9rem; margin-left: auto; font-weight: normal; opacity: 0.8;" title="UTC+8"></span>';

    return `${renderSectionTitle('contact-title', section.icon, 'contact_title', section.title, localTime)}
        <div class="grid">
${cards}
        </div>`;
}

function renderStats() {
    const images = data.sections.stats.images.map((image) => `            <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async">`).join('\n');
    return `<div class="github-stats">
${images}
        </div>`;
}

function renderFooterLinks() {
    return data.footer.links
        .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
        .join(' | ');
}

function renderFooter() {
    return `<footer>
        <p>${renderFooterLinks()}</p>
        <p>&copy; <time id="current-year">${new Date().getFullYear()}</time> ${escapeHtml(data.footer.copyright)}. </p>
        <script>
            (function(){
            var el = document.getElementById('current-year');
            if (el) el.textContent = new Date().getFullYear();
            })();
        </script>
        <a href="https://beian.miit.gov.cn/" style="text-decoration:none;">${escapeHtml(data.footer.beian)}</a>
    </footer>`;
}

function renderTerminal() {
    const terminal = data.terminal;
    const prompt = (path) => `<span class="terminal-user">${escapeHtml(terminal.user)}</span><span class="terminal-colon">:</span><span class="terminal-path">${escapeHtml(path)}</span><span class="terminal-dollar">$</span>`;

    const intro = terminal.intro.map((item) => {
        if (item.output === 'bio') {
            return `            <div class="terminal-line">
                <span class="terminal-prompt">${prompt(terminal.path)}</span> <span data-i18n="terminal_whoami">${escapeHtml(item.command)}</span>
            </div>
            <div class="terminal-line" data-i18n="terminal_bio">${escapeHtml(zh(data.profile.bio))}</div>`;
        }

        if (item.dynamic) {
            return `            <div class="terminal-line">
                <span class="terminal-prompt">${prompt(terminal.path)}</span> <span>${escapeHtml(item.command)}</span>
            </div>
            <div class="terminal-line" id="${escapeHtml(item.dynamic)}">
                <!-- Dynamic Content -->
            </div>`;
        }

        return '';
    }).join('\n');

    return `<button class="fab fab-terminal" id="terminal-toggle" type="button" title="${escapeHtml(terminal.openLabel)}" aria-label="${escapeHtml(terminal.openLabel)}" aria-expanded="false" aria-controls="terminal-container" data-open-label="${escapeHtml(terminal.openLabel)}" data-close-label="${escapeHtml(terminal.closeLabel)}">
        <span class="material-symbols-outlined">terminal</span>
    </button>

    <section class="terminal" id="terminal-container" role="dialog" aria-label="${escapeHtml(terminal.dialogLabel)}" aria-hidden="true" data-prompt-user="${escapeHtml(terminal.user)}">
        <div class="terminal-header">
            <span class="terminal-title">${escapeHtml(terminal.title)}</span>
            <button class="terminal-dot dot red" id="terminal-dot-close" type="button" title="${escapeHtml(terminal.closeLabel)}" aria-label="${escapeHtml(terminal.closeLabel)}"></button>
        </div>
        <div id="terminal-history">
${intro}
        </div>
        <div class="terminal-line terminal-input-line">
            <span class="terminal-prompt" id="active-prompt">${prompt(terminal.path)}</span>
            <input type="text" id="terminal-input" class="terminal-input" aria-label="${escapeHtml(terminal.inputLabel)}" autocomplete="off" autocapitalize="off" spellcheck="false">
        </div>
    </section>`;
}

function renderHomeI18n() {
    const translations = {
        zh: Object.assign({}, data.i18n && data.i18n.zh),
        en: Object.assign({}, data.i18n && data.i18n.en),
    };

    function add(key, value) {
        translations.zh[key] = zh(value);
        translations.en[key] = en(value);
    }

    add('welcome_title', data.profile.name);
    add('terminal_bio', data.profile.bio);
    add('blog_title', data.sections.updates.title);
    add('projects_title', data.sections.featured.title);
    add('all_projects_title', data.sections.allProjects.title);
    add('support_title', data.sections.support.title);
    data.sections.support.items.forEach((item) => {
        add(`support_${item.id}_title`, item.title);
        add(`support_${item.id}_desc`, item.desc);
        add(`support_${item.id}_cta`, item.cta);
    });
    add('academic_title', data.sections.academic.title);
    add('contact_title', data.sections.contact.title);
    add('loading_text', data.ui.loading);

    data.sections.updates.items.forEach((item) => {
        add(`update_${item.id}_title`, item.title);
        add(`update_${item.id}_desc`, item.desc);
    });

    data.sections.academic.items.forEach((item, index) => {
        add(`academic_item_${index}_title`, item.title);
        add(`academic_item_${index}_text`, item.text);
    });

    data.sections.contact.items.forEach((item) => {
        if (item.pgp) add(`contact_${item.id}_pgp`, item.pgp.label);
        if (item.note) add(`contact_${item.id}_note`, item.note);
    });

    return 'window.HOME_I18N = ' + JSON.stringify(translations, null, 4) + ';\r\n';
}

/* ---------- Legacy page ---------- */

function renderLegacyNotice() {
    return `<div class="notice">
            <strong>注意：</strong> ${escapeHtml(data.legacy.notice)}
        </div>
        <div id="modern-support-notice" class="notice" style="display: none; background-color: #e6f4ea; border-color: #34a853; color: #137333;">
            <strong>提示：</strong> ${escapeHtml(data.legacy.modernNotice)} <a href="../index.html" style="color: #137333; text-decoration: underline;">${escapeHtml(data.legacy.modernNoticeLink)}</a>。
        </div>
        <noscript>
            <div class="notice">
                <strong>注意：</strong> ${escapeHtml(data.legacy.noscript)}
            </div>
        </noscript>`;
}

function renderLegacyProfile() {
    return `<h1>
            <img src="${escapeHtml(data.profile.avatarSmall)}" alt="Avatar" width="80" height="80" style="vertical-align: middle; border: 2px solid #006a6a; margin-right: 15px;">
            ${escapeHtml(zh(data.profile.name))}
        </h1>
        <p>${escapeHtml(zh(data.profile.bio))}</p>`;
}

function renderLegacyUpdates() {
    const cards = data.sections.updates.items.map((item) => `            <div class="card">
                <h3><a href="${escapeHtml(item.href)}">${escapeHtml(zh(item.title))}</a></h3>
                <p>${escapeHtml(zh(item.desc))}</p>
            </div>`).join('\n');

    return `<h2>${escapeHtml(data.legacy.headings.updates)}</h2>
        <div class="section">
${cards}
        </div>`;
}

function renderLegacyProjects() {
    return `<h2>${escapeHtml(data.legacy.headings.projects)}</h2>
        <div id="compat-projects" class="section">
            <p id="loading-text">${escapeHtml(data.legacy.loadingProjects)}</p>
            <noscript>
                <div class="notice">
                    <strong>注意：</strong> ${escapeHtml(data.legacy.noscriptProjects)} <a href="${escapeHtml(data.links.github)}">GitHub 页面</a>。
                </div>
            </noscript>
        </div>`;
}

function renderLegacyContact() {
    const lines = data.legacy.contact.map((item) => {
        const note = item.note ? `(${escapeHtml(item.note)})` : '';
        return `            <p><strong>${escapeHtml(item.label)}:</strong> <a href="${escapeHtml(item.href)}">${escapeHtml(item.text)}</a>${note}</p>`;
    }).join('\n');

    return `<h2>${escapeHtml(data.legacy.headings.contact)}</h2>
        <div class="section">
${lines}
        </div>`;
}

function renderLegacyFooter() {
    return `<div class="footer">
            <p><a href="../index.html">${escapeHtml(data.legacy.returnModern)}</a></p>
        <p>&copy; <time id="current-year">${new Date().getFullYear()}</time> ${escapeHtml(data.footer.copyright)}. </p>
        <script>
            (function(){
            var el = document.getElementById('current-year');
            if (el) el.textContent = new Date().getFullYear();
            })();
        </script>
            <a href="https://beian.miit.gov.cn/">${escapeHtml(data.footer.beian)}</a>
        </div>`;
}

function renderFallbackProjects() {
    const projects = data.legacy.fallbackProjects.map((project) => ({
        name: project.name,
        html_url: project.url,
        description: project.description,
        stargazers_count: project.stars,
        language: project.language,
    }));

    return JSON.stringify(projects, null, 20);
}

function addGeneratedWarning(html, templateName) {
    const warning = `<!-- GENERATED by scripts/build-pages.js. Edit _templates/${templateName} and site.yml, then run npm run build. Do not edit this file directly. -->`;
    return html.replace(/^(<!DOCTYPE[^>]*>)/, `$1\r\n${warning}`);
}

function renderTemplate(templatePath, replacements) {
    let html = fs.readFileSync(templatePath, 'utf8');
    Object.keys(replacements).forEach((key) => {
        html = html.split(key).join(replacements[key]);
    });
    if (/\{\{/.test(html)) {
        throw new Error(`Unresolved placeholder in ${templatePath}`);
    }
    return html;
}

// 1. Modern homepage
let modern = renderTemplate('_templates/index.template.html', {
    '{{meta}}': renderMeta(),
    '{{analytics}}': renderAnalytics(),
    '{{hero}}': renderHero(),
    '{{updates}}': renderUpdates(),
    '{{featured}}': renderFeatured(),
    '{{allProjects}}': renderAllProjects(),
    '{{support}}': renderSupport(),
    '{{academic}}': renderAcademic(),
    '{{contact}}': renderContact(),
    '{{stats}}': renderStats(),
    '{{footer}}': renderFooter(),
    '{{terminal}}': renderTerminal(),
    '{{ui.noscript}}': escapeHtml(data.ui.noscript).replace('{compat}', `<a href="k/index.html">${escapeHtml(data.ui.compatPage)}</a>`),
    '{{ui.scrollTop}}': escapeHtml(data.ui.scrollTop),
    '{{ui.languageToggle}}': escapeHtml(data.ui.languageToggle),
    '{{ui.themeToggle}}': escapeHtml(data.ui.themeToggle),
    '{{header.logoIcon}}': escapeHtml(data.header.logoIcon),
    '{{header.logoText}}': escapeHtml(data.header.logoText),
    '{{version}}': version,
});
modern = addGeneratedWarning(modern, 'index.template.html');
fs.writeFileSync('index.html', modern, 'utf8');

// 2. Legacy page
let legacy = renderTemplate('_templates/legacy.template.html', {
    '{{legacyTitle}}': escapeHtml(data.legacy.title),
    '{{legacyNotice}}': renderLegacyNotice(),
    '{{legacyProfile}}': renderLegacyProfile(),
    '{{legacyUpdates}}': renderLegacyUpdates(),
    '{{legacyProjects}}': renderLegacyProjects(),
    '{{legacyContact}}': renderLegacyContact(),
    '{{legacyFooter}}': renderLegacyFooter(),
    '{{fallbackProjects}}': renderFallbackProjects(),
    '{{version}}': version,
});
legacy = addGeneratedWarning(legacy, 'legacy.template.html');
fs.writeFileSync('k/index.html', legacy, 'utf8');


// 4. Homepage i18n
fs.writeFileSync('assets/js/home-i18n.js', renderHomeI18n(), 'utf8');

// 5. Bump local asset versions in every HTML page so the browser picks up the new build.
function walk(dir, files = []) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '_templates' || entry.name === '_site' || entry.name === '.jekyll-cache') return;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full, files);
        } else if (entry.name.endsWith('.html')) {
            files.push(full);
        }
    });
    return files;
}

let bumped = 0;
walk('.').forEach((file) => {
    const before = fs.readFileSync(file, 'utf8');
    const after = before.replace(
        /((?:\.\.\/)?assets\/[^"'?]+)\?v=[^"']+/g,
        `$1?v=${version}`
    );
    if (after !== before) {
        fs.writeFileSync(file, after, 'utf8');
        bumped++;
    }
});

console.log(`Generated index.html, k/index.html, assets/js/home-i18n.js (version ${version})`);
console.log(`Asset version updated in ${bumped} HTML file(s).`);
