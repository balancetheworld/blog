#!/bin/bash
echo "=== 修复编辑器 TypeScript 错误 ==="
echo ""
echo "1. 清理 Next.js 缓存..."
rm -rf .next node_modules/.cache
echo "   ✓ 已清理"
echo ""
echo "2. 重新构建项目..."
pnpm build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ 构建成功"
else
    echo "   ✗ 构建失败"
    exit 1
fi
echo ""
echo "3. 验证动态路由..."
ls -d "app/admin/edit/[id]" "app/blog/posts/[slug]" "app/api/posts/[id]" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ 所有动态路由正确"
else
    echo "   ✗ 动态路由有问题"
    exit 1
fi
echo ""
echo "=== 修复完成！==="
echo ""
echo "请在编辑器中执行以下操作："
echo ""
echo "【VSCode / Cursor 用户】"
echo "  1. 按 Cmd+Shift+P (Mac) 或 Ctrl+Shift+P (Windows)"
echo "  2. 输入: TypeScript: Restart TS Server"
echo "  3. 按 Enter"
echo ""
echo "或者直接重启编辑器！"
echo ""
echo "然后运行: pnpm dev"
