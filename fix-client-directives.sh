#!/bin/bash
set -e

echo ""
echo "=================================================="
echo " Smart Retail PoC — Client Directive Patch"
echo "=================================================="
echo ""

if [ ! -f "package.json" ]; then
  echo "ERROR: Run this script from the project root (~/smart-retail-poc)"
  exit 1
fi

echo "[1/6] Patching components/layout/Sidebar.tsx ..."
if grep -q "'use client'" components/layout/Sidebar.tsx 2>/dev/null; then
  echo "      SKIP — directive already present"
else
  sed -i "1s/^/'use client'\n\n/" components/layout/Sidebar.tsx
  echo "      DONE"
fi

echo "[2/6] Patching components/layout/Header.tsx ..."
if grep -q "'use client'" components/layout/Header.tsx 2>/dev/null; then
  echo "      SKIP — directive already present"
else
  sed -i "1s/^/'use client'\n\n/" components/layout/Header.tsx
  echo "      DONE"
fi

echo "[3/6] Patching app/page.tsx ..."
if grep -q "'use client'" app/page.tsx 2>/dev/null; then
  echo "      SKIP — directive already present"
else
  sed -i "1s/^/'use client'\n\n/" app/page.tsx
  echo "      DONE"
fi

echo "[4/6] Patching app/forecasting/page.tsx ..."
if grep -q "'use client'" app/forecasting/page.tsx 2>/dev/null; then
  echo "      SKIP — directive already present"
else
  sed -i "1s/^/'use client'\n\n/" app/forecasting/page.tsx
  echo "      DONE"
fi

echo "[5/6] Patching app/allocation/page.tsx ..."
if grep -q "'use client'" app/allocation/page.tsx 2>/dev/null; then
  echo "      SKIP — directive already present"
else
  sed -i "1s/^/'use client'\n\n/" app/allocation/page.tsx
  echo "      DONE"
fi

echo "[6/6] Patching app/assistant/page.tsx ..."
if grep -q "'use client'" app/assistant/page.tsx 2>/dev/null; then
  echo "      SKIP — directive already present"
else
  sed -i "1s/^/'use client'\n\n/" app/assistant/page.tsx
  echo "      DONE"
fi

echo ""
echo "Scanning for remaining unpatched handler files..."
UNPATCHED=$(grep -rl "onMouseEnter\|onMouseLeave\|onClick\|onChange\|onSubmit" app/ components/ 2>/dev/null \
  | xargs grep -L "'use client'" 2>/dev/null || true)

if [ -z "$UNPATCHED" ]; then
  echo "  OK — No unpatched files found."
else
  echo "  WARNING — Still unpatched:"
  echo "$UNPATCHED" | sed 's/^/    /'
fi

echo ""
echo "=================================================="
echo " Done. Run: npm run dev"
echo "=================================================="
