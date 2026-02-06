#!/bin/bash
# Hexo 文档库部署脚本 - HTTPS版本

echo "📝 部署 Hexo 文档库到 HTTPS..."
echo ""

# 进入目录
cd ~/website/hexo

# 清理并重新生成
echo "🔄 清理并重新生成静态文件..."
npx hexo clean
npx hexo generate

# 重载nginx
echo "🔄 重载 Nginx 配置..."
systemctl reload nginx

echo ""
echo "✅ 部署完成！"
echo ""
echo "📡 访问地址:"
echo "   - HTTP:  http://md.zeelool.asia (自动跳转到HTTPS)"
echo "   - HTTPS: https://md.zeelool.asia"
echo ""
echo "🔒 SSL证书:"
echo "   - 证书位置: /etc/letsencrypt/live/md.zeelool.asia/"
echo "   - 自动续期已启用"
echo ""
