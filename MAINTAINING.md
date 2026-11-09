# 维护说明

## 首页 / 旧版页

首页和 `k/` 仍由 Node 构建：

| 想改什么 | 改哪里 |
|---|---|
| 文案、链接、卡片、联系方式、统计图、终端内容、页脚 | `site.yml` |
| 首页结构 | `_templates/index.template.html` |
| 旧版页结构 | `_templates/legacy.template.html` |

运行：

```bash
npm run build
```

生成：

- `index.html`
- `k/index.html`
- `assets/js/home-i18n.js`

**不要直接编辑这几个生成文件**，下次构建会覆盖它们。

## 支付 / 协议页面

`support/`、`terms/`、`refund/`、`privacy/`、`contact/` 现在是 Jekyll + Markdown 页面，使用远程主题：

```yaml
remote_theme: SteveZMTstudios/jekyll-mdui-theme
```

| 想改什么 | 改哪里 |
|---|---|
| 每页正文 | `_pages/<id>.md` |
| 页面标题、描述、permalink | `_pages/<id>.md` 的 front matter |
| 支付价格、Stripe 链接、商户信息 | `_data/payment.yml` |
| 三档支付卡片 | `_pages/support.md` 里的 `.pay-cards` HTML；外观在 `assets/css/legal.css` |
| 顶部页面导航、相关页面 | `_data/legal_nav.yml` + `_includes/legal-nav.html` / `_includes/legal-related.html` |
| 主题布局 | 远程主题 `SteveZMTstudios/jekyll-mdui-theme`；需要本地覆盖时放在 `_layouts/` 或 `_includes/` |

Markdown 正文里的支付数据直接写 Liquid：

```markdown
{{ site.data.payment.priceStarter }}
{{ site.data.payment.payLinkStarter }}
```

添加页面：

1. 新建 `_pages/<id>.md`，写 front matter：

   ```yaml
   ---
   layout: default
   title: "页面标题"
   nav_title: "短标题"
   description: "页面描述"
   permalink: /<id>/
   ---
   ```

2. 在正文里加：

   ```markdown
   {% include legal-nav.html %}
   ...
   {% include legal-related.html current="<id>" %}
   ```

3. 在 `_data/legal_nav.yml` 增加导航项。

4. 运行 `jekyll build`，或直接推送到 GitHub Pages。

**不要编辑 `_site/`**，它是 Jekyll 输出目录，已在 `.gitignore` 中。

## 图标字体

首页和主题页面在图标字体加载完成前会先隐藏 `material-symbols-outlined` / `material-icons` 的 ligature 文本，字体就绪后再显示（`html.icons-loading` → `html.icons-ready`）。图标元素固定为 `1em` 方块并裁剪溢出内容，弱网时不会用图标单词把布局撑开。

相关位置：

- 首页：`_templates/index.template.html`、`assets/css/main.css`
- 主题页面：`_includes/head-custom.html`、`assets/css/legal.css`

## 本地构建

```bash
# 首页 / 旧版页
npm run build

# 整站 Jekyll（支付 / 协议页、主题资源）
jekyll build

# 本地预览
jekyll serve
```

GitHub Pages 推送后会自动运行 Jekyll。

## 404

```bash
npm run build:404   # 只生成 404.html
npm run build:all   # 首页 + 旧版页 + 404
```

## 依赖

```bash
npm install
```

YAML 由 `js-yaml` 读取；Jekyll 页面使用本机已有的 Ruby / Jekyll，或 GitHub Pages 的构建环境。

## 已移除的旧方案

支付 / 协议页不再由 `scripts/build-pages.js` 生成，也不再使用 `_templates/page.template.html`、`site.yml` 的 `pages` 元数据，或旧的 `assets/js/site-config.js` / `pages.js` / `pages.css`。

## 还没生成的部分

`index.md`（GitHub 个人主页 README）仍是独立内容，并已在 `_config.yml` 的 `exclude` 中排除，不参与站点构建。

## 松散文件

`.qrz.com_db_bg5gky.page.html` 是 QRZ.com 上的个人主页，手动维护。
