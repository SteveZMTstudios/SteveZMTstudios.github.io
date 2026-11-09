/*
 * Applied before the stylesheets so the first paint already uses
 * the saved theme and language (no light/dark flash).
 */
(function () {
    var root = document.documentElement;
    var lang = null;
    var theme = null;

    try {
        lang = window.localStorage.getItem('site.lang');
        theme = window.localStorage.getItem('site.theme');
    } catch (e) { /* ignore */ }

    if (!lang) {
        var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
        lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
    }
    if (!theme) {
        theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'dark'
            : 'light';
    }

    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
    root.setAttribute('data-theme', theme);
    root.classList.toggle('mdui-theme-dark', theme === 'dark');
    root.classList.toggle('mdui-theme-light', theme !== 'dark');
})();
