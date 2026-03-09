#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
RELEASE_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
BOXYHQ_DEPLOY_ROOT=${BOXYHQ_DEPLOY_ROOT:-/opt/boxyhq}
BOXYHQ_SERVER_EXPERIMENT_ENV_FILE=${BOXYHQ_SERVER_EXPERIMENT_ENV_FILE:-/etc/boxyhq/server-experiment.env}
BOXYHQ_COMPOSE_FILE=${BOXYHQ_COMPOSE_FILE:-$RELEASE_ROOT/infra/docker/docker-compose.server-experiment.yml}

set -a
. "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE"
set +a

mkdir -p "$BOXYHQ_DEPLOY_ROOT/releases"
mkdir -p "${BOXYHQ_POSTGRES_HOST_PATH:-/var/lib/boxyhq/postgres}"
ln -sfn "$RELEASE_ROOT" "$BOXYHQ_DEPLOY_ROOT/current"

docker network inspect "${GLYPH_SHARED_DOCKER_NETWORK}" >/dev/null 2>&1 || \
  docker network create "${GLYPH_SHARED_DOCKER_NETWORK}" >/dev/null

bash "$SCRIPT_DIR/server-experiment-preflight.sh"

docker compose --env-file "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE" -f "$BOXYHQ_COMPOSE_FILE" build
docker compose --env-file "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE" -f "$BOXYHQ_COMPOSE_FILE" up -d boxyhq-postgres

deadline=$((SECONDS + 120))
until docker compose --env-file "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE" -f "$BOXYHQ_COMPOSE_FILE" exec -T boxyhq-postgres pg_isready -U "${BOXYHQ_POSTGRES_USER:-boxyhq}" -d "${BOXYHQ_POSTGRES_DB:-boxyhq}" >/dev/null; do
  if [ $SECONDS -ge $deadline ]; then
    printf 'Timed out waiting for BoxyHQ Postgres.\n' >&2
    exit 1
  fi
  sleep 2
done

docker compose --env-file "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE" -f "$BOXYHQ_COMPOSE_FILE" run --rm boxyhq-app npx prisma db push
docker compose --env-file "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE" -f "$BOXYHQ_COMPOSE_FILE" up -d boxyhq-app

app_port=${BOXYHQ_APP_PORT:-4002}
deadline=$((SECONDS + 180))
until curl -fsS "http://127.0.0.1:${app_port}/" >/dev/null; do
  if [ $SECONDS -ge $deadline ]; then
    printf 'Timed out waiting for BoxyHQ app readiness.\n' >&2
    exit 1
  fi
  sleep 2
done

docker compose --env-file "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE" -f "$BOXYHQ_COMPOSE_FILE" ps
