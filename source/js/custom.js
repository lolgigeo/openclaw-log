/**
 * Hexo 文档站自定义脚本
 * 包含：代码块复制按钮、回到顶部、图片懒加载
 */

(function() {
  'use strict';
  
  // ===========================================
  // 1. 代码块复制按钮
  // ===========================================
  function addCopyButtons() {
    var codeBlocks = document.querySelectorAll('pre code, .highlight, pre');
    
    codeBlocks.forEach(function(block) {
      // 找到最外层的 pre 元素
      var pre = block.tagName === 'PRE' ? block : block.closest('pre');
      if (!pre || pre.querySelector('.copy-btn')) return; // 避免重复添加
      
      // 创建复制按钮
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2z"/><path d="M2 6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H2z"/></svg>';
      btn.setAttribute('aria-label', '复制代码');
      btn.title = '复制代码';
      
      // 复制功能
      btn.onclick = function() {
        var code = block.innerText || block.textContent;
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code).then(function() {
            // 显示成功图标
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>';
            btn.classList.add('copied');
            
            // 2秒后恢复
            setTimeout(function() {
              btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2z"/><path d="M2 6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H2z"/></svg>';
              btn.classList.remove('copied');
            }, 2000);
          }).catch(function(err) {
            console.error('复制失败:', err);
          });
        } else {
          // 降级方案：使用 execCommand
          var textarea = document.createElement('textarea');
          textarea.value = code;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            btn.innerHTML = '✓';
            setTimeout(function() {
              btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2z"/><path d="M2 6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H2z"/></svg>';
            }, 2000);
          } catch (err) {
            console.error('复制失败:', err);
          }
          document.body.removeChild(textarea);
        }
      };
      
      // 确保 pre 有相对定位
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }
  
  // ===========================================
  // 2. 回到顶部按钮
  // ===========================================
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3l-7 7h4v7h6v-7h4z"/></svg>';
    btn.setAttribute('aria-label', '回到顶部');
    btn.title = '回到顶部';
    document.body.appendChild(btn);
    
    // 显示/隐藏逻辑
    function toggleButton() {
      if (window.pageYOffset > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }
    
    // 点击滚动到顶部
    btn.onclick = function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // 监听滚动事件
    var scrollTimer = null;
    window.addEventListener('scroll', function() {
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      scrollTimer = setTimeout(toggleButton, 50);
    });
    
    toggleButton();
  }
  
  // ===========================================
  // 3. 图片懒加载
  // ===========================================
  function initLazyLoad() {
    // 如果浏览器支持原生懒加载
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(function(img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
      return;
    }
    
    // 降级方案：Intersection Observer
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px'
      });
      
      images.forEach(function(img) {
        imageObserver.observe(img);
      });
    } else {
      // 最终降级：直接加载所有图片
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(function(img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }
  
  // ===========================================
  // 4. 阅读进度条
  // ===========================================
  function initReadingProgress() {
    // 只在文章页面显示
    if (!document.querySelector('.article-entry')) return;
    
    var progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    document.body.appendChild(progressBar);
    
    function updateProgress() {
      var windowHeight = window.innerHeight;
      var documentHeight = document.documentElement.scrollHeight;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      progressBar.style.width = Math.min(progress, 100) + '%';
    }
    
    var progressTimer = null;
    window.addEventListener('scroll', function() {
      if (progressTimer) {
        clearTimeout(progressTimer);
      }
      progressTimer = setTimeout(updateProgress, 50);
    });
    
    updateProgress();
  }
  
  // ===========================================
  // 5. 表格响应式包装（如果主题未处理）
  // ===========================================
  function wrapTables() {
    var tables = document.querySelectorAll('.article-entry table');
    tables.forEach(function(table) {
      if (table.parentNode.classList.contains('table-wrapper')) return;
      
      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }
  
  // ===========================================
  // DOM 加载完成后初始化
  // ===========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      addCopyButtons();
      initBackToTop();
      initLazyLoad();
      initReadingProgress();
      wrapTables();
    });
  } else {
    addCopyButtons();
    initBackToTop();
    initLazyLoad();
    initReadingProgress();
    wrapTables();
  }
  
})();
