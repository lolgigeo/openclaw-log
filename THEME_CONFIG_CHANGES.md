# themes/prontera/_config.yml 修改说明（二次优化）

## 问题分析

prontera 主题**没有内置 CSS/JS 注入点**（查看主题配置文件可见）。

## 解决方案：无需修改主题配置

我们已通过 Hexo 脚本注入实现了自定义资源加载。

---

## 当前注入机制（无需改模板）

### 方式 1：Hexo 脚本注入（✅ 已采用）

文件位置：`/root/website/hexo/scripts/inject-custom-assets.js`

```javascript
/**
 * Hexo 自定义资源注入脚本
 * 自动注入 custom.css 和 custom.js 到所有页面
 */

hexo.extend.filter.register('after_render:html', function(htmlContent) {
  // 注入自定义 CSS 到 </head> 之前
  const customCSS = '<link rel="stylesheet" href="/css/custom.css">';
  htmlContent = htmlContent.replace('</head>', customCSS + '\n</head>');
  
  // 注入自定义 JS 到 </body> 之前
  const customJS = '<script src="/js/custom.js"></script>';
  htmlContent = htmlContent.replace('</body>', customJS + '\n</body>');
  
  return htmlContent;
});
```

**优点**：
- ✅ 不修改主题模板
- ✅ 自动应用到所有页面
- ✅ 易于回滚（删除脚本文件即可）

**验证**：
```bash
# 生成站点
hexo generate

# 检查注入是否成功
grep -E "(custom\.css|custom\.js)" public/index.html

# 输出示例：
# <link rel="stylesheet" href="/css/custom.css">
# <script src="/js/custom.js"></script>
```

---

## 替代方案（如果脚本注入失效）

### 方式 2：修改主题模板（不推荐，但可作为备选）

如果 Hexo 脚本注入失效，可以直接修改主题模板：

#### 修改 `themes/prontera/layout/partial/head.jade`

在文件末尾添加：

```jade
//- Custom CSS
link(rel="stylesheet", href=url_for("/css/custom.css"))
```

#### 修改 `themes/prontera/layout/partial/scripts.jade`

在文件末尾添加：

```jade
//- Custom JS
script(src=url_for("/js/custom.js"))
```

**⚠️ 缺点**：修改了主题文件，升级主题时可能被覆盖

---

## 推荐方案总结

| 方案 | 优先级 | 侵入性 | 可维护性 |
|------|--------|--------|----------|
| Hexo 脚本注入（当前） | ⭐⭐⭐⭐⭐ | 低 | 高 |
| 修改主题模板 | ⭐⭐ | 高 | 中 |

**结论**：继续使用 Hexo 脚本注入，无需修改主题配置。

---

## 验证自定义资源是否生效

### 1. 检查生成的 HTML

```bash
cat /root/website/hexo/public/index.html | grep -A2 -B2 "custom"
```

预期输出：
```html
<link rel="stylesheet" href="/css/custom.css">
...
<script src="/js/custom.js"></script>
```

### 2. 检查浏览器网络面板

访问 https://md.zeelool.asia，打开浏览器开发者工具（F12）：

- **Network** 面板中应看到：
  - `custom.css` (200 OK)
  - `custom.js` (200 OK)

- **Console** 面板中不应有错误

### 3. 功能测试

- 代码块悬停是否显示复制按钮
- 滚动页面是否显示回到顶部按钮
- 顶部是否有阅读进度条
- 标题悬停是否显示 # 锚点

---

## 故障排除

### 问题 1：自定义 CSS/JS 未加载

**可能原因**：
- Hexo 版本过旧，不支持 `after_render:html` 钩子
- scripts 目录未被识别

**解决方案**：
```bash
cd /root/website/hexo

# 检查 Hexo 版本
hexo version

# 如果版本 < 5.0，升级 Hexo
npm update hexo

# 清理缓存重新生成
hexo clean
hexo generate
```

### 问题 2：注入成功但样式未生效

**可能原因**：
- CSS 选择器优先级不足
- 主题自带样式覆盖了自定义样式

**解决方案**：
在 `custom.css` 中使用更高优先级的选择器：

```css
/* 错误示例 */
.post-title { color: blue; }

/* 正确示例（提高优先级） */
.home.post-list .post-title,
.post-list .post-title { color: blue !important; }
```

### 问题 3：JS 功能失效

**可能原因**：
- DOM 结构与预期不符
- JS 执行时机过早（DOM 未加载完成）

**解决方案**：
打开浏览器 Console，检查错误信息：

```javascript
// 如果看到 "querySelector returned null"
// 说明选择器不匹配，需调整选择器
```

手动在 Console 执行：
```javascript
window.customScriptsReinit(); // 重新初始化所有功能
```

---

## 最终结论

**无需修改 `themes/prontera/_config.yml`**

所有自定义资源通过 Hexo 脚本自动注入，保持主题文件的纯净性。

如有问题，请参考上述故障排除步骤。
