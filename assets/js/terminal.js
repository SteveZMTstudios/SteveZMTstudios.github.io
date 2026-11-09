(function () {
    'use strict';

    let deps = null;
    let initialized = false;

    function t(key) {
        const lang = deps && deps.getLang ? deps.getLang() : 'zh';
        const table = deps && deps.translations ? deps.translations[lang] : null;
        return (table && table[key]) || '';
    }

    function getRepos() {
        return (deps && deps.getRepos && deps.getRepos()) || [];
    }

let currentPath = '~';
let isPasswordInput = false;
let sudoAttempts = 0;
let lectureShown = false;
let tabState = null;
let rmEasterEggState = 'idle'; // idle | flooding | frozen | panic | overflow
let rmFloodTimer = null;
let rmFreezeCleanup = null;

const terminalContainer = document.getElementById('terminal-container');
const terminalHistory = document.getElementById('terminal-history');
const terminalInput = document.getElementById('terminal-input');
const activePrompt = document.getElementById('active-prompt');
const terminalToggle = document.getElementById('terminal-toggle');
const terminalDotClose = document.getElementById('terminal-dot-close');

const promptUser = terminalContainer
    ? (terminalContainer.getAttribute('data-prompt-user') || 'steve@stevezmtstudios')
    : 'steve@stevezmtstudios';

const commandHistory = [];
let historyIndex = 0;
let historyDraft = '';

const TERMINAL_COMMANDS = ['blog', 'cat', 'cd', 'clear', 'contact', 'help', 'lang', 'ls', 'pwd', 'rm', 'snow', 'su', 'sudo', 'theme', 'whoami'];
const TERMINAL_CONTACTS = ['email', 'github', 'zhihu', 'bilibili', 'telegram', 'rcs_sms', 'gravatar'];
const TERMINAL_BLOG_FILES = ['main_blog', 'article_1', 'article_2'];
const TERMINAL_DIRS = ['~', 'projects/', 'blogs/', 'contact/', '..'];

function escapeTerminalText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[ch]));
}

function promptHtml(path) {
    return `<span class="terminal-user">${escapeTerminalText(promptUser)}</span><span class="terminal-colon">:</span><span class="terminal-path">${escapeTerminalText(path)}</span><span class="terminal-dollar">$</span>`;
}

function setTerminalOpen(open) {
    if (!terminalContainer) return;
    if (!open && rmEasterEggState !== 'idle') return;
    terminalContainer.classList.toggle('is-open', open);
    terminalContainer.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (terminalToggle) {
        terminalToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        const openLabel = terminalToggle.getAttribute('data-open-label') || 'Open Terminal';
        const closeLabel = terminalToggle.getAttribute('data-close-label') || 'Close Terminal';
        const label = open ? closeLabel : openLabel;
        terminalToggle.setAttribute('title', label);
        terminalToggle.setAttribute('aria-label', label);
        const icon = terminalToggle.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = open ? 'close' : 'terminal';
    }

    if (!open) {
        isPasswordInput = false;
        sudoAttempts = 0;
        tabState = null;
        updatePrompts();
        if (terminalInput) {
            terminalInput.value = '';
            terminalInput.classList.remove('is-password');
        }
    }

    if (terminalInput) {
        if (open && !('ontouchstart' in window)) {
            window.setTimeout(() => terminalInput.focus({ preventScroll: true }), 50);
        } else if (!open) {
            terminalInput.blur();
        }
    }
}

function updatePrompts() {
    if (activePrompt) {
        activePrompt.classList.remove('terminal-password-prompt');
        activePrompt.innerHTML = promptHtml(currentPath);
    }
    if (terminalInput) {
        terminalInput.classList.remove('is-password');
    }
}

function setTerminalInputValue(value) {
    if (!terminalInput) return;
    terminalInput.value = value;
    terminalInput.setSelectionRange(value.length, value.length);
}

function longestCommonPrefix(values) {
    if (!values.length) return '';
    let prefix = values[0];
    for (let i = 1; i < values.length; i++) {
        while (prefix && !values[i].startsWith(prefix)) {
            prefix = prefix.slice(0, -1);
        }
    }
    return prefix;
}

function completionsFor(command, token) {
    const repos = getRepos().map((repo) => repo.name);
    let candidates = [];
    if (command === 'cd') {
        candidates = [...TERMINAL_DIRS, ...repos, ...TERMINAL_CONTACTS];
    } else if (command === 'cat') {
        candidates = ['about.me', ...repos, ...TERMINAL_CONTACTS, ...TERMINAL_BLOG_FILES];
    } else if (command === 'ls') {
        candidates = [...TERMINAL_DIRS, 'about.me'];
    } else if (command === 'rm') {
        candidates = [...TERMINAL_DIRS, 'about.me', ...repos];
    }
    return [...new Set(candidates)].filter((item) => item.startsWith(token));
}

function appendCompletionLine(values) {
    const line = document.createElement('div');
    line.className = 'terminal-line terminal-completion';
    line.textContent = values.join('  ');
    terminalHistory.appendChild(line);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

function handleTabCompletion() {
    if (isPasswordInput || !terminalInput) return;
    const value = terminalInput.value;
    const lastSpace = value.lastIndexOf(' ');
    const isCommand = lastSpace === -1;
    const token = isCommand ? value : value.slice(lastSpace + 1);
    let candidates = [];

    if (isCommand) {
        candidates = TERMINAL_COMMANDS.filter((command) => command.startsWith(token));
    } else {
        const command = value.slice(0, lastSpace).trim().split(/\s+/)[0].toLowerCase();
        candidates = completionsFor(command, token);
    }

    if (!candidates.length) return;
    const unique = [...new Set(candidates)].sort();
    const before = isCommand ? '' : value.slice(0, lastSpace + 1);

    if (unique.length === 1) {
        setTerminalInputValue(before + unique[0]);
        tabState = null;
        return;
    }

    const common = longestCommonPrefix(unique);
    if (common.length > token.length) {
        setTerminalInputValue(before + common);
    }

    const nextValue = terminalInput.value;
    const key = unique.join('\u0000');
    if (tabState && tabState.value === nextValue && tabState.key === key) {
        appendCompletionLine(unique);
        tabState = null;
    } else {
        tabState = { value: nextValue, key: key };
    }
}

function normalizeToyPath(path) {
    return String(path).replace(/^~\/?/, '').replace(/\/+$/, '').toLowerCase();
}

function isExistingToyPath(path) {
    const name = normalizeToyPath(path);
    if (name === '' || name === '.' || name === '..') return true;
    if (name === 'about.me') return true;
    if (name === 'projects' || name === 'blogs' || name === 'contact') return true;
    if (TERMINAL_CONTACTS.includes(name)) return true;
    if (TERMINAL_BLOG_FILES.includes(name)) return true;
    if (getRepos().some((repo) => repo.name.toLowerCase() === name)) return true;
    if (name.startsWith('projects/')) {
        return getRepos().some((repo) => repo.name.toLowerCase() === name.slice('projects/'.length));
    }
    if (name.startsWith('contact/')) {
        return TERMINAL_CONTACTS.includes(name.slice('contact/'.length));
    }
    if (name.startsWith('blogs/')) {
        return TERMINAL_BLOG_FILES.includes(name.slice('blogs/'.length));
    }
    return false;
}

/*
 * ---------------------------------------------------------------------------
 * rm -rf / easter egg
 *
 * `rm -rf /` refuses to run without --no-preserve-root, just like GNU rm.
 * With the failsafe bypassed (or when invoked as `rm -rf /*`) the terminal
 * drowns in deletion failures, the page locks up somewhere between 5 and 7
 * seconds, and the kernel finally panics at a random uptime in 325-1145s.
 * Every line advances the kernel clock by 0.00001-0.0001s.
 * ---------------------------------------------------------------------------
 */

const TUX_ART = [
    '     .--.        _',
    '    |o_o |      | |',
    '    |:_/ |      | |',
    '   //   \\ \\     |_|',
    "  (|     | )     _",
    " /'\\_   _/`\\    (_)",
    ' \\___)=(___/',
].join('\n');

// Entries bash expands `/*` into, in C collation order.
const RM_ROOT_ENTRIES = [
    '/bin', '/boot', '/dev', '/etc', '/home', '/lib', '/lib64', '/lost+found',
    '/media', '/mnt', '/opt', '/proc', '/root', '/run', '/sbin', '/srv',
    '/sys', '/tmp', '/usr', '/var',
];

// Pseudo filesystems: unlinking these can never succeed on a live system.
const RM_VIRTUAL_PATHS = [
    '/proc/1/root',
    '/proc/1/ns/mnt',
    '/proc/1/fd/0',
    '/proc/1/mem',
    '/proc/1/map_files',
    '/proc/self/root',
    '/proc/bus/pci/00/00.0',
    '/proc/bus/input/devices',
    '/proc/fs/ext4/sda1/options',
    '/proc/fs/jbd2/sda1-8/info',
    '/proc/irq/4/ttyS0',
    '/proc/kcore',
    '/proc/sys/kernel/panic',
    '/proc/sys/vm/drop_caches',
    '/proc/sysrq-trigger',
    '/sys/kernel/debug/tracing',
    '/sys/kernel/mm/hugepages/hugepages-2048kB/free_hugepages',
    '/sys/fs/cgroup/system.slice/systemd-journald.service/cgroup.procs',
    '/sys/devices/system/cpu/cpu0/online',
    '/sys/devices/pci0000:00/0000:00:1f.2/ata1/host0/target0:0:0/0:0:0:0/block/sda/sda1/stat',
    '/sys/class/net/eth0/address',
    '/sys/firmware/acpi/tables/DSDT',
    '/sys/power/state',
    '/dev/console',
    '/dev/core',
    '/dev/disk/by-uuid/4f2c8d1e-7a52-4e61-9c3d-6b1f0a8e2d47',
    '/dev/fd/3',
    '/dev/kmsg',
    '/dev/mapper/vg0-root',
    '/dev/mqueue',
    '/dev/pts/0',
    '/dev/sda',
    '/dev/sda1',
    '/dev/sr0',
    '/dev/tty1',
    '/run/initramfs',
    '/run/lock',
    '/run/systemd/journal/socket',
    '/run/systemd/notify',
    '/run/udev/control',
    '/run/user/1000/bus',
];

// Real filesystem: these only start failing once the journal has aborted.
const RM_DISK_PATHS = [
    '/bin/bash',
    '/bin/systemctl',
    '/bin/rm',
    '/boot/grub/grub.cfg',
    '/boot/initrd.img-6.18.21-android17-5-g1454a86aeff7-ab16766518-4k',
    '/etc/fstab',
    '/etc/hostname',
    '/etc/ld.so.cache',
    '/etc/machine-id',
    '/etc/passwd',
    '/etc/shadow',
    '/etc/ssl/certs/ca-certificates.crt',
    '/etc/systemd/system/multi-user.target.wants/ssh.service',
    '/home/steve/.bash_history',
    '/home/steve/.ssh/authorized_keys',
    '/lib/systemd/systemd',
    '/lib/x86_64-linux-gnu/libc.so.6',
    '/lost+found',
    '/root/.bashrc',
    '/sbin/init',
    '/usr/bin/apt',
    '/usr/bin/dpkg',
    '/usr/lib/modules/6.18.21-android17-5-g1454a86aeff7-ab16766518-4k/kernel/fs/ext4/ext4.ko',
    '/usr/lib/python3.12/__pycache__/os.cpython-312.pyc',
    '/usr/share/locale/zh_CN/LC_MESSAGES/bash.mo',
    '/var/cache/apt/pkgcache.bin',
    '/var/lib/dpkg/status',
    '/var/log/syslog',
    '/var/spool/cron/crontabs/root',
    '/swap.img',
];

const RM_DISK_ERRORS = [
    'Structure needs cleaning',
    'Input/output error',
    'Stale file handle',
    'Directory not empty',
    'Read-only file system',
];

const RM_KERNEL_SYMBOLS = [
    'ext4_evict_inode',
    'ext4_free_inode',
    'ext4_es_remove_extent',
    'ext4_ext_tree_init',
    'ext4_lookup',
    'ext4_unlink',
    'ext4_dec_count',
    'ext4_orphan_del',
    'ext4_orphan_add',
    'ext4_handle_dirty_metadata',
    '__ext4_journal_stop',
    'ext4_journal_check_start',
    'jbd2_journal_commit_transaction',
    'jbd2_journal_stop',
    'jbd2_journal_start',
    'start_this_handle',
    'do_get_write_access',
    'jbd2_journal_get_write_access',
    'dput',
    '__dentry_kill',
    'dentry_unlink_inode',
    'evict',
    'dispose_list',
    'vfs_unlink',
    'do_unlinkat',
    '__x64_sys_unlink',
    '__x64_sys_unlinkat',
    'path_openat',
    'do_filp_open',
    'do_sys_openat2',
    'shrink_dcache_parent',
    'prune_dcache_sb',
    'super_cache_scan',
    'do_shrink_slab',
    'shrink_slab',
    'shrink_node',
    'balance_pgdat',
    'kcompactd',
    'kswapd',
    'process_one_work',
    'worker_thread',
    'kthread',
    'ret_from_fork',
    'ret_from_fork_asm',
    'blk_mq_dispatch_rq_list',
    'blk_mq_do_dispatch_sched',
    'blk_mq_run_hw_queue',
    'scsi_queue_rq',
    'ata_scsi_queuecmd',
    'ata_qc_issue',
    'ahci_handle_port_intr',
    'ahci_irq_handler',
    '__handle_irq_event',
    'handle_irq_event_percpu',
    'generic_handle_irq',
    'common_interrupt',
    'asm_common_interrupt',
    'flush_workqueue',
    'schedule',
    'schedule_timeout',
    'io_schedule_timeout',
    '__submit_bio',
    'submit_bh_wbc',
    'ext4_bread',
    'ext4_get_branch',
    'ext4_map_blocks',
    'ext4_writepages',
    'do_writepages',
    'filemap_fault',
    '__do_fault',
    'handle_mm_fault',
    'do_user_addr_fault',
    'exc_page_fault',
    'asm_exc_page_fault',
];

function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function pickRandom(items) {
    return items[randomInt(0, items.length - 1)];
}

function randomHex(length) {
    let value = '';
    for (let i = 0; i < length; i++) {
        value += '0123456789abcdef'[randomInt(0, 15)];
    }
    return value;
}

function randomKernelAddress() {
    return 'ffff' + randomHex(12);
}

function stepKernelClock(clock) {
    clock.value += 0.00001 + Math.random() * 0.00009;
    return '[' + clock.value.toFixed(6).padStart(12, ' ') + ']';
}

function traceFrame(symbol) {
    const size = 0x30 + randomInt(0, 0x4d0);
    return symbol + '+0x' + randomInt(0, size).toString(16) + '/0x' + size.toString(16);
}

function buildCallTrace(head, min, max, tail) {
    const frames = head.map(traceFrame);
    const middleCount = randomInt(min, max);
    for (let i = 0; i < middleCount; i++) {
        frames.push(traceFrame(pickRandom(RM_KERNEL_SYMBOLS)));
    }
    (tail || []).forEach((symbol) => frames.push(traceFrame(symbol)));
    return frames;
}

function buildRmKernelNoise() {
    const sector = randomInt(2048, 1953525167);
    const block = randomInt(0, 1048575);
    const pid = randomInt(300, 32768);
    return pickRandom([
        'blk_update_request: I/O error, dev sda, sector ' + sector + ' op 0x1:(WRITE) flags 0x800 phys_seg ' + randomInt(1, 8) + ' prio class 0',
        'Buffer I/O error on dev sda1, logical block ' + block + ', lost async page write',
        'EXT4-fs error (device sda1): ext4_lookup:' + randomInt(1600, 1800) + ': inode #2: comm rm: deleted inode referenced: ' + randomInt(2, 524287),
        'EXT4-fs error (device sda1): ext4_find_entry:' + randomInt(1400, 1500) + ': inode #2: comm rm: reading directory lblock 0',
        'JBD2: Detected IO errors while flushing file data on sda1-8',
        'EXT4-fs (sda1): Remounting filesystem read-only',
        'systemd-journald[' + pid + ']: Failed to write entry (' + randomInt(1, 40) + ' items, ' + randomInt(100, 9000) + ' bytes), ignoring: Read-only file system',
        'systemd[1]: systemd-journald.service: Main process exited, code=dumped, status=' + randomInt(4, 11) + '/SEGV',
    ]);
}

function rmErrorFor(path) {
    if (path === '/dev' || path.indexOf('/dev/') === 0) {
        return pickRandom(['Device or resource busy', 'Device or resource busy', 'Operation not permitted']);
    }
    if (path === '/proc' || path.indexOf('/proc/') === 0) {
        return pickRandom(['Operation not permitted', 'Operation not permitted', 'Permission denied']);
    }
    if (path === '/sys' || path.indexOf('/sys/') === 0) {
        return pickRandom(['Operation not permitted', 'Operation not permitted', 'Permission denied']);
    }
    if (path === '/run' || path.indexOf('/run/') === 0) {
        return 'Device or resource busy';
    }
    if (path.indexOf('/boot') === 0) {
        return 'Read-only file system';
    }
    return pickRandom(RM_DISK_ERRORS);
}

function buildRmFloodLine(stamp, clock) {
    const roll = Math.random();
    if (roll < 0.1) {
        return { text: stamp + ' ' + buildRmKernelNoise(), kernel: true };
    }
    if (roll < 0.13) {
        const name = pickRandom(RM_VIRTUAL_PATHS);
        return {
            text: stamp + ' audit: type=1400 audit(' + clock.value.toFixed(3) + ':' + randomInt(2, 9999) + '): apparmor="DENIED" operation="unlink" profile="/usr/bin/rm" name="' + name + '" pid=' + randomInt(300, 32768) + ' comm="rm" requested_mask="d" denied_mask="d" fsuid=0 ouid=0',
            kernel: true,
            color: '#ff6b6b',
        };
    }

    // The flood is dominated by the pseudo filesystems, because those are the
    // only trees that keep rejecting unlink() once / is being torn down.
    const path = roll < 0.78 ? pickRandom(RM_VIRTUAL_PATHS) : pickRandom(RM_DISK_PATHS);
    return { text: "rm: cannot remove '" + path + "': " + rmErrorFor(path) };
}

function appendFloodLines(lines) {
    if (!terminalHistory) return;
    const fragment = document.createDocumentFragment();
    lines.forEach((line) => {
        const element = document.createElement('div');
        element.className = 'terminal-line terminal-flood-line';
        if (line.color) element.style.color = line.color;
        element.textContent = line.text;
        fragment.appendChild(element);
    });
    terminalHistory.appendChild(fragment);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

/*
 * Parse rm arguments like getopt_long does: bundled short options
 * (`-rf`), long options with an optional `=value`, and `--` ending
 * option parsing so that `rm -rf -- /` still targets root.
 */
function parseRmOptions(rawArgs) {
    const opts = {
        force: false,
        recursive: false,
        dir: false,
        verbose: false,
        preserveRoot: 'root',
        operands: [],
        unknown: null,
        unknownLong: false,
        help: false,
        version: false,
    };
    let endOfOptions = false;

    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];

        if (endOfOptions) {
            opts.operands.push(arg);
            continue;
        }
        if (arg === '--') {
            endOfOptions = true;
            continue;
        }
        if (arg === '-') {
            opts.operands.push(arg);
            continue;
        }

        if (arg.charAt(0) === '-' && arg.charAt(1) === '-') {
            const eq = arg.indexOf('=');
            const name = eq === -1 ? arg : arg.slice(0, eq);
            const value = eq === -1 ? null : arg.slice(eq + 1);

            if (name === '--recursive') opts.recursive = true;
            else if (name === '--force') opts.force = true;
            else if (name === '--dir') opts.dir = true;
            else if (name === '--verbose') opts.verbose = true;
            else if (name === '--interactive') { /* the toy never prompts */ }
            else if (name === '--one-file-system') { /* irrelevant here */ }
            else if (name === '--preserve-root') opts.preserveRoot = value === 'all' ? 'all' : 'root';
            else if (name === '--no-preserve-root') opts.preserveRoot = 'none';
            else if (name === '--help') opts.help = true;
            else if (name === '--version') opts.version = true;
            else {
                opts.unknown = name;
                opts.unknownLong = true;
                return opts;
            }
            continue;
        }

        if (arg.charAt(0) === '-' && arg.length > 1) {
            for (let c = 1; c < arg.length; c++) {
                const ch = arg.charAt(c);
                if (ch === 'f') opts.force = true;
                else if (ch === 'r' || ch === 'R') opts.recursive = true;
                else if (ch === 'd') opts.dir = true;
                else if (ch === 'v') opts.verbose = true;
                else if (ch === 'i' || ch === 'I') { /* the toy never prompts */ }
                else {
                    opts.unknown = '-' + ch;
                    return opts;
                }
            }
            continue;
        }

        opts.operands.push(arg);
    }

    return opts;
}

function startRmEasterEgg() {
    if (rmEasterEggState !== 'idle') return;
    rmEasterEggState = 'flooding';

    if (terminalInput) {
        terminalInput.readOnly = true;
        terminalInput.blur();
    }

    const panicUptime = 325 + Math.random() * 820;
    const clock = { value: panicUptime - 1.5 };
    const freezeDelay = 5000 + Math.random() * 1900;
    const startedAt = Date.now();

    function pump() {
        if (rmEasterEggState !== 'flooding') return;
        if (Date.now() - startedAt >= freezeDelay) {
            freezeRmEasterEgg(clock, panicUptime);
            return;
        }

        const batch = [];
        const count = randomInt(2, 5);
        for (let i = 0; i < count; i++) {
            batch.push(buildRmFloodLine(stepKernelClock(clock), clock));
        }
        appendFloodLines(batch);

        rmFloodTimer = window.setTimeout(pump, randomInt(6, 20));
    }

    pump();
}

function freezePage() {
    document.documentElement.classList.add('rm-frozen');

    if (document.activeElement && typeof document.activeElement.blur === 'function') {
        try {
            document.activeElement.blur();
        } catch (error) {
            /* the page is about to die anyway */
        }
    }

    if (window.snow && typeof window.snow.stop === 'function') {
        try {
            window.snow.stop();
        } catch (error) {
            /* the page is about to die anyway */
        }
    }

    if (!document.body || rmFreezeCleanup) return;

    // Pin the viewport: a wedged kernel cannot scroll, focus or accept input.
    const lockedX = window.pageXOffset || 0;
    const lockedY = window.pageYOffset || 0;

    const overlay = document.createElement('div');
    overlay.id = 'rm-freeze-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483600;background:transparent;cursor:progress;touch-action:none;-webkit-user-select:none;user-select:none;';
    document.body.appendChild(overlay);

    const block = (event) => {
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    };

    // Every input path a browser exposes is swallowed by the overlay.
    const overlayEvents = [
        'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'click', 'dblclick',
        'auxclick', 'contextmenu', 'wheel', 'mousewheel', 'DOMMouseScroll',
        'touchstart', 'touchmove', 'touchend', 'touchcancel',
        'dragstart', 'drag', 'dragend', 'drop', 'dragover', 'selectstart',
        'paste', 'cut', 'copy',
    ];
    overlayEvents.forEach((type) => {
        overlay.addEventListener(type, block, { passive: false, capture: true });
    });

    // Keyboard, IME and form events never reach the page either.
    const windowEvents = [
        'keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'change',
        'focus', 'focusin', 'submit',
    ];
    windowEvents.forEach((type) => {
        window.addEventListener(type, block, { passive: false, capture: true });
    });

    // Scroll events cannot be cancelled, so snap the offset back instead.
    const pinScroll = () => {
        if (window.pageXOffset !== lockedX || window.pageYOffset !== lockedY) {
            window.scrollTo(lockedX, lockedY);
        }
    };
    window.addEventListener('scroll', pinScroll, { passive: true, capture: true });

    // Native inert removes the rest of the DOM from focus and hit testing.
    const inertSupported = 'inert' in HTMLElement.prototype;
    if (inertSupported) {
        Array.prototype.slice.call(document.body.children).forEach((child) => {
            if (child !== overlay) child.inert = true;
        });
    }

    rmFreezeCleanup = () => {
        overlayEvents.forEach((type) => overlay.removeEventListener(type, block, true));
        windowEvents.forEach((type) => window.removeEventListener(type, block, true));
        window.removeEventListener('scroll', pinScroll, true);
        if (inertSupported && document.body) {
            Array.prototype.slice.call(document.body.children).forEach((child) => {
                if (child !== overlay && child.inert) child.inert = false;
            });
        }
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
}

function freezeRmEasterEgg(clock, panicUptime) {
    rmEasterEggState = 'frozen';
    if (rmFloodTimer) {
        window.clearTimeout(rmFloodTimer);
        rmFloodTimer = null;
    }

    // Leave the last line half-painted, as if the compositor died mid-frame.
    const partial = buildRmFloodLine(stepKernelClock(clock), clock);
    const cutAt = Math.max(12, Math.floor(partial.text.length * (0.35 + Math.random() * 0.45)));
    appendFloodLines([{ text: partial.text.slice(0, cutAt), color: partial.color }]);

    // Actually wedge the main thread so the page stops responding for a moment.
    const stallUntil = Date.now() + 180 + Math.random() * 320;
    while (Date.now() < stallUntil) {
        /* burn the main thread */
    }

    freezePage();
    window.setTimeout(() => showKernelPanic(clock, panicUptime), 900 + Math.random() * 1500);
}

function thawPage() {
    if (rmFreezeCleanup) {
        try {
            rmFreezeCleanup();
        } catch (error) {
            /* nothing left to restore */
        }
        rmFreezeCleanup = null;
    }
    document.documentElement.classList.remove('rm-frozen');
}

function buildPanicLog(clock) {
    const out = [TUX_ART, ''];
    const emit = (text) => out.push(stepKernelClock(clock) + ' ' + text);
    const pid = randomInt(400, 32768);
    const kworkerPid = randomInt(20, 4000);
    const ripLine = 'RIP: 0010:ext4_evict_inode+0x' + randomInt(0x120, 0x5a0).toString(16) + '/0x6a0';
    const codeBytes = [];
    for (let i = 0; i < 16; i++) codeBytes.push(randomHex(2));

    emit('EXT4-fs error (device sda1): ext4_evict_inode:' + randomInt(210, 460) + ': comm rm: deleted inode referenced: ' + randomInt(2, 524287));
    emit('Aborting journal on device sda1-8.');
    emit('JBD2: Error -5 detected when updating journal superblock for sda1-8.');
    emit('EXT4-fs (sda1): Remounting filesystem read-only');
    emit('------------[ cut here ]------------');
    emit('kernel BUG at fs/ext4/inode.c:' + randomInt(1990, 2060) + '!');
    emit('invalid opcode: 0000 [#1] PREEMPT SMP NOPTI');
    emit('CPU: 0 UID: 0 PID: ' + pid + ' Comm: rm Tainted: G      D W  OE      6.18.21-android17-5-g1454a86aeff7-ab16766518-4k #45-ubuntu');
    emit('Hardware name: IBM PC/XT 5160 (Intel 8088 + Intel 8288, 1981)');
    emit(ripLine);
    emit('Code: ' + codeBytes.join(' ') + ' <...>');
    emit('RSP: 0018:' + randomKernelAddress() + ' EFLAGS: 000102' + randomHex(2).toUpperCase());
    emit('RAX: 0000000000000000 RBX: ' + randomKernelAddress() + ' RCX: 0000000000000000');
    emit('RDX: 0000000000000001 RSI: ' + randomKernelAddress() + ' RDI: ' + randomKernelAddress());
    emit('RBP: ' + randomKernelAddress() + ' R08: 0000000000000000 R09: 0000000000000000');
    emit('R10: ' + randomKernelAddress() + ' R11: ' + randomKernelAddress() + ' R12: ' + randomKernelAddress());
    emit('R13: ' + randomKernelAddress() + ' R14: 0000000000000000 R15: ' + randomKernelAddress());
    emit('FS:  0000000000000000(0000) GS:' + randomKernelAddress() + '(0000) knlGS:0000000000000000');
    emit('CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033');
    emit('CR2: fffffffffffffff8 CR3: ' + randomHex(16) + ' CR4: 0000000000f50ef0');
    emit('PKRU: 55555554');
    emit('Call Trace:');
    emit(' <TASK>');
    buildCallTrace(
        ['ext4_evict_inode', 'evict', '__dentry_kill', 'dput', 'vfs_unlink', 'do_unlinkat', '__x64_sys_unlink'],
        8, 18,
        ['do_syscall_64', 'entry_SYSCALL_64_after_hwframe']
    ).forEach((frame) => emit('  ' + frame));
    emit(' </TASK>');
    emit('---[ end trace ' + randomHex(16) + ' ]---');
    emit(ripLine);
    emit('note: rm[' + pid + '] exited with irqs disabled');
    out.push('');

    emit('watchdog: BUG: soft lockup - CPU#1 stuck for ' + randomInt(22, 27) + 's! [kworker/u8:3:' + kworkerPid + ']');
    emit('Modules linked in: ext4 mbcache jbd2 crc16 ahci libahci libata scsi_mod virtio_net i2c_piix4');
    emit('CPU: 1 PID: ' + kworkerPid + ' Comm: kworker/u8:3 Tainted: G      D W  OE      6.18.21-android17-5-g1454a86aeff7-ab16766518-4k #45-ubuntu');
    emit('Hardware name: IBM PC/XT 5160 (Intel 8088 + Intel 8288, 1981)');
    emit('Workqueue: writeback wb_workfn (flush-8:0)');
    emit('RIP: 0010:jbd2_journal_commit_transaction+0x' + randomInt(0x60, 0x7f0).toString(16) + '/0x8d0');
    emit('Code: ' + codeBytes.slice().reverse().join(' ') + ' <...>');
    emit('RSP: 0018:' + randomKernelAddress() + ' EFLAGS: 00010246');
    emit('RAX: 0000000000000000 RBX: ' + randomKernelAddress() + ' RCX: 0000000000000002');
    emit('RDX: 0000000000000000 RSI: ' + randomKernelAddress() + ' RDI: ' + randomKernelAddress());
    emit('Call Trace:');
    emit(' <TASK>');
    buildCallTrace(
        ['jbd2_journal_commit_transaction', 'kjournald2', 'kthread', 'ret_from_fork', 'ret_from_fork_asm'],
        6, 14,
        []
    ).forEach((frame) => emit('  ' + frame));
    emit(' </TASK>');
    out.push('');

    emit('Kernel panic - not syncing: Fatal exception in interrupt');
    emit('CPU: 1 PID: 0 Comm: swapper/1 Tainted: G      D W  OE      6.18.21-android17-5-g1454a86aeff7-ab16766518-4k #45-ubuntu');
    emit('Hardware name: IBM PC/XT 5160 (Intel 8088 + Intel 8288, 1981)');
    emit('Call Trace:');
    emit(' <IRQ>');
    buildCallTrace(
        ['ahci_irq_handler', '__handle_irq_event', 'handle_irq_event_percpu', 'generic_handle_irq'],
        8, 16,
        ['common_interrupt', 'asm_common_interrupt']
    ).forEach((frame) => emit('  ' + frame));
    emit(' </IRQ>');
    emit('Kernel Offset: 0x' + randomInt(0x10000000, 0x3e000000).toString(16) + ' from 0xffffffff81000000 (relocation range: 0xffffffff80000000-0xffffffffbfffffff)');
    emit('---[ end Kernel panic - not syncing: Fatal exception in interrupt ]---');

    return out;
}

function buildPanicOverflowLog(clock) {
    const out = [''];
    const emit = (text) => out.push(stepKernelClock(clock) + ' ' + text);

    emit('Kernel panic - not syncing: stack-protector: Kernel stack is corrupted in: panic+0x1e7/0x340');
    emit('CPU: 0 PID: 0 Comm: swapper/0 Tainted: G      D W  OE      6.18.21-android17-5-g1454a86aeff7-ab16766518-4k #45-ubuntu');
    emit('Hardware name: IBM PC/XT 5160 (Intel 8088 + Intel 8288, 1981)');
    emit('Call Trace:');
    emit(' <TASK>');
    emit('  __stack_chk_fail+0x' + randomInt(0x10, 0x70).toString(16) + '/0x80');

    const depth = randomInt(140, 280);
    for (let i = 0; i < depth; i++) {
        emit('  panic+0x' + randomInt(0x100, 0x2e0).toString(16) + '/0x340');
    }

    emit('  secondary_startup_64_no_verify+0x' + randomInt(0x10, 0xd0).toString(16) + '/0x' + randomInt(0xd0, 0x180).toString(16));
    emit(' </TASK>');
    emit('---[ end Kernel panic - not syncing: stack-protector: Kernel stack is corrupted in: panic+0x1e7/0x340 ]---');

    return out;
}

function streamPanicOverflow(screen, clock) {
    if (!screen || rmEasterEggState === 'idle') return;
    rmEasterEggState = 'overflow';

    // The second panic happens a few (virtual) seconds after the first one.
    clock.value += randomInt(2, 47) + Math.random();

    const lines = buildPanicOverflowLog(clock);
    let index = 0;

    function pushChunk() {
        const chunk = lines.slice(index, index + randomInt(8, 20));
        index += chunk.length;
        screen.appendChild(document.createTextNode('\n' + chunk.join('\n')));
        screen.scrollTop = screen.scrollHeight;
        if (index < lines.length) {
            window.setTimeout(pushChunk, randomInt(25, 80));
        }
    }

    pushChunk();
}

function showKernelPanic(clock, panicUptime) {
    if (rmEasterEggState === 'panic' || rmEasterEggState === 'overflow') return;
    rmEasterEggState = 'panic';

    thawPage();
    document.documentElement.style.background = '#000';
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = '';

    const screen = document.createElement('pre');
    screen.id = 'kernel-panic-screen';
    screen.style.cssText = 'position:fixed;inset:0;margin:0;padding:1rem 1.25rem;background:#000;color:#c8c8c8;font:16px/1.25 "Consolas","DejaVu Sans Mono","Courier New",monospace;white-space:pre-wrap;word-break:break-word;overflow:auto;z-index:99999;font-weight:normal;';
    document.body.appendChild(screen);

    clock.value = panicUptime;
    screen.textContent = buildPanicLog(clock).join('\n');

    window.setTimeout(() => streamPanicOverflow(screen, clock), 1400 + Math.random() * 1600);
}

if (terminalContainer) {


    if (terminalDotClose) {

        terminalDotClose.addEventListener('click', (event) => {

            event.stopPropagation();

            setTerminalOpen(false);

        });

    }



    terminalContainer.addEventListener('click', () => {

        if (terminalContainer.classList.contains('is-open') && terminalInput) {

            terminalInput.focus();

        }

    });



    if (terminalInput) {
        terminalInput.addEventListener('input', () => {
            tabState = null;
        });

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                handleTabCompletion();
                return;
            }

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                if (isPasswordInput) {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                tabState = null;
                if (!commandHistory.length) return;

                if (e.key === 'ArrowUp') {
                    if (historyIndex === commandHistory.length) {
                        historyDraft = terminalInput.value;
                    }
                    historyIndex = Math.max(0, historyIndex - 1);
                    setTerminalInputValue(commandHistory[historyIndex]);
                } else if (historyIndex < commandHistory.length) {
                    historyIndex++;
                    setTerminalInputValue(
                        historyIndex === commandHistory.length
                            ? historyDraft
                            : commandHistory[historyIndex]
                    );
                }
                return;
            }

            if (e.key === 'Enter') {
                tabState = null;
                if (isPasswordInput) {
                    handlePasswordInput();
                } else {
                    const cmdLine = terminalInput.value.trim();
                    if (cmdLine && commandHistory[commandHistory.length - 1] !== cmdLine) {
                        commandHistory.push(cmdLine);
                    }
                    historyIndex = commandHistory.length;
                    historyDraft = '';
                    handleCommand(cmdLine);
                }
                terminalInput.value = '';
            }
        });
    }

    document.addEventListener('keydown', (event) => {

        if (rmEasterEggState !== 'idle') return;

        if (event.key === 'Escape' && terminalContainer.classList.contains('is-open')) {

            setTerminalOpen(false);

        }

    });

}



function appendTerminalLine(text, color, preserveWhitespace) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (color) line.style.color = color;
    if (preserveWhitespace) line.style.whiteSpace = 'pre-wrap';
    line.textContent = text;
    terminalHistory.appendChild(line);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

function setPasswordPrompt(text) {
    if (activePrompt) {
        activePrompt.classList.add('terminal-password-prompt');
        activePrompt.textContent = text;
    }
    if (terminalInput) {
        terminalInput.classList.add('is-password');
    }
}

function handlePasswordInput() {
    if (isPasswordInput === 'su') {
        appendTerminalLine(t('su_insult'), '#ff6b6b');
        appendTerminalLine(t('su_auth_failure'), '#ff6b6b');
        isPasswordInput = false;
        updatePrompts();
        return;
    }

    if (isPasswordInput === 'sudo') {
        sudoAttempts++;
        if (sudoAttempts >= 3) {
            appendTerminalLine(t('sudo_auth_failure'), '#ff6b6b');
            sudoAttempts = 0;
            isPasswordInput = false;
            updatePrompts();
        } else {
            appendTerminalLine(t('sudo_wrong_password'), '#ff6b6b');
            setPasswordPrompt(t('sudo_password_prompt').replace('{user}', promptUser.split('@')[0]));
        }
    }
}

function handleCommand(cmdLine) {

    if (!cmdLine) return;

    if (rmEasterEggState !== 'idle') return;

    const args = cmdLine.split(/\s+/);

    const cmd = args[0].toLowerCase();

    const target = args[1];



    // Add command to history

    const line = document.createElement('div');

    line.className = 'terminal-line';

    line.innerHTML = `<span class="terminal-prompt">${promptHtml(currentPath)}</span> <span>${escapeTerminalText(cmdLine)}</span>`;

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
            isPasswordInput = 'su';
            setPasswordPrompt(t('su_password_prompt'));
            break;
        case 'sudo':
            if (args.length < 2) {
                response.textContent = t('sudo_usage');
            } else {
                if (!lectureShown) {
                    appendTerminalLine(t('sudo_lecture'), '#ffffff', true);
                    lectureShown = true;
                }
                isPasswordInput = 'sudo';
                sudoAttempts = 0;
                setPasswordPrompt(t('sudo_password_prompt').replace('{user}', promptUser.split('@')[0]));
            }
            break;
        case 'cat':

            if (!target) {

                response.innerHTML = 'cat: missing operand';

            } else if (target === 'about.me' || (currentPath === '~' && target === 'about.me')) {

                response.textContent = t('terminal_bio');

            } else if (currentPath === '~/projects') {

                const repo = getRepos().find(r => r.name.toLowerCase() === target.toLowerCase());

                if (repo) {

                    window.open(repo.html_url, '_blank');

                    response.innerHTML = `Opening ${repo.name}...`;

                } else {

                    response.innerHTML = `cat: ${escapeTerminalText(target)}: No such file or directory`;

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

                    response.innerHTML = `cat: ${escapeTerminalText(target)}: No such file or directory`;

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

                response.innerHTML = `cat: ${escapeTerminalText(target)}: No such file or directory`;

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

                const topProjects = [...getRepos()]

                    .sort((a, b) => b.stargazers_count - a.stargazers_count)

                    .slice(0, 8)

                    .map(r => `<a href="${r.html_url}" target="_blank" class="terminal-project">${r.name}</a>`)

                    .join(' ');

                response.innerHTML = topProjects || 'No projects found.';

            } else if (fs[fullPath]) {

                response.innerHTML = fs[fullPath].join('  ');

            } else if (fullPath === '~/about.me') {

                response.textContent = t('terminal_bio');

            } else {

                response.innerHTML = `ls: cannot access '${escapeTerminalText(lsTarget)}': No such file or directory`;

            }

            break;

        case 'cd':

            let cdTarget = target ? target.replace(/\/$/, '') : '~';

            

            // Check for projects (Global search for convenience)

            const project = getRepos().find(r => r.name.toLowerCase() === cdTarget.toLowerCase());

            if (project) {

                window.open(project.html_url, '_blank');

                response.innerHTML = `Opening ${escapeTerminalText(project.name)}...`;

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

                 response.innerHTML = `Opening ${escapeTerminalText(cdTarget)}...`;

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

                    response.innerHTML = `cd: ${escapeTerminalText(target)}: No such directory`;

                }

            }

            updatePrompts();

            if (response.innerHTML) terminalHistory.appendChild(response);

            terminalHistory.scrollTop = terminalHistory.scrollHeight;

            return;

        case 'whoami':

            response.textContent = t('terminal_bio');

            break;

        case 'theme':

            deps.themeToggle.click();

            response.innerHTML = `Theme switched to ${document.documentElement.getAttribute('data-theme')}`;

            break;

        case 'lang':

            deps.langToggle.click();

            response.innerHTML = `Language switched to ${document.documentElement.lang}`;

            break;

        case 'blog':

            window.open('https://blog.stevezmt.top', '_blank');

            response.innerHTML = 'Opening blog...';

            break;

        case 'contact':

            response.innerHTML = 'Email &amp; iMessage: <a href="mailto:me@stevezmt.top">me@stevezmt.top</a> | GitHub: <a href="https://github.com/stevezmtstudios" target="_blank">@stevezmtstudios</a> | Telegram: <a href="https://t.me/stevezmt" target="_blank">@stevezmt</a> | RCS: <a href="sms:+37257243638">+372 5724-3638</a>';

            break;

        case 'rm': {
            const opts = parseRmOptions(args.slice(1));

            if (opts.unknown) {
                appendTerminalLine(
                    t(opts.unknownLong ? 'rm_unrecognized_option' : 'rm_invalid_option').replace('{opt}', opts.unknown)
                );
                appendTerminalLine(t('rm_help_hint'));
                return;
            }

            if (opts.help) {
                response.textContent = 'Usage: rm [OPTION]... [FILE]...';
                break;
            }

            if (opts.version) {
                response.textContent = 'rm (GNU coreutils) 9.4';
                break;
            }

            if (!opts.operands.length) {
                response.innerHTML = escapeTerminalText(t('rm_missing_operand')) +
                    '<br>' + escapeTerminalText(t('rm_help_hint'));
                break;
            }

            let rootNuked = false;

            opts.operands.forEach((path) => {
                // GNU rm only refuses a literal root path, and only when the
                // recursive flag is in play (--preserve-root is the default).
                if (/^\/+$/.test(path)) {
                    if (opts.recursive && opts.preserveRoot !== 'none') {
                        appendTerminalLine(t('rm_dangerous_root').replace('{path}', '/'));
                        appendTerminalLine(t('rm_use_no_preserve_root'));
                        return;
                    }
                    if (!opts.recursive && !opts.dir) {
                        appendTerminalLine(t('rm_is_a_directory').replace('{path}', '/'));
                        return;
                    }
                    rootNuked = true;
                    return;
                }

                // bash expands `/*` before rm ever sees it; without -r every
                // entry is reported as a directory instead of being removed.
                if (path === '/*' || path === '//*' || path === '/./*') {
                    if (!opts.recursive && !opts.dir) {
                        RM_ROOT_ENTRIES.forEach((entry) => {
                            appendTerminalLine(t('rm_is_a_directory').replace('{path}', entry));
                        });
                        return;
                    }
                    rootNuked = true;
                    return;
                }

                // rm has refused '.' and '..' since coreutils 8.22.
                if (path === '.' || path === '..' || /(^|\/)\.\.?$/.test(path)) {
                    appendTerminalLine(t('rm_refuse_dot').replace('{path}', path));
                    return;
                }

                const toyName = normalizeToyPath(path);
                const isToyDir = toyName === '' || toyName === 'projects' || toyName === 'blogs' || toyName === 'contact';

                if (isToyDir && !opts.recursive && !opts.dir) {
                    appendTerminalLine(t('rm_is_a_directory').replace('{path}', path));
                    return;
                }

                if (!isExistingToyPath(path)) {
                    if (!opts.force) {
                        appendTerminalLine(t('rm_no_such_file').replace('{path}', path));
                    }
                    return;
                }

                if (opts.force) {
                    const name = path.replace(/^.*\//, '') || path;
                    appendTerminalLine(t('rm_avc').replace('{name}', name), '#ff6b6b');
                }
                appendTerminalLine(t('rm_permission_denied').replace('{path}', path));
            });

            if (rootNuked) {
                startRmEasterEgg();
            }
            return;
        }
        default:

            response.innerHTML = `Command not found: ${escapeTerminalText(cmd)}. Type 'help' for assistance.`;

    }



    if (response.innerHTML.trim() || response.textContent.trim()) {
        terminalHistory.appendChild(response);
        terminalHistory.scrollTop = terminalHistory.scrollHeight;
    }
}

    function init(options) {
        if (initialized) return api;
        deps = options || {};
        initialized = true;
        setTerminalOpen(false);
        updatePrompts();
        return api;
    }

    function toggle() {
        if (!initialized || !terminalContainer) return;
        setTerminalOpen(!terminalContainer.classList.contains('is-open'));
    }

    function open() {
        if (initialized) setTerminalOpen(true);
    }

    function close() {
        if (initialized) setTerminalOpen(false);
    }

    const api = { init: init, toggle: toggle, open: open, close: close };
    window.SiteTerminal = api;
})();
