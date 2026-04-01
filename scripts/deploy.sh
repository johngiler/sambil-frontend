#!/usr/bin/env bash
#
# Deploy Sambil frontend a sambil.publivalla.com (servidor compartido).
# Next.js en modo standalone (rutas dinámicas); Nginx hace proxy a Node en 127.0.0.1:3010.
# Requiere: npm, rsync, SSH Host sambil-frontend en ~/.ssh/config.
# Destino: /home/git/sambil (contenido del bundle standalone + static + public).
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REMOTE_HOST="${SAMBIL_FRONTEND_SSH:-sambil-frontend}"
REMOTE_PATH="/home/git/sambil"
STAGE_DIR="$FRONTEND_DIR/.next/sambil-deploy-bundle"

cd "$FRONTEND_DIR"

# Next carga .env.local también en `next build`; suele apuntar a 127.0.0.1:8000 y tapa .env.production.
# Las variables ya definidas en el shell tienen prioridad: forzamos el API público antes del build.
PROD_ENV="$FRONTEND_DIR/.env.production"
if [[ -f "$PROD_ENV" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$PROD_ENV"
  set +a
fi
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://api.publivalla.com}"
echo "[deploy] Build con NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL (no uses solo .env.local para prod)"

echo "[deploy] Building (production, standalone)..."
NODE_ENV=production npm run build

STANDALONE="$FRONTEND_DIR/.next/standalone"
if [[ ! -f "$STANDALONE/server.js" ]]; then
  echo "[deploy] ERROR: no existe $STANDALONE/server.js (revisa next.config output: standalone)" >&2
  exit 1
fi

echo "[deploy] Preparando bundle (standalone + .next/static + public)..."
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"
cp -a "$STANDALONE"/. "$STAGE_DIR/"
mkdir -p "$STAGE_DIR/.next"
cp -a "$FRONTEND_DIR/.next/static" "$STAGE_DIR/.next/static"
cp -a "$FRONTEND_DIR/public" "$STAGE_DIR/public"

echo "[deploy] Creando directorio remoto..."
ssh "$REMOTE_HOST" "mkdir -p $REMOTE_PATH && chown -R git:git /home/git/sambil 2>/dev/null || true"

echo "[deploy] rsync bundle -> $REMOTE_HOST:$REMOTE_PATH"
rsync -avz --delete -e ssh "$STAGE_DIR/" "$REMOTE_HOST:$REMOTE_PATH/"

echo "[deploy] Permisos para lectura (git + recorrido nginx si aplica)..."
ssh "$REMOTE_HOST" "chown -R git:git $REMOTE_PATH && chmod 755 /home/git /home/git/sambil 2>/dev/null || true"

echo "[deploy] Reiniciando servicio Node (si existe)..."
ssh "$REMOTE_HOST" "systemctl restart sambil-frontend 2>/dev/null || true"

echo "[deploy] Listo. https://sambil.publivalla.com (Nginx → 127.0.0.1:3010)"
