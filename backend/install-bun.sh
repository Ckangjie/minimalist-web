#!/bin/bash
# Bun 安装脚本 (Linux/macOS)

set -e

echo "正在安装 Bun..."

curl -fsSL https://bun.sh/install | bash

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

echo ""
echo "Bun 安装完成！"
bun --version
