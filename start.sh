#!/bin/bash
echo "=== Avvio Hub Centrale ==="
echo ""

APPS_DIR="$(dirname "$0")/apps"
HUB_DIR="$(dirname "$0")"

# Carica nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 24 2>/dev/null || echo "⚠️  nvm non trovato, usa 'nvm use 24' manualmente"

echo "📌 Avvio di tutte le sezioni in background..."
echo ""

# Avvia ogni app in background
for app in multimedia cosmetica libri lunastar manga pokemon livetv; do
  PORT_FILE="$APPS_DIR/$app/package.json"
  PORT=$(grep -o 'next dev -p [0-9]*' "$PORT_FILE" | grep -o '[0-9]*$')
  echo "   [$app] Avvio su porta $PORT..."
  (source "$NVM_DIR/nvm.sh" && nvm use 24 && cd "$APPS_DIR/$app" && npm run dev) &>/dev/null &
done

echo ""
echo "⏳ Attendo l'avvio dei server..."
sleep 5

# Verifica porte
for port in 3001 3002 3003 3004 3005 3006 3007; do
  if curl -s -o /dev/null -w "" http://localhost:$port 2>/dev/null; then
    echo "   ✅ Porta $port - ATTIVO"
  else
    echo "   ⏳ Porta $port - in caricamento..."
  fi
done

echo ""
echo "=== Apro la pagina hub ==="
open "$HUB_DIR/index.html" 2>/dev/null
echo ""
echo "💡 Se qualche sezione non si carica, aspetta qualche secondo"
echo "   e ricarica la pagina nel browser"
