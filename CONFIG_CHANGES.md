# _config.yml 修改说明（二次优化）

## 检查点 1：确认摘要长度配置

查找并确认以下配置（应该已存在）：

```yaml
# Excerpt settings
excerpt_link: 阅读全文 »
auto_excerpt:
  enable: true
  length: 150  # 已优化为 150 字符
```

**无需修改**（第一轮已优化）

---

## 检查点 2：确认 Feed/Search/Sitemap 插件

查找并确认以下配置：

```yaml
# Search
search:
  path: search.xml
  field: post
  content: true
  format: html

# Feed
feed:
  enable: true
  type: atom
  path: atom.xml
  limit: 20
  hub:
  content: true
  content_limit: 140
  content_limit_delim: ' '
  order_by: -date
  icon: icon.png
  autodiscovery: true
  template:
```

**验证方式**：
```bash
ls -la /root/website/hexo/public/search.xml
ls -la /root/website/hexo/public/atom.xml
```

如果文件存在 → 插件已启用，无需修改  
如果文件不存在 → 需安装插件：

```bash
cd /root/website/hexo
npm install hexo-generator-search --save
npm install hexo-generator-feed --save
```

---

## 检查点 3：Sitemap 插件（可选，SEO增强）

如果希望生成 `sitemap.xml`，添加以下配置：

```yaml
# Sitemap（新增）
sitemap:
  path: sitemap.xml
  template: ./sitemap_template.xml
  rel: false
  tags: true
  categories: true
```

**安装插件**：
```bash
npm install hexo-generator-sitemap --save
```

**验证**：
```bash
hexo generate
ls -la public/sitemap.xml
```

---

## 检查点 4：Robots.txt 生成（可选）

如果希望生成 `robots.txt`，添加：

```yaml
# Robots.txt（新增）
robotstxt:
  useragent: "*"
  disallow:
    - /404.html
  allow:
    - /
  sitemap: https://md.zeelool.asia/sitemap.xml
```

**安装插件**：
```bash
npm install hexo-generator-robotstxt --save
```

---

## 最终建议

### 必须修改（如果尚未配置）
- ✅ `auto_excerpt.length: 150`（已完成）

### 建议添加（SEO增强）
- ⚡ Sitemap 插件（提升搜索引擎收录）
- ⚡ Robots.txt 插件（规范爬虫行为）

### 无需修改
- ✅ Feed 配置（已存在）
- ✅ Search 配置（已存在）

---

## 完整配置参考（仅新增部分）

在 `_config.yml` 末尾追加：

```yaml
# ========================================
# SEO 增强 - 2026-02-07
# ========================================

# Sitemap 生成
sitemap:
  path: sitemap.xml
  rel: false
  tags: true
  categories: true

# Robots.txt 生成
robotstxt:
  useragent: "*"
  disallow:
    - /404.html
    - /search/
  allow:
    - /
  sitemap: https://md.zeelool.asia/sitemap.xml
```

**安装命令**：
```bash
cd /root/website/hexo
npm install hexo-generator-sitemap hexo-generator-robotstxt --save
hexo clean && hexo generate
```

**验证**：
```bash
curl -I https://md.zeelool.asia/sitemap.xml
curl https://md.zeelool.asia/robots.txt
```
