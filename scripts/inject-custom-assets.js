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
