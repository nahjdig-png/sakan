#!/bin/bash
# سكربت بسيط لرفع المشروع عبر Git

echo "================================================"
echo "   رفع Sakan عبر Git"
echo "================================================"
echo ""

# قراءة معلومات Repository
read -p "رابط GitHub Repository (مثال: https://github.com/user/sakan.git): " REPO_URL

# إعداد Git إن لم يكن مهيأ
if [ ! -d ".git" ]; then
    echo "تهيئة Git..."
    git init
    git add .
    git commit -m "Initial commit - Sakan Platform"
fi

# إضافة Remote
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# رفع الكود
echo "رفع الكود إلى GitHub..."
git branch -M main
git push -u origin main --force

echo ""
echo "✓ تم الرفع بنجاح!"
echo ""
echo "على السيرفر نفذ:"
echo "  git clone $REPO_URL /opt/sakan"
echo "  cd /opt/sakan"
echo "  ./install.sh"
echo ""
