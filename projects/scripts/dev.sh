#!/bin/bash
set -Eeuo pipefail

PORT=5000
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-${PORT}}"
API_PORT=3001

cd "${COZE_WORKSPACE_PATH}"

kill_port_if_listening() {
    local port=$1
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${port}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port ${port} is free."
      return
    fi
    echo "Port ${port} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
}

echo "Clearing ports before start."
kill_port_if_listening ${DEPLOY_RUN_PORT}
kill_port_if_listening ${API_PORT}

echo "Starting Express API server on port ${API_PORT}..."
API_PORT=${API_PORT} pnpm tsx watch server/server.ts &

sleep 2

echo "Starting Vite dev server on port ${DEPLOY_RUN_PORT}..."
PORT=${DEPLOY_RUN_PORT} pnpm vite --host 0.0.0.0 --port ${DEPLOY_RUN_PORT}
