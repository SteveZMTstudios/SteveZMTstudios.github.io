const fs = require('fs');
const babel = require('@babel/core');
const postcss = require('postcss');
const postcssPresetEnv = require('postcss-preset-env');
const esbuild = require('esbuild'); // 引入 esbuild 用于打包内联代码

async function build() {
    let html = fs.readFileSync('404.src.html', 'utf-8');

    // 1. 处理 CSS (处理 <style> 标签内容)
    const cssRegex = /<style>([\s\S]*?)<\/style>/g;
    html = await replaceAsync(html, cssRegex, async (match, cssCode) => {
        const result = await postcss([
            postcssPresetEnv({
                browsers: 'safari >= 5, iOS >= 5, Android >= 4.0, ie >= 9',
                stage: 2,
                autoprefixer: {
                    flexbox: 'no-2009' // 关键：禁止生成 2009 版 -webkit-box 弹性盒，规避 Safari 5 尺寸计算坍塌为 0 导致内部全空的 Bug
                }
            })
        ]).process(cssCode, { from: undefined });
        return `<style>${result.css}</style>`;
    });

    // 2. 处理 JS (处理 <script> 标签内容)
    const jsRegex = /<script>([\s\S]*?)<\/script>/g;
    html = html.replace(jsRegex, (match, jsCode) => {
        if (match.includes('src=')) return match;

        // A. Babel 负责分析缺失的 API 并生成 CommonJS require 指令（避免生成带 .bind 的 ESM helper）
        const babelResult = babel.transformSync(jsCode, {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: 'safari >= 5, iOS >= 5, Android >= 4.0, ie >= 9',
                        modules: 'commonjs'
                    }
                ]
            ],
            plugins: [
                [
                    'babel-plugin-polyfill-corejs3',
                    {
                        method: 'usage-global',
                        targets: 'safari >= 5, iOS >= 5, Android >= 4.0, ie >= 9'
                    }
                ]
            ]
        });

        // B. esbuild 负责打包展开为自包含的 ES5 IIFE 代码
        const bundled = esbuild.buildSync({
            stdin: {
                contents: babelResult.code,
                resolveDir: __dirname // 确保 esbuild 能找到 node_modules
            },
            bundle: true,
            write: false,
            target: 'es5',
            format: 'iife'
        });

        // C. 替换为完全自包含的 ES5 代码
        return `<script>${bundled.outputFiles[0].text}</script>`;
    });

    // 3. 输出始终为 404.html
    fs.writeFileSync('404.html', html);
    console.log('✅ 兼容版单文件生成完毕：404.html');
}

async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        promises.push(asyncFn(match, ...args));
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}

build();
