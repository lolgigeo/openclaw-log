/**
 * Vincent's 文档库 - 自定义脚本（二次优化版本）
 * 更新时间：2026-02-07
 * 优化重点：幂等性、性能、标题锚点、目录高亮
 * 
 * 功能模块：
 * - backToTop: 回到顶部按钮
 * - progressBar: 阅读进度条
 * - copyCode: 代码块复制按钮
 * - headingAnchors: 标题锚点生成
 * - tableWrapper: 表格包裹器（幂等）
 * - lazyLoad: 图片懒加载
 * - tocActive: 目录滚动高亮（可选）
 */

(function() {
  'use strict';
  
  // ===========================================
  // 工具函数：节流
  // ===========================================
  function throttle(func, wait) {
    var timeout = null;
    var previous = 0;
    
    return function() {
      var now = Date.now();
      var remaining = wait - (now - previous);
      var context = this;
      var args = arguments;
      
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(function() {
          previous = Date.now();
          timeout = null;
          func.apply(context, args);
        }, remaining);
      }
    };
  }
  
  // ===========================================
  // 1. 代码块复制按钮（幂等增强）
  // ===========================================
  function addCopyButtons() {
    var codeBlocks = document.querySelectorAll('pre code, .highlight, pre');
    
    codeBlocks.forEach(function(block) {
      // 找到最外层的 pre 元素
      var pre = block.tagName === 'PRE' ? block : block.closest('pre');
      if (!pre) return;
      
      // ⭐ 幂等检查：避免重复添加按钮
      if (pre.hasAttribute('data-copy-added') || pre.querySelector('.copy-btn')) {
        return;
      }
      
      // 标记已处理
      pre.setAttribute('data-copy-added', 'true');
      
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
            btn.classList.add('copied');
            setTimeout(function() {
              btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2z"/><path d="M2 6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H2z"/></svg>';
              btn.classList.remove('copied');
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
    // 检查是否已存在
    if (document.getElementById('back-to-top')) return;
    
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3l-7 7h4v7h6v-7h4z"/></svg>';
    btn.setAttribute('aria-label', '回到顶部');
    btn.title = '回到顶部';
    document.body.appendChild(btn);
    
    // 显示/隐藏逻辑（节流优化）
    var toggleButton = throttle(function() {
      if (window.pageYOffset > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, 100);
    
    // 点击滚动到顶部
    btn.onclick = function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // 监听滚动事件
    window.addEventListener('scroll', toggleButton, { passive: true });
    toggleButton();
  }
  
  // ===========================================
  // 3. 阅读进度条
  // ===========================================
  function initReadingProgress() {
    // 只在文章页面显示（检测 .article-entry）
    if (!document.querySelector('.article-entry')) return;
    
    // 检查是否已存在
    if (document.getElementById('reading-progress')) return;
    
    var progressBar = document.createElement('div');
    progressBar.id = 'reading-progress';
    document.body.appendChild(progressBar);
    
    // 更新进度（节流优化）
    var updateProgress = throttle(function() {
      var windowHeight = window.innerHeight;
      var documentHeight = document.documentElement.scrollHeight;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      progressBar.style.width = Math.min(Math.max(progress, 0), 100) + '%';
    }, 50);
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
  
  // ===========================================
  // 4. 图片懒加载
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
  // 5. 表格包裹器（幂等）
  // ===========================================
  function wrapTables() {
    var tables = document.querySelectorAll('.article-entry table');
    tables.forEach(function(table) {
      // ⭐ 幂等检查：避免重复包裹
      if (table.parentNode.classList.contains('table-wrapper')) {
        return;
      }
      
      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }
  
  // ===========================================
  // ⭐ 6. 标题锚点生成（二次优化新增）
  // ===========================================
  function addHeadingAnchors() {
    const headings = document.querySelectorAll('.article-entry h2, .article-entry h3, .article-entry h4');
    
    headings.forEach(function(h) {
      // 幂等检查
      if (h.querySelector('.heading-anchor')) return;
      
      // 生成 ID（如果没有）
      if (!h.id) {
        var id = h.textContent
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
          .replace(/^-+|-+$/g, '');
        h.id = id || 'heading-' + Math.random().toString(36).substr(2, 9);
      }
      
      // 创建锚点链接
      var anchor = document.createElement('a');
      anchor.href = '#' + h.id;
      anchor.className = 'heading-anchor';
      anchor.innerHTML = '#';
      anchor.setAttribute('aria-label', '复制标题链接');
      anchor.title = '复制链接';
      
      // 点击复制链接到剪贴板
      anchor.onclick = function(e) {
        e.preventDefault();
        var url = window.location.origin + window.location.pathname + '#' + h.id;
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function() {
            anchor.innerHTML = '✓';
            setTimeout(function() {
              anchor.innerHTML = '#';
            }, 1500);
            
            // 同时跳转到锚点
            window.location.hash = h.id;
          });
        } else {
          window.location.hash = h.id;
        }
      };
      
      h.appendChild(anchor);
    });
  }
  
  // ===========================================
  // ⭐ 7. 目录滚动高亮（可选，检测到 TOC 才启用）
  // ===========================================
  function initTocActive() {
    // 检测是否存在目录（常见选择器）
    var toc = document.querySelector('.toc, #toc, .table-of-contents, [data-toc]');
    if (!toc) return; // 没有目录则跳过
    
    var headings = document.querySelectorAll('.article-entry h2, .article-entry h3');
    if (headings.length === 0) return;
    
    var tocLinks = toc.querySelectorAll('a[href^="#"]');
    if (tocLinks.length === 0) return;
    
    // 使用 Intersection Observer 监听标题可见性
    var activeHeading = null;
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          activeHeading = entry.target.id;
          
          // 高亮对应的目录项
          tocLinks.forEach(function(link) {
            if (link.getAttribute('href') === '#' + activeHeading) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-80px 0px -80% 0px' // 顶部偏移，避免导航栏遮挡
    });
    
    headings.forEach(function(h) {
      if (h.id) {
        observer.observe(h);
      }
    });
  }
  
  // ===========================================
  // ⭐ 8. 锚点跳转偏移修正（CSS scroll-margin-top 的 JS 补充）
  // ===========================================
  function fixAnchorOffset() {
    // 处理页面加载时的锚点
    if (window.location.hash) {
      setTimeout(function() {
        var target = document.querySelector(window.location.hash);
        if (target) {
          var offset = 80; // 与导航栏高度一致
          var elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
          var offsetPosition = elementPosition - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }
  
  // ===========================================
  // ⭐ TOC 目录导航（新增 - 2026-02-07）
  // ===========================================
  function initTOC() {
    // 仅在文章页执行
    var postContent = document.querySelector('.post-content, .article-entry, article .content, .entry-content');
    if (!postContent) {
      console.log('[TOC] Not a post page, skipping.');
      return;
    }
    
    // 幂等检查：避免重复生成
    if (document.querySelector('.toc-aside') || postContent.hasAttribute('data-toc-generated')) {
      console.log('[TOC] Already generated, skipping.');
      return;
    }
    
    // 提取标题（h2, h3）
    var headings = postContent.querySelectorAll('h2, h3');
    if (headings.length < 2) {
      console.log('[TOC] Less than 2 headings (' + headings.length + '), skipping TOC.');
      postContent.setAttribute('data-toc-generated', 'true');
      return;
    }
    
    console.log('[TOC] Found ' + headings.length + ' headings, generating TOC...');
    
    // 为无 ID 的标题生成 ID
    var usedIds = {};
    headings.forEach(function(heading) {
      if (!heading.id) {
        var text = heading.textContent || heading.innerText;
        var id = slugify(text);
        
        // 去重
        var originalId = id;
        var counter = 1;
        while (usedIds[id]) {
          id = originalId + '-' + counter;
          counter++;
        }
        
        heading.id = id;
        usedIds[id] = true;
      } else {
        usedIds[heading.id] = true;
      }
    });
    
    // 生成 TOC HTML
    var tocHTML = '<div class="toc-header">目录</div><nav class="toc-nav" role="navigation" aria-label="目录导航"><ul class="toc-list">';
    var currentLevel = 2;
    
    headings.forEach(function(heading) {
      var level = parseInt(heading.tagName.substring(1));
      var text = heading.textContent || heading.innerText;
      var id = heading.id;
      
      // 处理层级
      if (level > currentLevel) {
        tocHTML += '<ul class="toc-list toc-list-' + level + '">';
      } else if (level < currentLevel) {
        tocHTML += '</ul>';
      }
      
      tocHTML += '<li class="toc-item toc-level-' + level + '">';
      tocHTML += '<a href="#' + id + '" class="toc-link" data-heading-id="' + id + '">';
      tocHTML += '<span class="toc-text">' + escapeHTML(text) + '</span>';
      tocHTML += '</a></li>';
      
      currentLevel = level;
    });
    
    tocHTML += '</ul></nav>';
    
    // 创建 TOC 容器
    var tocAside = document.createElement('aside');
    tocAside.className = 'toc-aside';
    tocAside.setAttribute('role', 'complementary');
    tocAside.setAttribute('aria-label', '目录');
    tocAside.innerHTML = tocHTML;
    
    // 插入 TOC 到合适位置
    var postContainer = document.querySelector('#post-container, .post, article, main.container');
    if (postContainer) {
      postContainer.appendChild(tocAside);
    } else {
      document.body.appendChild(tocAside);
      tocAside.style.position = 'fixed';
      tocAside.style.right = '20px';
      tocAside.style.top = '120px';
    }
    
    // 标记已生成
    postContent.setAttribute('data-toc-generated', 'true');
    
    // 绑定点击事件（平滑滚动）
    var tocLinks = tocAside.querySelectorAll('.toc-link');
    tocLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('href').substring(1);
        var targetHeading = document.getElementById(targetId);
        
        if (targetHeading) {
          targetHeading.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          if (history.pushState) {
            history.pushState(null, null, '#' + targetId);
          } else {
            window.location.hash = targetId;
          }
          
          updateTOCActive(targetId);
        }
      });
    });
    
    // 滚动高亮（IntersectionObserver 优先）
    if ('IntersectionObserver' in window) {
      initTOCActiveObserver(headings, tocLinks);
    } else {
      initTOCActiveScroll(headings, tocLinks);
    }
    
    console.log('[TOC] Generated successfully.');
  }

  // 辅助函数：slugify
  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  // 辅助函数：HTML 转义
  function escapeHTML(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 更新 TOC 当前项高亮
  function updateTOCActive(activeId) {
    var tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(function(link) {
      if (link.getAttribute('data-heading-id') === activeId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');
        
        var tocNav = link.closest('.toc-nav');
        if (tocNav) {
          var linkTop = link.offsetTop;
          var navHeight = tocNav.clientHeight;
          if (linkTop > navHeight / 2) {
            tocNav.scrollTop = linkTop - navHeight / 2;
          }
        }
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // IntersectionObserver 方式
  function initTOCActiveObserver(headings, tocLinks) {
    var observerOptions = {
      root: null,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    };
    
    var activeHeading = null;
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          activeHeading = entry.target.id;
          updateTOCActive(activeHeading);
        }
      });
    }, observerOptions);
    
    headings.forEach(function(heading) {
      observer.observe(heading);
    });
  }

  // Scroll 方式（降级）
  function initTOCActiveScroll(headings, tocLinks) {
    var throttleTimer = null;
    
    function findActiveHeading() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var activeId = null;
      
      for (var i = headings.length - 1; i >= 0; i--) {
        var heading = headings[i];
        var rect = heading.getBoundingClientRect();
        
        if (rect.top <= 100) {
          activeId = heading.id;
          break;
        }
      }
      
      if (activeId) {
        updateTOCActive(activeId);
      }
    }
    
    window.addEventListener('scroll', function() {
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
      throttleTimer = setTimeout(findActiveHeading, 100);
    }, { passive: true });
    
    findActiveHeading();
  }
  
  // ===========================================
  // 主初始化函数
  // ===========================================
  function init() {
    // 基础功能（所有页面）
    initBackToTop();
    initLazyLoad();
    
    // 文章页专属功能
    if (document.querySelector('.article-entry')) {
      initReadingProgress();
      addCopyButtons();
      wrapTables();
      addHeadingAnchors();
      initTocActive();
      fixAnchorOffset();
      initMermaid();
      initTOC(); // ⭐ 新增 TOC
    }
  }
  
  // ===========================================
  // DOM 加载完成后执行
  // ===========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // ===========================================
  // 暴露重新初始化接口（用于 PJAX/SPA 场景）
  // ===========================================
  window.customScriptsReinit = function() {
    console.log('[CustomScripts] Reinitializing...');
    init();
  };
  
})();
