console.clear();
// Initialize Snow
document.addEventListener('DOMContentLoaded', function() {
    if (window.snow) {
        snow.start({
            flakeCount: 300,          // 小雪时雪花数量较少
            maxRadius: 5,           // 雪花较小
            wind: -1,                 // 微风，轻微向左
            color: '#f0f8ff',         // 更接近真实雪花的淡蓝色
            minSpeed: 0.8,            // 下降速度较慢
            maxSpeed: 2.5,            // 最大速度也较慢
            minOpacity: 0.2,         // 雪花更透明
            stickingRatio: 0.3,       // 小雪堆积能力较弱
            maxHeightRatio: 0.15,     // 只在屏幕底部15%区域堆积
            monthDayRange: "12/15-02/05"
        });
    }
});

// i18n Data
const translations = {
    'zh-CN': {
        welcome_title: '史蒂夫ZMT工作室',
        terminal_whoami: 'whoami',
        terminal_bio: 'Steve ZMT. 熟悉 Android Web 和开源的业余乐子人，最近在研究 Kotlin Python 和 Rust。',
        blog_title: '我的动态',
        blog_main: '老史尬侃 博客',
        blog_desc: '这家伙叽里咕噜说什么呢。',
        phigros_hist_title: 'Phigros 历史版本收集',
        phigros_hist_desc: '可能是最全的 Phigros 旧版本收集',
        cacert_sync_title: 'CA 证书同步',
        cacert_sync_desc: '收集根证书颁发机构的CA证书，用于更新部分旧式浏览器和系统内置证书库。',
        sharepoint: '共享节点',
        sharepoint_desc: '访问我的资源共享空间。',
        projects_title: '精选项目',
        all_projects_title: '更多项目',
        academic_title: '学术与演讲',
        recent_speeches: '近期演讲',
        academic_papers: '学术论文',
        contact_title: '与我联系',
        beian: '浙ICP备2025213066号-1',
        contact_note: '普通短信和拨号可能导致收取高昂的费用。',
        pgp_keys: 'PGP 公钥',
        sudo_lecture: '我们信任您已经从系统管理员那里了解了日常注意事项。<br>总结起来无外乎这三点：<br><br>    #1) 尊重他人的隐私。<br>    #2) 输入前要选考虑(后果和风险)。<br>    #3) 权力越大，责任越大。',
        su_fail: "sudo: 我敢说企鹅都比你打得好。<br>此事件将被报告（给你妈）。",
        status_busy: "忙碌，暂时无法响应",
        toast_resting: "我可能正在休息！再次点击前往。",
        toast_busy: "我现在正忙！再次点击前往。",
        time_early_morning: "凌晨",
        time_morning: "早上",
        time_late_morning: "上午",
        time_noon: "中午",
        time_afternoon: "下午",
        time_evening: "傍晚",
        time_night: "晚上",
        time_late_night: "深夜"
    },
    'en': {
        welcome_title: 'SteveZMTstudios',
        terminal_whoami: 'whoami',
        terminal_bio: 'Steve ZMT. A hobbyist developer passionate about Android and open source.',
        blog_title: 'Updates',
        blog_main: 'Steve ZMT\'s Blog',
        blog_desc: 'What is this guy babbling about?',
        phigros_hist_title: 'Phigros Historical Versions Collection',
        phigros_hist_desc: 'Possibly the most comprehensive collection of Phigros old versions',
        cacert_sync_title: 'CA Certificate Sync',
        cacert_sync_desc: 'Collect CA certificates from root certificate authorities for updating legacy browsers and systems.',
        sharepoint: 'SharePoint',
        sharepoint_desc: 'Access my shared resources.',
        projects_title: 'Featured Projects',
        all_projects_title: 'More Projects',
        academic_title: 'Academic & Speeches',
        recent_speeches: 'Recent Speeches',
        academic_papers: 'Academic Papers',
        contact_title: 'Contact Me',
        beian: '浙ICP备2025213066号-1',
        contact_note: 'Standard SMS and calls may incur high charges.',
        pgp_keys: 'PGP Keys',
        sudo_lecture: 'We trust you have received the usual lecture from the local system administrator. <br>It usually boils down to these three things:<br><br>    #1) Respect the privacy of others.<br>    #2) Think before you type.<br>    #3) With great power comes great responsibility.',
        su_fail:  "sudo: I've seen penguins that can type better than that.<br>This incident will reported (to your mom).",
        status_busy: "Busy, may not respond quickly",
        toast_resting: "I might be resting... Click again to proceed.",
        toast_busy: "I am busy right now! Click again to proceed.",
        time_early_morning: "Early Morning",
        time_morning: "Morning",
        time_late_morning: "Late Morning",
        time_noon: "Noon",
        time_afternoon: "Afternoon",
        time_evening: "Evening",
        time_night: "Night",
        time_late_night: "Late Night"
    }
};

let currentLang = 'zh-CN';
let currentTheme = 'light';

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.querySelector('span').textContent = currentTheme === 'light' ? 'dark_mode' : 'light_mode';
    
    // Update GitHub Stats Theme
    const statsImg = document.querySelector('img[alt="GitHub Stats"]');
    if (currentTheme === 'dark') {
        statsImg.src = statsImg.src.replace('theme=radical', 'theme=dark').replace('title_color=006a6a', 'title_color=4edada').replace('icon_color=006a6a', 'icon_color=4edada');
    } else {
        statsImg.src = statsImg.src.replace('theme=dark', 'theme=radical').replace('theme=dark', 'theme=radical').replace('title_color=4edada', 'title_color=006a6a').replace('icon_color=4edada', 'icon_color=006a6a');
    }
});

// Language Toggle
const langToggle = document.getElementById('lang-toggle');
langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'zh-CN' ? 'en' : 'zh-CN';
    updateLanguage();
});

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[currentLang][key];
    });
    document.documentElement.lang = currentLang;
    if (cachedRepos.length > 0) renderProjects();
}

// Ripple Effect
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) { ripple.remove(); }
    button.appendChild(circle);
}

document.querySelectorAll('.card, .btn-icon, .fab').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

// Scroll to Top
const scrollTopBtn = document.getElementById('scroll-top');
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

let cachedRepos = [];

// GitHub API Integration
async function fetchGitHubProjects() {
    const workerUrl = 'https://github-user-detail.cf.miniproj.stevezmt.top/repos';
    try {
        const response = await fetch(workerUrl);
        cachedRepos = await response.json();
        if (!Array.isArray(cachedRepos)) throw new Error('Failed to fetch repos');
        renderProjects();
    } catch (error) {
        console.error('GitHub API Error:', error);
        document.getElementById('featured-projects').innerHTML = '<p>Failed to load projects. Please check back later.</p>';
    }
}

// Fetch User Status
async function fetchUserStatus() {
    const workerUrl = 'https://github-user-detail.cf.miniproj.stevezmt.top/status';
    try {
        const response = await fetch(workerUrl);
        const data = await response.json();
        
        if (data && data.data && data.data.user && data.data.user.status) {
            const status = data.data.user.status;
            renderStatus(status);
        }
    } catch (error) {
        console.error('GitHub Status API Error:', error);
    }
}

function normalizeAnnouncements(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') return [data];
    return [];
}

function isAnnouncementActive(item) {
    if (!item || typeof item !== 'object') return false;
    const now = Date.now();

    if (item.date) {
        const startDate = new Date(`${item.date}T00:00:00`);
        if (!Number.isNaN(startDate.getTime()) && now < startDate.getTime()) {
            return false;
        }
    }

    if (item.date_end) {
        const endDate = new Date(`${item.date_end}T23:59:59`);
        if (!Number.isNaN(endDate.getTime()) && now > endDate.getTime()) {
            return false;
        }
    }

    return true;
}

function getAnnouncementIcon(item) {
    if (item && item.variable && item.variable.icon) return item.variable.icon;
    const type = (item && item.type) || 'info';
    const iconMap = {
        info: 'info',
        warn: 'warning',
        err: 'error',
        fatal: 'report',
        banner: 'campaign'
    };
    return iconMap[type] || 'info';
}

function applyAnnouncementCustomOptions(item, element) {
    if (!item || !element || !item.variable) return;

    if (item.variable.custom_css) {
        element.style.cssText += `;${item.variable.custom_css}`;
    }

    if (item.variable.custom_js) {
        try {
            new Function('announcement', 'element', item.variable.custom_js)(item, element);
        } catch (error) {
            console.error('Announcement custom_js execution failed:', error);
        }
    }
}

function getAnnouncementStorageId(item) {
    const title = (item && item.title ? item.title : '').trim();
    if (title) return title;
    const fallback = Array.isArray(item && item.content) ? item.content.join('|') : 'untitled-fatal';
    return fallback.slice(0, 120);
}

function isFatalAcknowledged(item) {
    try {
        return localStorage.getItem(`fatal.announcement.${getAnnouncementStorageId(item)}`) === '1';
    } catch (error) {
        return false;
    }
}

function markFatalAcknowledged(item) {
    try {
        localStorage.setItem(`fatal.announcement.${getAnnouncementStorageId(item)}`, '1');
    } catch (error) {
        console.warn('Failed to store fatal announcement state:', error);
    }
}

function applyAnnouncementLink(element, item) {
    if (!element || !item || !item.variable || !item.variable.href) return;
    const targetBlank = item.variable._blank !== false;
    const href = item.variable.href;

    if (element.tagName === 'A') {
        element.href = href;
        element.target = targetBlank ? '_blank' : '_self';
        element.rel = targetBlank ? 'noopener noreferrer' : '';
        return;
    }

    element.setAttribute('role', 'link');
    element.tabIndex = 0;
    element.classList.add('announce-link');
    element.addEventListener('click', () => {
        if (targetBlank) {
            window.open(href, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = href;
        }
    });
    element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (targetBlank) {
                window.open(href, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = href;
            }
        }
    });
}

function buildAnnouncementElement(item, isBanner) {
    const wrapper = document.createElement('div');
    wrapper.className = isBanner ? 'announce-banner' : `announce-item ${item.type || 'info'}`;

    if (!isBanner) {
        applyAnnouncementLink(wrapper, item);
    }

    if (item.variable && item.variable.custom_html) {
        wrapper.innerHTML = item.variable.custom_html;
        applyAnnouncementCustomOptions(item, wrapper);
        return wrapper;
    }

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = getAnnouncementIcon(item);

    if (isBanner) {
        const main = document.createElement('div');
        main.className = 'announce-banner-main';

        const content = document.createElement('div');
        const lines = Array.isArray(item.content) ? item.content : [];
        lines.forEach(line => {
            const p = document.createElement('p');
            p.innerHTML = line;
            content.appendChild(p);
        });

        main.appendChild(icon);
        main.appendChild(content);
        wrapper.appendChild(main);

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'announce-close';
        closeBtn.title = '关闭公告';
        closeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            wrapper.remove();
            const topContainer = document.getElementById('announce-top');
            if (topContainer && topContainer.children.length === 0) {
                topContainer.style.display = 'none';
            }
        });
        wrapper.appendChild(closeBtn);

        applyAnnouncementLink(main, item);
    } else {
        const content = document.createElement('div');
        content.className = 'announce-content';

        if (item.title) {
            const title = document.createElement('h3');
            title.textContent = item.title;
            content.appendChild(title);
        }

        const lines = Array.isArray(item.content) ? item.content : [];
        if (lines.length === 0) {
            const p = document.createElement('p');
            p.textContent = '';
            content.appendChild(p);
        } else {
            lines.forEach(line => {
                const p = document.createElement('p');
                p.innerHTML = line;
                content.appendChild(p);
            });
        }

        wrapper.appendChild(icon);
        wrapper.appendChild(content);
    }

    applyAnnouncementCustomOptions(item, wrapper);
    return wrapper;
}

function showFatalAnnouncements(items) {
    if (!items || items.length === 0) return;

    const visibleItems = items.filter(item => !isFatalAcknowledged(item));
    if (visibleItems.length === 0) return;

    const existing = document.getElementById('fatal-announce-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'fatal-announce-modal';
    modal.className = 'fatal-modal';

    const dialog = document.createElement('div');
    dialog.className = 'fatal-dialog';

    const primaryTitle = (visibleItems[0] && visibleItems[0].title) ? visibleItems[0].title : '重要公告';
    const heading = document.createElement('h2');
    heading.innerHTML = `<span class="material-symbols-outlined">report</span><span>${primaryTitle}</span>`;
    dialog.appendChild(heading);

    const body = document.createElement('div');
    body.className = 'fatal-body';

    visibleItems.forEach((item, index) => {
        if (index > 0 && item.title) {
            const subTitle = document.createElement('h3');
            subTitle.textContent = item.title;
            body.appendChild(subTitle);
        }

        const lines = Array.isArray(item.content) ? item.content : [];
        lines.forEach(line => {
            const p = document.createElement('p');
            p.innerHTML = line;
            body.appendChild(p);
        });
    });

    dialog.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'fatal-actions';
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn-outlined';
    confirmBtn.innerHTML = '<span class="material-symbols-outlined">done</span><span>我已知晓</span>';
    confirmBtn.addEventListener('click', () => {
        visibleItems.forEach(markFatalAcknowledged);
        modal.remove();
        document.body.classList.remove('fatal-modal-open');
    });
    actions.appendChild(confirmBtn);

    dialog.appendChild(actions);
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    document.body.classList.add('fatal-modal-open');
}

function renderAnnouncements(items) {
    const topContainer = document.getElementById('announce-top');
    const listContainer = document.getElementById('announce-list');

    if (!topContainer && !listContainer) return;

    if (topContainer) topContainer.innerHTML = '';
    if (listContainer) listContainer.innerHTML = '';

    const activeItems = items.filter(isAnnouncementActive);
    const fatalItems = [];

    activeItems.forEach(item => {
        const type = item.type || 'info';

        if (type === 'banner') {
            if (topContainer) topContainer.appendChild(buildAnnouncementElement(item, true));
            return;
        }

        if (listContainer) listContainer.appendChild(buildAnnouncementElement(item, false));
        if (type === 'fatal') fatalItems.push(item);
    });

    if (topContainer) topContainer.style.display = topContainer.children.length ? 'flex' : 'none';
    if (listContainer) listContainer.style.display = listContainer.children.length ? 'flex' : 'none';

    showFatalAnnouncements(fatalItems);
}

async function fetchAnnouncements() {
    try {
        const response = await fetch(`api/v1/announce.json?_=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        renderAnnouncements(normalizeAnnouncements(data));
    } catch (error) {
        console.error('Announcement API Error:', error);
    }
}

console.log("\
  _// //    _//                                 _/////// _//_//       _//_/// _////// \n\
_//    _//  _//                                        _//  _/ _//   _///     _//     \n\
 _//      _/_/ _/   _//    _//     _//   _//          _//   _// _// _ _//     _//     \n\
   _//      _//   _/   _//  _//   _//  _/   _//     _//     _//  _//  _//     _//     \n\
      _//   _//  _///// _//  _// _//  _///// _//   _//      _//   _/  _//     _//     \n\
_//    _//  _//  _/           _/_//   _/         _//        _//       _//     _//     \n\
  _// //     _//   _////       _//      _////   _///////////_//       _//     _//     \n\
                                                                                      \n\
                                             _//               _//                    \n\
                                             _//               _// _/                 \n\
                                     _//// _/_/ _/_//  _//     _//      _//     _//// \n\
                                    _//      _//  _//  _// _// _//_// _//  _// _//    \n\
                                      _///   _//  _//  _//_/   _//_//_//    _//  _/// \n\
                                        _//  _//  _//  _//_/   _//_// _//  _//     _//\n\
                                    _// _//   _//   _//_// _// _//_//   _//    _// _//\n\
\n\
                                                            SteveZMTstudios Corporation\n\
                                                            https://stevezmt.top\n");                                                  

function renderStatus(status) {
    const avatarContainer = document.querySelector('.hero-avatar');
    if (!avatarContainer) return;

    // Create or get status element
    let statusEl = avatarContainer.querySelector('.avatar-status');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.className = 'avatar-status';
        avatarContainer.appendChild(statusEl);
    }

    // Update content
    if (status.emoji || status.emojiHTML || status.message) {
        let emojiContent = '';
        
        // Common Emoji Shortcode Map
        const emojiMap = {
            ':zzz:': '💤',
            ':construction:': '🚧',
            ':sparkles:': '✨',
            ':technologist:': '🧑‍💻',
            ':art:': '🎨',
            ':rocket:': '🚀',
            ':memo:': '📝',
            ':bug:': '🐛',
            ':ambulance:': '🚑',
            ':lock:': '🔒',
            ':closed_lock_with_key:': '🔐',
            ':key:': '🔑',
            ':hammer:': '🔨',
            ':warning:': '⚠️',
            ':no_entry:': '⛔',
            ':white_check_mark:': '✅',
            ':x:': '❌',
            ':heart:': '❤️',
            ':blue_heart:': '💙',
            ':green_heart:': '💚',
            ':purple_heart:': '💜',
            ':yellow_heart:': '💛',
            ':orange_heart:': '🧡',
            ':black_heart:': '🖤',
            ':white_heart:': '🤍',
            ':broken_heart:': '💔',
            ':star:': '⭐',
            ':sunny:': '☀️',
            ':cloud:': '☁️',
            ':rain_cloud:': '🌧️',
            ':snowflake:': '❄️',
            ':zap:': '⚡',
            ':fire:': '🔥',
            ':droplet:': '💧',
            ':ocean:': '🌊',
            ':computer:': '💻',
            ':iphone:': '📱',
            ':watch:': '⌚',
            ':camera:': '📷',
            ':video_camera:': '📹',
            ':movie_camera:': '🎥',
            ':clapper:': '🎬',
            ':microphone:': '🎤',
            ':headphones:': '🎧',
            ':musical_note:': '🎵',
            ':notes:': '🎶',
            ':guitar:': '🎸',
            ':piano:': '🎹',
            ':trumpet:': '🎺',
            ':violin:': '🎻',
            ':drum:': '🥁',
            ':book:': '📖',
            ':books:': '📚',
            ':pencil:': '✏️',
            ':pen:': '🖊️',
            ':paintbrush:': '🖌️',
            ':crayon:': '🖍️',
            ':briefcase:': '💼',
            ':file_folder:': '📁',
            ':open_file_folder:': '📂',
            ':calendar:': '📅',
            ':date:': '📆',
            ':chart_with_upwards_trend:': '📈',
            ':chart_with_downwards_trend:': '📉',
            ':bar_chart:': '📊',
            ':clipboard:': '📋',
            ':pushpin:': '📌',
            ':round_pushpin:': '📍',
            ':paperclip:': '📎',
            ':straight_ruler:': '📏',
            ':triangular_ruler:': '📐',
            ':scissors:': '✂️',
            ':wastebasket:': '🗑️',
            ':email:': '📧',
            ':envelope:': '✉️',
            ':incoming_envelope:': '📨',
            ':envelope_with_arrow:': '📩',
            ':outbox_tray:': '📤',
            ':inbox_tray:': '📥',
            ':package:': '📦',
            ':mailbox:': '📫',
            ':mailbox_closed:': '📪',
            ':mailbox_with_mail:': '📬',
            ':mailbox_with_no_mail:': '📭',
            ':postbox:': '📮',
            ':postal_horn:': '📯',
            ':scroll:': '📜',
            ':page_with_curl:': '📃',
            ':page_facing_up:': '📄',
            ':bookmark_tabs:': '📑',
            ':bookmark:': '🔖',
            ':link:': '🔗',
            ':globe_with_meridians:': '🌐',
            ':ring:': '💍',
            ':gem:': '💎',
            ':mute:': '🔇',
            ':speaker:': '🔈',
            ':sound:': '🔉',
            ':loud_sound:': '🔊',
            ':loudspeaker:': '📢',
            ':mega:': '📣',
            ':bell:': '🔔',
            ':no_bell:': '🔕',
            ':speech_balloon:': '💬',
            ':thought_balloon:': '💭',
            ':left_speech_bubble:': '🗨️',
            ':right_anger_bubble:': '🗯️',
            ':clock1:': '🕐',
            ':clock2:': '🕑',
            ':clock3:': '🕒',
            ':clock4:': '🕓',
            ':clock5:': '🕔',
            ':clock6:': '🕕',
            ':clock7:': '🕖',
            ':clock8:': '🕗',
            ':clock9:': '🕘',
            ':clock10:': '🕙',
            ':clock11:': '🕚',
            ':clock12:': '🕛',
            ':clock130:': '🕜',
            ':clock230:': '🕝',
            ':clock330:': '🕞',
            ':clock430:': '🕟',
            ':clock530:': '🕠',
            ':clock630:': '🕡',
            ':clock730:': '🕢',
            ':clock830:': '🕣',
            ':clock930:': '🕤',
            ':clock1030:': '🕥',
            ':clock1130:': '🕦',
            ':clock1230:': '🕧'
        };

        // Prioritize emojiHTML if available to handle custom emojis and markdown shortcodes correctly
        if (status.emojiHTML) {
            emojiContent = status.emojiHTML;
            // Fallback: if emojiHTML contains raw shortcode (e.g. :zzz:), try to replace it
            if (emojiContent.startsWith(':') && emojiContent.endsWith(':') && emojiMap[emojiContent]) {
                emojiContent = emojiMap[emojiContent];
            }
        } else if (status.emoji) {
            emojiContent = status.emoji;
            // Check if emoji field is actually a shortcode
            if (emojiContent.startsWith(':') && emojiContent.endsWith(':') && emojiMap[emojiContent]) {
                emojiContent = emojiMap[emojiContent];
            }
        }

        const emojiHtml = emojiContent ? `<span class="status-emoji">${emojiContent}</span>` : '';
        
        let messageText = status.message || '';
        const messageHtml = messageText ? `<div class="status-text">${messageText}</div>` : '';
        
        let busyHtml = '';
        if (status.indicatesLimitedAvailability) {
            busyHtml = `<div class="status-busy-text" data-i18n="status_busy">${translations[currentLang].status_busy}</div>`;
        }
        
        statusEl.innerHTML = `${emojiHtml}<div class="status-content">${messageHtml}${busyHtml}</div>`;
        
        // Busy state
        if (status.indicatesLimitedAvailability) {
            statusEl.classList.add('busy');
        } else {
            statusEl.classList.remove('busy');
        }

        // Show
        statusEl.classList.add('visible');
    } else {
        statusEl.classList.remove('visible');
    }
}

function renderProjects() {
    const featuredContainer = document.getElementById('featured-projects');
    const allContainer = document.getElementById('all-projects');
    const terminalFeatured = document.getElementById('terminal-featured-projects');
    
    featuredContainer.innerHTML = '';
    allContainer.innerHTML = '';
    if (terminalFeatured) terminalFeatured.innerHTML = '';

    const featuredRepos = [...cachedRepos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

    featuredRepos.forEach((repo, index) => {
        // Update Main UI
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = "_blank";
        card.className = 'card';
        card.innerHTML = `
            <span class="material-symbols-outlined icon">${getRepoIcon(repo.name)}</span>
            <h3>${repo.name}</h3>
            <p>${repo.description || (currentLang === 'zh-CN' ? '暂无描述' : 'No description available.')}</p>
            <div class="project-stats" style="margin-top: auto; padding-top: 1rem; display: flex; gap: 1rem; font-size: 0.85rem; opacity: 0.8;">
                <span style="display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 1rem;">star</span> ${repo.stargazers_count}</span>
                <span style="display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 1rem;">fork_right</span> ${repo.forks_count}</span>
                <span style="margin-left: auto;">${repo.language || ''}</span>
            </div>
        `;
        card.addEventListener('click', createRipple);
        featuredContainer.appendChild(card);

        // Update Terminal (Top 4)
        if (terminalFeatured && index < 4) {
            const tLink = document.createElement('a');
            tLink.href = repo.html_url;
            tLink.target = "_blank";
            tLink.className = 'terminal-project';
            tLink.textContent = repo.name;
            terminalFeatured.appendChild(tLink);
        }
    });

    // All Projects: Filter (stars > 0), Shuffle, and Slice 10
    const allRepos = cachedRepos
        .filter(repo => repo.stargazers_count > 0)
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    allRepos.forEach(repo => {
        const item = document.createElement('a');
        item.href = repo.html_url;
        item.target = "_blank";
        item.className = 'project-item';
        item.innerHTML = `
            <div class="project-info">
                <h4>${repo.name}</h4>
                <p style="font-size: 0.9rem; opacity: 0.8;">${repo.description || (currentLang === 'zh-CN' ? '暂无描述' : 'No description available.')}</p>
            </div>
            <div class="project-stats">
                <span style="display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 1rem;">star</span> ${repo.stargazers_count}</span>
                <span>${repo.language || ''}</span>
            </div>
        `;
        item.addEventListener('click', createRipple);
        allContainer.appendChild(item);
    });
}

function getRepoIcon(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('music') || lowerName.includes('phigros')) return 'library_music';
    if (lowerName.includes('backup')) return 'backup';
    if (lowerName.includes('cert')) return 'verified_user';
    if (lowerName.includes('wifi') || lowerName.includes('router') || lowerName.includes('uz801')) return 'router';
    if (lowerName.includes('android') || lowerName.includes('magisk')) return 'memory';
    if (lowerName.includes('sound')) return 'volume_up';
    if (lowerName.includes('blog') || lowerName.includes('website')) return 'language';
    if (lowerName.includes('downloader') || lowerName.includes('fetch')) return 'download';
    if (lowerName.includes('port') || lowerName.includes('mtk')) return 'settings_input_component';
    return 'code';
}

// Terminal Logic
let currentPath = '~';
let isPasswordInput = false;
const terminalContainer = document.getElementById('terminal-container');
const terminalHistory = document.getElementById('terminal-history');
const terminalInput = document.getElementById('terminal-hidden-input');
const terminalDisplay = document.getElementById('terminal-input-display');
const activePrompt = document.getElementById('active-prompt');
const terminalDotClose = document.getElementById('terminal-dot-close');
const terminalDotMinimize = document.getElementById('terminal-dot-minimize');
const terminalDotMaximize = document.getElementById('terminal-dot-maximize');

function syncTerminalWindowState() {
    if (!terminalContainer) return;
    if (terminalDotClose) terminalDotClose.setAttribute('aria-pressed', terminalContainer.classList.contains('is-closed') ? 'true' : 'false');
    if (terminalDotMinimize) terminalDotMinimize.setAttribute('aria-pressed', terminalContainer.classList.contains('is-minimized') ? 'true' : 'false');
    if (terminalDotMaximize) terminalDotMaximize.setAttribute('aria-pressed', terminalContainer.classList.contains('is-maximized') ? 'true' : 'false');
}

function openTerminalWindow() {
    if (!terminalContainer) return;
    terminalContainer.classList.remove('is-closed');
    syncTerminalWindowState();
}

function updatePrompts() {
    if (activePrompt) {
        activePrompt.textContent = `steve@stevezmtstudios:${currentPath}$`;
    }
}

if (terminalContainer) {
    terminalContainer.addEventListener('click', () => terminalInput.focus());

    if (terminalDotClose) {
        terminalDotClose.addEventListener('click', (event) => {
            event.stopPropagation();
            const willClose = !terminalContainer.classList.contains('is-closed');
            terminalContainer.classList.toggle('is-closed', willClose);
            if (willClose) {
                terminalContainer.classList.remove('is-minimized', 'is-maximized');
                document.body.classList.remove('terminal-maximized');
            }
            syncTerminalWindowState();
        });
    }

    if (terminalDotMinimize) {
        terminalDotMinimize.addEventListener('click', (event) => {
            event.stopPropagation();
            openTerminalWindow();
            terminalContainer.classList.remove('is-maximized');
            document.body.classList.remove('terminal-maximized');
            terminalContainer.classList.toggle('is-minimized');
            syncTerminalWindowState();
        });
    }

    if (terminalDotMaximize) {
        terminalDotMaximize.addEventListener('click', (event) => {
            event.stopPropagation();
            openTerminalWindow();
            terminalContainer.classList.remove('is-minimized');
            const willMaximize = !terminalContainer.classList.contains('is-maximized');
            terminalContainer.classList.toggle('is-maximized', willMaximize);
            document.body.classList.toggle('terminal-maximized', willMaximize);
            syncTerminalWindowState();
        });
    }

    terminalInput.addEventListener('input', (e) => {
        if (isPasswordInput) {
            terminalDisplay.textContent = ''; // Hide password input
        } else {
            terminalDisplay.textContent = e.target.value;
        }
    });

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (isPasswordInput) {
                handleSudoPassword();
            } else {
                const cmdLine = terminalInput.value.trim();
                handleCommand(cmdLine);
            }
            terminalInput.value = '';
            terminalDisplay.textContent = '';
        }
    });

    syncTerminalWindowState();
}

function handleSudoPassword() {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="terminal-prompt">[sudo] steve's password:</span>`;
    terminalHistory.appendChild(line);

    const response = document.createElement('div');
    response.className = 'terminal-line';
    response.style.color = '#ff5f56';
    response.innerHTML = translations[currentLang].su_fail;
    terminalHistory.appendChild(response);
    
    isPasswordInput = false;
    updatePrompts();
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

function handleCommand(cmdLine) {
    if (!cmdLine) return;

    const args = cmdLine.split(/\s+/);
    const cmd = args[0].toLowerCase();
    const target = args[1];

    // Add command to history
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="terminal-prompt">steve@stevezmtstudios:${currentPath}$</span> <span>${cmdLine}</span>`;
    terminalHistory.appendChild(line);

    const response = document.createElement('div');
    response.className = 'terminal-line';

    const fs = {
        '~': ['projects/', 'blogs/', 'contact/', 'about.me'],
        '~/projects': [], 
        '~/blogs': [
            '<a href="https://blog.stevezmt.top" target="_blank" class="terminal-project">main_blog</a>',
            '<a href="https://blog.stevezmt.top/posts/scanpen-adb" target="_blank" class="terminal-project">article_1</a>',
            '<a href="https://blog.stevezmt.top/posts/scanpen-root" target="_blank" class="terminal-project">article_2</a>'
        ],
        '~/contact': [
            '<a href="mailto:me@stevezmt.top" class="terminal-project">email</a>',
            '<a href="https://gravatar.com/stevezmt" target="_blank" class="terminal-project">gravatar</a>',
            '<a href="https://github.com/stevezmtstudios" target="_blank" class="terminal-project">github</a>',
            '<a href="https://space.bilibili.com/474130186" target="_blank" class="terminal-project">bilibili</a>',
            '<a href="https://t.me/stevezmt" target="_blank" class="terminal-project">telegram</a>',
            '<a href="sms:+37257243638" class="terminal-project">rcs_sms</a>',
            '<a href="https://zhihu.com/people/zhang-xian-sheng-70-9" target="_blank" class="terminal-project">zhihu</a>'
            // should match with 'cat' cmd
        ]
    };

    switch (cmd) {
        case 'help':
            response.innerHTML = 'Available commands: help, clear, ls [dir], cd [dir], pwd, cat [file], whoami, theme, lang, blog, contact, su, sudo, snow [start|stop]';
            break;
        case 'snow':
            if (target === 'stop') {
                if (window.snow && window.snow.stop) {
                    window.snow.stop();
                }
                response.innerHTML = 'Snow stopped.';
            } else if (target === 'start') {
                if (window.snow && window.snow.start) {
                    window.snow.start({
                        flakeCount: 300,
                        maxRadius: 3.8,
                        wind: -1,
                        color: '#f0f8ff',
                        minSpeed: 0.8,
                        maxSpeed: 2.5,
                        stickingRatio: 0.3,
                        maxHeightRatio: 0.15
                    });
                }
                response.innerHTML = '<div>不！！！秋雅！！！！！！！</div><br/><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="298" height="52" src="//music.163.com/outchain/player?type=2&amp;id=5268441&amp;auto=1&amp;height=32&amp;bg=121212"></iframe>';
            } else {
                response.innerHTML = 'Usage: snow [start|stop]';
            }
            break;
        case 'clear':
            terminalHistory.innerHTML = '';
            return;
        case 'pwd':
            response.innerHTML = currentPath.replace('~', '/home/steve');
            break;
        case 'su':
        case 'sudo':
            response.innerHTML = translations[currentLang].sudo_lecture;
            isPasswordInput = true;
            if (activePrompt) activePrompt.textContent = "[sudo] steve's password:";
            break;
        case 'cat':
            if (!target) {
                response.innerHTML = 'cat: missing operand';
            } else if (target === 'about.me' || (currentPath === '~' && target === 'about.me')) {
                response.textContent = translations[currentLang].terminal_bio;
            } else if (currentPath === '~/projects') {
                const repo = cachedRepos.find(r => r.name.toLowerCase() === target.toLowerCase());
                if (repo) {
                    window.open(repo.html_url, '_blank');
                    response.innerHTML = `Opening ${repo.name}...`;
                } else {
                    response.innerHTML = `cat: ${target}: No such file or directory`;
                }
            } else if (currentPath === '~/contact') {
                const contacts = {
                    'email': 'mailto:me@stevezmt.top',
                    'github': 'https://github.com/stevezmtstudios',
                    'zhihu': 'https://www.zhihu.com/people/zhang-xian-sheng-70-9',
                    'bilibili': 'https://space.bilibili.com/474130186',
                    'telegram': 'https://t.me/stevezmt',
                    'rcs_sms': 'sms:+37257243638',
                    'gravatar': 'https://gravatar.com/stevezmt'
                };
                const val = contacts[target.toLowerCase()];
                if (val) {
                    if (val.startsWith('http')) window.open(val, '_blank');
                    else window.location.href = val;
                    response.innerHTML = `Opening ${target}...`;
                } else {
                    response.innerHTML = `cat: ${target}: No such file or directory`;
                }
            } else {
                // Global check for projects/contacts if not in specific dir?
                // User said "whether cd or cat project/contact".
                // If I am at ~, cat project_name should probably work if it's considered "in path"?
                // But standard cat doesn't work like that.
                // However, user request implies convenience.
                // Let's stick to current path logic for cat, but maybe extend it?
                // "terminal中，无论是cd还是cat项目/联系方式，都能打开或前往链接。"
                // This implies global access or at least when they are visible.
                // I'll stick to strict path for cat to avoid confusion, but cd will be more flexible.
                response.innerHTML = `cat: ${target}: No such file or directory`;
            }
            break;
        case 'ls':
            let lsTarget = target || currentPath;
            if (lsTarget === '.') lsTarget = currentPath;
            
            let fullPath = lsTarget;
            if (!lsTarget.startsWith('~')) {
                if (lsTarget === '..') {
                    if (currentPath === '~') fullPath = '~';
                    else {
                        const parts = currentPath.split('/');
                        parts.pop();
                        fullPath = parts.join('/') || '~';
                    }
                } else {
                    fullPath = currentPath === '~' ? `~/${lsTarget}` : `${currentPath}/${lsTarget}`;
                }
            }
            fullPath = fullPath.replace(/\/$/, '');

            if (fullPath === '~/projects' || (currentPath === '~/projects' && !target)) {
                const topProjects = [...cachedRepos]
                    .sort((a, b) => b.stargazers_count - a.stargazers_count)
                    .slice(0, 8)
                    .map(r => `<a href="${r.html_url}" target="_blank" class="terminal-project">${r.name}</a>`)
                    .join(' ');
                response.innerHTML = topProjects || 'No projects found.';
            } else if (fs[fullPath]) {
                response.innerHTML = fs[fullPath].join('  ');
            } else if (fullPath === '~/about.me') {
                response.textContent = translations[currentLang].terminal_bio;
            } else {
                response.innerHTML = `ls: cannot access '${lsTarget}': No such file or directory`;
            }
            break;
        case 'cd':
            let cdTarget = target ? target.replace(/\/$/, '') : '~';
            
            // Check for projects (Global search for convenience)
            const project = cachedRepos.find(r => r.name.toLowerCase() === cdTarget.toLowerCase());
            if (project) {
                window.open(project.html_url, '_blank');
                response.innerHTML = `Opening ${project.name}...`;
                break;
            }

            // Check contacts (Global search)
            const contacts = {
                'email': 'mailto:me@stevezmt.top',
                'github': 'https://github.com/stevezmtstudios',
                'zhihu': 'https://www.zhihu.com/people/zhang-xian-sheng-70-9',
                'bilibili': 'https://space.bilibili.com/474130186',
                'telegram': 'https://t.me/stevezmt',
                'rcs_sms': 'sms:+37257243638',
                'gravatar': 'https://gravatar.com/stevezmt'
            };
            if (contacts[cdTarget.toLowerCase()]) {
                 const link = contacts[cdTarget.toLowerCase()];
                 if (link.startsWith('http')) window.open(link, '_blank');
                 else window.location.href = link;
                 response.innerHTML = `Opening ${cdTarget}...`;
                 break;
            }

            if (!cdTarget || cdTarget === '~') {
                currentPath = '~';
            } else if (cdTarget === 'blogs' || cdTarget === '~/blogs') {
                window.open('https://blog.stevezmt.top', '_blank');
                response.innerHTML = 'Opening blog...';
            } else if (cdTarget === '..') {
                if (currentPath !== '~') {
                    const parts = currentPath.split('/');
                    parts.pop();
                    currentPath = parts.join('/') || '~';
                }
            } else {
                let newPath = cdTarget.startsWith('~') ? cdTarget : (currentPath === '~' ? `~/${cdTarget}` : `${currentPath}/${cdTarget}`);
                newPath = newPath.replace(/\/$/, '');
                if (fs[newPath]) {
                    currentPath = newPath;
                } else {
                    response.innerHTML = `cd: ${target}: No such directory`;
                }
            }
            updatePrompts();
            if (response.innerHTML) terminalHistory.appendChild(response);
            terminalHistory.scrollTop = terminalHistory.scrollHeight;
            return;
        case 'whoami':
            response.textContent = translations[currentLang].terminal_bio;
            break;
        case 'theme':
            themeToggle.click();
            response.innerHTML = `Theme switched to ${currentTheme}`;
            break;
        case 'lang':
            langToggle.click();
            response.innerHTML = `Language switched to ${currentLang}`;
            break;
        case 'blog':
            window.open('https://blog.stevezmt.top', '_blank');
            response.innerHTML = 'Opening blog...';
            break;
        case 'contact':
            response.innerHTML = 'Email &amp; iMessage: <a href="mailto:me@stevezmt.top">me@stevezmt.top</a> | GitHub: <a href="https://github.com/stevezmtstudios" target="_blank">@stevezmtstudios</a> | Telegram: <a href="https://t.me/stevezmt" target="_blank">@stevezmt</a> | RCS: <a href="sms:+37257243638">+372 5724-3638</a>';
            break;
        case 'rm':
            const isDestructive = args.some(arg => arg === '/' || arg === '/*' || arg === '.');
            if (args.includes('-rf') && isDestructive) {
                response.innerHTML = 'rm: cannot remove \'/\': Operation not permitted... just kidding.<br>Deleting system...';
                setTimeout(() => {
                    // Create full-screen panic overlay
                    const overlay = document.createElement('div');
                    overlay.id = 'kernel-panic-screen';
                    overlay.style.position = 'fixed';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.background = 'black';
                    overlay.style.color = '#e0e0e0';
                    overlay.style.fontFamily = 'monospace';
                    overlay.style.padding = '24px';
                    overlay.style.boxSizing = 'border-box';
                    overlay.style.overflowY = 'auto';

                    overlay.innerHTML = `
                        <div style="color:#ff6b6b; font-size:1.4rem; font-weight:700; margin-bottom:12px;">Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000000</div>
                        <div id="kp-log" style="white-space:pre-wrap; color:#b8ffb8; font-size:0.95rem; line-height:1.35;"></div>
                    `;

                    // Replace body with overlay (no UI controls added)
                    document.documentElement.style.background = 'black';
                    document.body.innerHTML = '';
                    document.body.appendChild(overlay);
                    document.body.style.margin = '0';

                    // Play a single short beep for the panic (non-repeating)
                    try {
                        const Ctx = window.AudioContext || window.webkitAudioContext;
                        if (Ctx) {
                            const ctx = new Ctx();
                            const o = ctx.createOscillator();
                            const g = ctx.createGain();
                            o.type = 'square';
                            o.frequency.value = 880;
                            o.connect(g);
                            g.connect(ctx.destination);
                            g.gain.value = 0.0001;
                            o.start();
                            g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
                            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
                            setTimeout(() => { try { o.stop(); ctx.close(); } catch (e) {} }, 300);
                        }
                    } catch (e) { /* ignore audio errors */ }

                    // Simulate repeated failing logs to convey ongoing failure
                    const log = document.getElementById('kp-log');
                    const staticLines = [
                        'Initiating emergency shutdown sequence...',
                        'Unmounting filesystems: /home, /var, /tmp',
                        'Failed to sync journal to disk: I/O error',
                        'killing all processes: PID 1 init',
                        'watchdog: BUG: unable to ping hardware watchdog',
                        'unable to remount rootfs as rw: read-only file system',
                        'ext4_sync: error -5 writing inode',
                        'systemd-shutdown[1]: Failed to finalize transaction: Protocol error',
                        'Attempting last-ditch recovery...',
                        'Recovery failed: aborting.',
                        '[  1913.303190] Kernel panic - not syncing: Fatal exception in interrupt',
                        '[  1913.309191] CPU: 0 PID: 1 Comm: init Not tainted 5.4.0-42-generic #46-Ubuntu',
                        '[  1913.309992] Hardware name: Generic Virtual Machine',
                    ...(function() {
                        const arr = [];
                        const templates = [
                            'EXT4-fs (sda1): delayed allocation failed for inode',
                            'Buffer I/O error on dev sda1, logical block',
                            'ata1.00: exception Emask',
                            'blk_update_request: I/O error, dev sda, sector',
                            'usb 1-1: device descriptor read/64, error -110',
                            'NETDEV WATCHDOG: eth0 (e1000e): transmit queue 0 timed out',
                            'Out of memory: Kill process',
                            'ACPI Error: Method parse/execution failed',
                            'thermal thermal_zone0: failed to read temperature',
                            'scsi host0: scsi0: aborting command',
                            'JBD2: Detected aborted operation',
                            'systemd-shutdown[1]: Failed to finalize transaction',
                            'kworker: stack overflow detected',
                            'nvme nvme0: I/O 0 QID 0 timeout, aborting command',
                            'ipv6: ADDRCONF(NETDEV_UP): eth0: link is not ready',
                            'irq 45: no longer affine to CPU0',
                            'audit: type=1400 audit(0.0:0): apparmor=DENIED',
                            'e1000e 0000:00:19.0: NIC Link is Down',
                            'MMU: killing process for OOM',
                            'kernel: page allocation failure: order',
                            'kswapd0: CPU stuck for 22s',
                            'NFS: server not responding, still trying',
                            'drm: failed to create context',
                            'pci_bus 0000:00: resource 5: enabling failed',
                            'random: crng init done',
                            'usb 2-1: USB disconnect, device number',
                            'firmware: failed to load i915/skl_dmc_ver1_26.bin',
                            'watchdog: BUG: soft lockup - CPU#',
                            'efivars: probe of efivars failed with error -22',
                            'audit: type=1100 audit(0.0:0): pid=0 failed to log',
                            'bridge: filtering via arp/ip/ip6tables is no longer available by default',
                            'BTRFS warning (device sda2): checksum found wrong',
                            'dm-crypt: cipher init failed',
                            'usb 3-2: device descriptor read/8, error -32',
                            'r8169 0000:02:00.0: eth0: link up',
                            'sie 0000:07:00.0: firmware crash',
                            'xfrm: failed to parse request',
                            'ipv4: route add failed',
                            'CIFS VFS: Server not responding',
                            'eth0: TX queue timeout',
                            'tcp: excessive retransmissions',
                            'dm-raid: failed to find suitable raid devices',
                            'split_lock_detect: Possible split lock detected',
                            'input: AT Translated Set 2 keyboard as /devices/platform/i8042',
                            'crypto: cipher allocate failed',
                            'fuse: read failed in fuse_dev_read',
                            'usb 1-3: reset high-speed USB device number',
                            'systemd[1]: Failed to start user@1000.service: Unit not found',
                            'pci 0000:00:1f.2: DMA mask not set',
                            'md: md127: super1 has wrong sector size 4096 (expecting 512)'
                        ];

                        for (let i = 0; i < 300; i++) {
                            const tpl = templates[i % templates.length];
                            // generate a plausible dmesg-style timestamp fragment
                            const tsFragment = (320000 + i).toString();
                            const detailSuffix = (i % 7 === 0) ? `error=${-((i % 100) + 1)}` :
                                                  (i % 7 === 1) ? `sector=${Math.floor(Math.random() * 100000)}` :
                                                  (i % 7 === 2) ? `pid=${1000 + (i % 500)}` :
                                                  (i % 7 === 3) ? `cpu=${i % 8}` :
                                                  (i % 7 === 4) ? `dev=sda${1 + (i % 3)}` :
                                                  (i % 7 === 5) ? `uid=${(i % 1000)}` :
                                                  `id=${i}`;
                            arr.push(`[  1913.${tsFragment}] ${tpl} ${detailSuffix}`);
                        }
                        return arr;
                    })(),
                    ];

                    let i = 0;
                    const maxLines = 1120; // simulate many lines
                    const iv = setInterval(() => {
                        if (!log) return clearInterval(iv);
                        if (i < maxLines) {
                            const now = new Date().toISOString();
                            const msg = (i < staticLines.length) ? staticLines[i] : `disk IO error: read failed at sector ${Math.floor(Math.random() * 100000)}`;
                            const row = document.createElement('div');
                            row.textContent = `${now} ${msg}`;
                            // highlight errors in red-ish
                            if (/failed|error|BUG|Failed|unable|abort/i.test(msg)) row.style.color = '#ff6b6b';
                            else row.style.color = '#b8ffb8';
                            log.appendChild(row);
                            overlay.scrollTop = overlay.scrollHeight;
                            i++;
                        } else {
                            clearInterval(iv);
                            const final = document.getElementById('kp-final');
                            if (final) final.style.color = '#ff6b6b';
                            const hint = document.createElement('div');
                            hint.style.color = '#fff';
                            hint.style.marginTop = '12px';
                            hint.textContent = 'System Halted from unrecoverable error.';
                            log.appendChild(hint);
                            overlay.scrollTop = overlay.scrollHeight;
                        }
                    }, 10);
                }, 2000);
            } else {
                response.innerHTML = 'rm: missing operand or permission denied';
            }
            break;
        default:
            response.innerHTML = `Command not found: ${cmd}. Type 'help' for assistance.`;
    }

    terminalHistory.appendChild(response);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

// Initialize
const browserLang = navigator.language || navigator.userLanguage;
currentLang = browserLang.startsWith('zh') ? 'zh-CN' : 'en';
updateLanguage();

updatePrompts();
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    themeToggle.click();
}
fetchGitHubProjects();
fetchUserStatus();
fetchAnnouncements();
if (terminalInput && !('ontouchstart' in window)) {
    terminalInput.focus({ preventScroll: true });
}

// Header Logo Animation
const welcomeTitle = document.querySelector('h1[data-i18n="welcome_title"]');
const header = document.querySelector('header');

function checkHeaderLogo() {
    if (!welcomeTitle || !header) return;
    const rect = welcomeTitle.getBoundingClientRect();
    // If the bottom of the title passes the header, show logo text
    if (rect.bottom < header.offsetHeight) {
        header.classList.add('show-logo-text');
    } else {
        header.classList.remove('show-logo-text');
    }
}

if (welcomeTitle && header) {
    window.addEventListener('scroll', checkHeaderLogo, { passive: true });
    checkHeaderLogo(); // Initial check
}

// Local Time & Contact Interception
function updateLocalTime() {
    const timeEl = document.getElementById('local-time');
    if (!timeEl) return;

    const now = new Date();
    // UTC+8
    const utc8Time = new Date(now.getTime() + (480 + now.getTimezoneOffset()) * 60000);
    const hours = utc8Time.getHours();
    const minutes = utc8Time.getMinutes();
    
    let timePeriod = '';
    if (hours >= 0 && hours < 6) timePeriod = translations[currentLang].time_early_morning;
    else if (hours >= 6 && hours < 9) timePeriod = translations[currentLang].time_morning;
    else if (hours >= 9 && hours < 11) timePeriod = translations[currentLang].time_late_morning;
    else if (hours >= 11 && hours < 13) timePeriod = translations[currentLang].time_noon;
    else if (hours >= 13 && hours < 17) timePeriod = translations[currentLang].time_afternoon;
    else if (hours >= 17 && hours < 19) timePeriod = translations[currentLang].time_evening;
    else if (hours >= 19 && hours < 24) timePeriod = translations[currentLang].time_night;

    const timeStr = `${timePeriod} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    timeEl.textContent = timeStr;

    if (hours >= 0 && hours < 6) {
        timeEl.style.color = '#cba610ff';
        timeEl.setAttribute('data-late-night', 'true');
        
        // Add zZZ animation if not exists
        if (!document.getElementById('zzz-container')) {
            const container = document.createElement('div');
            container.id = 'zzz-container';
            container.style.cssText = `
                position: absolute;
                top: -20px;
                right: 0;
                width: 40px;
                height: 40px;
                pointer-events: none;
            `;
            // Ensure parent is relative
            timeEl.parentElement.style.position = 'relative';
            timeEl.parentElement.appendChild(container);
            
            // Add keyframes if not exists
            if (!document.getElementById('zzz-keyframes')) {
                const style = document.createElement('style');
                style.id = 'zzz-keyframes';
                style.textContent = `
                    @keyframes floatUpZ {
                        0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
                        20% { opacity: 1; }
                        100% { transform: translateY(-30px) translateX(15px) scale(1.2); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            // Spawn Zs
            const spawnZ = () => {
                if (!document.getElementById('zzz-container')) return;
                const z = document.createElement('span');
                z.textContent = 'z';
                const size = 0.6 + Math.random() * 0.6; // 0.6rem - 1.2rem
                const duration = 2 + Math.random() * 2; // 2s - 4s
                const delay = Math.random() * 1;
                
                z.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    right: ${Math.random() * 20}px;
                    font-size: ${size}rem;
                    color: #f1c40f;
                    font-weight: bold;
                    opacity: 0;
                    animation: floatUpZ ${duration}s ease-out ${delay}s forwards;
                    font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
                `;
                container.appendChild(z);
                
                // Cleanup
                setTimeout(() => {
                    z.remove();
                }, (duration + delay) * 1000);
            };

            // Start spawning
            const intervalId = setInterval(spawnZ, 800);
            container.dataset.intervalId = intervalId;
        }
    } else {
        timeEl.style.color = 'inherit';
        timeEl.removeAttribute('data-late-night');
        const container = document.getElementById('zzz-container');
        if (container) {
            clearInterval(container.dataset.intervalId);
            container.remove();
        }
    }
}

setInterval(updateLocalTime, 1000);
updateLocalTime();

// Toast Notification
// Handler for stop-snow badge: stop snow and show toast anchored to the badge element
function handleStopSnowBadge(el) {
    if (window.snow && window.snow.stop) {
        window.snow.stop();
        showToast('Snow is stopping...', el);
    }
}

function showToast(message, targetEl) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-popup');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-popup';
    toast.textContent = message;
    
    const textColor = currentTheme === 'dark' ? '#f1c40f' : 'white';
    
    toast.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: ${textColor};
        padding: 8px 12px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 0.8rem;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    // Arrow
    const arrow = document.createElement('div');
    arrow.style.cssText = `
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
    `;
    toast.appendChild(arrow);

    document.body.appendChild(toast);

    // Position calculation
    const rect = targetEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Initial render to get dimensions
    toast.style.opacity = '0';
    
    // Calculate position: centered above the target
    const toastRect = toast.getBoundingClientRect(); // This might be 0 if not visible/rendered yet, but opacity 0 is rendered.
    // We need to ensure it has dimensions.
    
    const top = rect.top + scrollTop - toast.offsetHeight - 10; // 10px gap
    const left = rect.left + scrollLeft + (rect.width / 2) - (toast.offsetWidth / 2);

    toast.style.top = `${top}px`;
    toast.style.left = `${left}px`;

    // Trigger reflow
    toast.offsetHeight;
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Contact Link Interception
document.querySelectorAll('#contact-title + .grid a').forEach(link => {
    link.addEventListener('click', function(e) {
        const timeEl = document.getElementById('local-time');
        const isLateNight = timeEl && timeEl.hasAttribute('data-late-night');
        const statusEl = document.querySelector('.avatar-status');
        const isBusy = statusEl && statusEl.classList.contains('busy');

        if (!this.dataset.confirmed) {
            if (isLateNight) {
                e.preventDefault();
                showToast(translations[currentLang].toast_resting, this);
                this.dataset.confirmed = 'true';
                setTimeout(() => this.dataset.confirmed = '', 3000); // Reset after 3s
            } else if (isBusy) {
                e.preventDefault();
                showToast(translations[currentLang].toast_busy, this);
                this.dataset.confirmed = 'true';
                setTimeout(() => this.dataset.confirmed = '', 3000);
            }
        }
    });
});

// Hero Section Scroll Effect
document.addEventListener('DOMContentLoaded', function() {
    const hero = document.querySelector('.hero');
    const header = document.querySelector('header');
    
    if (!hero || !header) return;

    function updateHeroVars() {
        // Only active on desktop (width > 768px)
        if (window.innerWidth <= 768) {
            hero.style.removeProperty('--hero-progress');
            hero.style.removeProperty('--header-height');
            return;
        }

        const headerHeight = header.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        // Scroll threshold to complete the animation
        const scrollThreshold = windowHeight * 0.6; 
        
        const progress = Math.min(scrollY / scrollThreshold, 1);
        
        hero.style.setProperty('--header-height', `${headerHeight}px`);
        hero.style.setProperty('--hero-progress', progress);
    }

    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeroVars();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Handle resize
    window.addEventListener('resize', updateHeroVars);

    // Initial call
    updateHeroVars();
});
