#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
RELEASE_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
BOXYHQ_SERVER_EXPERIMENT_ENV_FILE=${BOXYHQ_SERVER_EXPERIMENT_ENV_FILE:-/etc/boxyhq/server-experiment.env}
BOXYHQ_COMPOSE_FILE=${BOXYHQ_COMPOSE_FILE:-$RELEASE_ROOT/infra/docker/docker-compose.server-experiment.yml}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

require_file() {
  if [ ! -f "$1" ]; then
    printf 'Missing required file: %s\n' "$1" >&2
    exit 1
  fi
}

require_var() {
  local name=$1
  if [ -z "${!name:-}" ]; then
    printf 'Missing required env var: %s\n' "$name" >&2
    exit 1
  fi
}

require_command docker
require_command curl
require_file "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE"
require_file "$BOXYHQ_COMPOSE_FILE"

set -a
. "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE"
set +a

require_var NEXTAUTH_URL
require_var APP_URL
require_var NEXTAUTH_SECRET
require_var NEXTAUTH_SESSION_STRATEGY
require_var NEXTAUTH_COOKIE_DOMAIN
require_var DATABASE_URL
require_var BOXYHQ_POSTGRES_PASSWORD
require_var GLYPH_SHARED_DOCKER_NETWORK

if [ "$NEXTAUTH_SESSION_STRATEGY" != "database" ]; then
  printf 'NEXTAUTH_SESSION_STRATEGY must be database for the shared-session experiment.\n' >&2
  exit 1
fi

case "$NEXTAUTH_URL" in
  http://account.glyph-beta.test*)
    ;;
  *)
    printf 'NEXTAUTH_URL must target http://account.glyph-beta.test for the first experiment.\n' >&2
    exit 1
    ;;
esac

if [ "$APP_URL" != "$NEXTAUTH_URL" ]; then
  printf 'APP_URL must match NEXTAUTH_URL for the first experiment.\n' >&2
  exit 1
fi

if [ "$NEXTAUTH_COOKIE_DOMAIN" != ".glyph-beta.test" ]; then
  printf 'NEXTAUTH_COOKIE_DOMAIN must be .glyph-beta.test for the shared-session experiment.\n' >&2
  exit 1
fi

docker network inspect "$GLYPH_SHARED_DOCKER_NETWORK" >/dev/null 2>&1 || {
  printf 'Docker network %s is missing.\n' "$GLYPH_SHARED_DOCKER_NETWORK" >&2
  exit 1
}

docker compose --env-file "$BOXYHQ_SERVER_EXPERIMENT_ENV_FILE" -f "$BOXYHQ_COMPOSE_FILE" config >/dev/null

printf '{\n'
printf '  "appUrl": "%s",\n' "$APP_URL"
printf '  "cookieDomain": "%s",\n' "$NEXTAUTH_COOKIE_DOMAIN"
printf '  "composeFile": "%s",\n' "$BOXYHQ_COMPOSE_FILE"
printf '  "sharedDockerNetwork": "%s"\n' "$GLYPH_SHARED_DOCKER_NETWORK"
printf '}\n'
