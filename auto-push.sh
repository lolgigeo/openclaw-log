#!/bin/bash
# 自动推送脚本 - 检测变更并推送到GitHub

cd /root/website/hexo

# 检查是否有变更
if [[ -n $(git status -s) ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检测到文件变更，准备推送..."
    
    # 添加所有变更
    git add -A
    
    # 提交变更
    COMMIT_MSG="Auto-update: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"
    
    # 推送到GitHub
    git push origin main
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 推送完成"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 无变更，跳过推送"
fi
