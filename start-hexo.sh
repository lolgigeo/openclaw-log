#!/bin/bash
# Hexo 文档库启动脚本

echo "🚀 启动 Hexo 文档库..."
echo ""

# 停止可能存在的旧服务
echo "📌 检查并停止旧服务..."
pkill -f 'http-server.*-p 80' 2>/dev/null
sleep 2

# 检查端口
if lsof -i :80 >/dev/null 2>&1; then
    echo "⚠️  端口80仍被占用，尝试强制释放..."
    sudo lsof -ti:80 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 进入目录
cd ~/docs-hexo

# 清理并重新生成（可选，如果文档有更新）
if [ "$1" == "--rebuild" ]; then
    echo "🔄 清理并重新生成静态文件..."
    npx hexo clean
    npx hexo generate
fi

# 启动服务
echo "▶️  启动 HTTP 服务器..."
cd ~/docs-hexo/public
nohup npx http-server -p 80 > ~/docs-hexo/server.log 2>&1 &

sleep 3

# 检查状态
if lsof -i :80 >/dev/null 2>&1; then
    IPV4=$(hostname -I | awk '{print $1}')
    echo ""
    echo "✅ Hexo 文档库已启动！"
    echo ""
    echo "📡 访问地址:"
    echo "   - 本地: http://127.0.0.1:80"
    echo "   - 内网: http://$IPV4:80"
    echo ""
    echo "📝 日志文件: ~/docs-hexo/server.log"
    echo ""
    echo "🛑 停止服务: pkill -f 'http-server.*-p 80'"
    echo ""
else
    echo "❌ 启动失败，请检查日志: ~/docs-hexo/server.log"
fi
