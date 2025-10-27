#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_URL_DEFAULT="http://localhost:3002/api"
ENV_FILE="$ROOT_DIR/.env"

# Load API URL from .env if available
API_URL="$API_URL_DEFAULT"
if [[ -f "$ENV_FILE" ]]; then
  VAR=$(grep -E '^VITE_API_URL=' "$ENV_FILE" | sed 's/^VITE_API_URL=//')
  if [[ -n "$VAR" ]]; then
    API_URL="$VAR"
  fi
fi

printf "[INFO] Using API URL: %s\n" "$API_URL"

TS=$(date +%s)
SLUG="qa-${TS}"
EMAIL="admin.qa+${TS}@exemplo.com"

# Prepare JSON payload safely
PAYLOAD=$(cat <<JSON
{
  "nomeEmpresa": "QA Test ${TS}",
  "slug": "${SLUG}",
  "telefoneEmpresa": "",
  "endereco": "Rua QA",
  "cidade": "Teste",
  "estado": "SP",
  "cep": "00000-000",
  "nomeAdmin": "QA Admin",
  "emailAdmin": "${EMAIL}",
  "senhaAdmin": "senha123",
  "telefoneAdmin": ""
}
JSON
)

printf "[INFO] Registering company with slug '%s' and email '%s'...\n" "$SLUG" "$EMAIL"
CURL_OUTPUT=$(curl -s -S -o /tmp/resp.json -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$API_URL/auth/cadastro-empresa" 2>/tmp/resp.err || true)
HTTP_CODE="$CURL_OUTPUT"

if [[ ! "$HTTP_CODE" =~ ^[0-9]{3}$ ]]; then
  printf "[ERROR] Request failed before getting HTTP status. Curl says:\n"
  cat /tmp/resp.err || true
  exit 1
fi

printf "[INFO] HTTP status: %s\n" "$HTTP_CODE"
RESP_BODY=""
if [[ -f /tmp/resp.json ]]; then
  RESP_BODY=$(cat /tmp/resp.json)
fi

if [[ "$HTTP_CODE" != "201" ]]; then
  printf "[ERROR] Registration failed. Response:\n%s\n" "$RESP_BODY"
  exit 1
fi

printf "[OK] Registration succeeded. Response body:\n%s\n" "$RESP_BODY"

# Detect dev.db path
DB_CANDIDATES=(
  "$ROOT_DIR/backend/prisma/dev.db"
  "$ROOT_DIR/backend/prisma/prisma/dev.db"
)
DB_FILE=""
for f in "${DB_CANDIDATES[@]}"; do
  if [[ -f "$f" ]]; then
    DB_FILE="$f"
    break
  fi
done

if [[ -z "$DB_FILE" ]]; then
  printf "[WARN] Could not find dev.db. Checked: %s\n" "${DB_CANDIDATES[*]}"
  exit 0
fi

printf "[INFO] Using DB file: %s\n" "$DB_FILE"

# Verify persistence in user table
if ! command -v sqlite3 >/dev/null 2>&1; then
  printf "[WARN] sqlite3 not available; skipping DB verification.\n"
  exit 0
fi

TABLES=$(sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table';" || true)
if [[ -z "$TABLES" ]]; then
  printf "[WARN] No tables found in DB; skipping verification.\n"
  exit 0
fi

USER_TABLE=""
if echo "$TABLES" | grep -q "usuarios"; then
  USER_TABLE="usuarios"
elif echo "$TABLES" | grep -q "Usuario"; then
  USER_TABLE="Usuario"
elif echo "$TABLES" | grep -q "users"; then
  USER_TABLE="users"
elif echo "$TABLES" | grep -q "User"; then
  USER_TABLE="User"
fi

if [[ -z "$USER_TABLE" ]]; then
  printf "[WARN] Could not detect user table (found: %s); skipping verification.\n" "$TABLES"
  exit 0
fi

QUERY="SELECT id, email, nome, tipo, empresaId FROM ${USER_TABLE} WHERE email='${EMAIL}' LIMIT 1;"
RESULT=$(sqlite3 "$DB_FILE" "$QUERY" | tr '|' '\t' || true)

if [[ -n "$RESULT" ]]; then
  printf "[OK] User persisted in DB (%s):\n%s\n" "$USER_TABLE" "$RESULT"
else
  printf "[ERROR] User not found in DB (%s) for email '%s'.\n" "$USER_TABLE" "$EMAIL"
  exit 2
fi

printf "[DONE] Test completed successfully.\n"