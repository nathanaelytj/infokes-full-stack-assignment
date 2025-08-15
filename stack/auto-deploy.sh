#!/usr/bin/env bash

# auto-deploy.sh
# Ensures script is executed from the repository's stack directory,
# checks for a deploy/ folder, finds all stack/yaml files and deploys
# them sequentially using `docker stack deploy` (or `docker compose` if needed).

set -euo pipefail
IFS=$'\n\t'

SCRIPT_NAME=$(basename "$0")
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_DIR="$REPO_ROOT/stack"
DEPLOY_DIR="$STACK_DIR/deploy"

# Color helpers
info() { printf "\033[1;34m[INFO]\033[0m %s\n" "$1"; }
ok()   { printf "\033[1;32m[ OK ]\033[0m %s\n" "$1"; }
err()  { printf "\033[1;31m[ERR ]\033[0m %s\n" "$1"; }

# 1) Ensure we are in the stack directory
if [ "$(pwd)" != "$STACK_DIR" ]; then
  info "Not in stack directory. Changing to '$STACK_DIR'"
  if [ -d "$STACK_DIR" ]; then
    cd "$STACK_DIR"
  else
    err "Stack directory '$STACK_DIR' does not exist. Exiting."
    exit 2
  fi
else
  info "Already in stack directory: $(pwd)"
fi

# Make sure docker-compose resolves relative paths from the repo stack dir
export COMPOSE_PROJECT_DIR="$STACK_DIR"

# 2) Check deploy directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
  err "Deploy directory '$DEPLOY_DIR' not found. Nothing to do."
  exit 3
fi

# 3) Find files to deploy (order: .stack.yml, .yml, .yaml) sorted by name
mapfile -t STACK_FILES < <(find "$DEPLOY_DIR" -maxdepth 1 -type f \( -iname "*.stack.yml" -o -iname "*.yml" -o -iname "*.yaml" \) | sort)

if [ ${#STACK_FILES[@]} -eq 0 ]; then
  err "No stack/yaml files found in '$DEPLOY_DIR'. Exiting."
  exit 4
fi

# 4) Ensure docker is available
if ! command -v docker >/dev/null 2>&1; then
  err "docker CLI not found in PATH. Please install Docker."
  exit 5
fi

# 5) Iterate files and deploy
for file in "${STACK_FILES[@]}"; do
  base=$(basename "$file")
  info "Deploying '$base'..."

  # Prefer docker stack deploy for swarm stack files; fallback to docker compose if not a stack command
  if docker --help 2>&1 | grep -q "stack"; then
    # Infer a stack name from filename (strip extension)
    stack_name=$(echo "$base" | sed -E 's/\.(stack\.)?ya?ml$//i')
    info "Using 'docker stack deploy' with stack name '$stack_name'"
    # run from STACK_DIR so relative paths in the compose file resolve correctly
    if (cd "$STACK_DIR" && docker stack deploy --with-registry-auth -c "$file" "$stack_name"); then
      ok "Deployed stack '$stack_name' from '$base'"
    else
      err "Failed to deploy stack '$stack_name' from '$base'"
      exit 6
    fi
  else
    # Fallback: try docker compose
    if docker compose --help >/dev/null 2>&1; then
      info "Using 'docker compose' to bring up compose file"
      # run from STACK_DIR so relative volume paths like ./config/traefik resolve
      if (cd "$STACK_DIR" && docker compose -f "$file" up -d); then
        ok "docker compose up for '$base' succeeded"
      else
        err "docker compose up failed for '$base'"
        exit 7
      fi
    else
      err "Neither 'docker stack' nor 'docker compose' available. Cannot deploy."
      exit 8
    fi
  fi

  # Small pause to allow services to initialize (optional)
  sleep 1
done

ok "All files deployed successfully."

exit 0
