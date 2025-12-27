#!/bin/bash
# Safe Trash Cleanup Script
# This will empty your system Trash folder

echo "🗑️  Cleaning Trash folder..."
echo "Current size: $(du -sh ~/.local/share/Trash 2>/dev/null | cut -f1)"
echo ""
echo "Deleting Trash contents..."

# Empty the Trash
rm -rf ~/.local/share/Trash/files/*
rm -rf ~/.local/share/Trash/info/*
rm -rf ~/.local/share/Trash/expunged/*

echo "✅ Trash cleaned!"
echo "New size: $(du -sh ~/.local/share/Trash 2>/dev/null | cut -f1)"




