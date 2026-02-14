# template and rule
```json
{
    "title": "公告标题",
    "type": "公告类型", // info warn err fatal
    /* 
    info - 一般信息公告，遵循主题色
    warn - 警告公告，黄色感叹号图标
    err - 错误公告，红色叉号图标
    fatal - 重要公告，访问页面前弹窗
    banner - 横幅公告，页面顶部横幅展示，会忽略title字段
    */
    "date": "2026-02-14", // 可选，公告日期，格式为 YYYY-MM-DD，目前不使用
    "date_end": "2027-02-14", // 可选，公告截止日期，超过截止日期后公告不再显示，若type为fatal则此项无效
    "content": [
        "公告内容",
        "公告内容",
        "公告内容"
        /*
        公告内容可以是纯文本，也可以包含HTML标签，例如：
        "<b>加粗文本</b>",
        "<i>斜体文本</i>",
        "<a href='https://example.com'>链接文本</a>"
        */
    ], 
    "variable": {
        "icon": "moon", // 使用material-symbols图标，详见：https://fonts.google.com/icons
        "href": "https://example.com", // 可选，公告链接地址，点击公告内容会跳转到此链接
        "_blank": true, // 可选，是否在新标签页打开链接，默认为true
        "custom_html": "<div class='custom-announce'>自定义HTML内容</div>", // 可选，公告自定义HTML内容，当此项存在时，以上全部项都会被忽略，直接在公告展示的位置插入此div
        "custom_css": "font-size: 18px; font-weight: bold;", // 可选，公告自定义CSS样式
        "custom_js": "console.log('公告已加载');", // 可选，公告自定义JavaScript代码
    }
},
{
    "title": "横幅公告示例",
    "type": "banner",
    "content": [
        "这是一个横幅公告，显示在页面顶部。"
    ]
},
{
    "title": "重要公告示例",
    "type": "fatal",
    "content": [
        "这是一个重要公告，访问页面前会弹窗显示。"
    ]
}
```