#!/bin/bash
# TabNine Cache Cleanup Script
# This will remove TabNine AI code completion cache (it will regenerate)

echo "🧹 Cleaning TabNine cache..."
echo "Current size: $(du -sh ~/.local/share/TabNine 2>/dev/null | cut -f1)"
echo ""
echo "Deleting TabNine cache..."

rm -rf ~/.local/share/TabNine/*

echo "✅ TabNine cache cleaned!"
echo "New size: $(du -sh ~/.local/share/TabNine 2>/dev/null | cut -f1)"
echo "Note: TabNine will rebuild its cache when you use it again."


