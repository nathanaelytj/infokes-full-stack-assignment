#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Determine repository and stack paths
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_DIR="$REPO_ROOT/stack"
REPO_DAEMON="$STACK_DIR/daemon.json"
SYS_DAEMON="/etc/docker/daemon.json"

info() { printf "[INFO] %s\n" "$1"; }
err() { printf "[ERR ] %s\n" "$1"; }

# Ensure Docker is installed (idempotent). Uses the official Docker APT repo.
ensure_docker_installed() {
	info "Checking for Docker..."
	if command -v docker >/dev/null 2>&1; then
		info "Docker already installed"
		return 0
	fi

	if ! command -v sudo >/dev/null 2>&1; then
		err "sudo is required to install Docker but not found; please run this script as root or install sudo"
		exit 1
	fi

	info "Installing Docker: removing conflicting packages and adding Docker's official repository..."
	sudo apt-get update

	# Remove potential conflicting packages (non-fatal)
	for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
		sudo apt-get remove -y "$pkg" || true
	done

	# Add prerequisites and Docker's GPG key
	sudo apt-get install -y ca-certificates curl gnupg
	sudo install -m 0755 -d /etc/apt/keyrings
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
	sudo chmod a+r /etc/apt/keyrings/docker.gpg

	# Add Docker repository
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

	sudo apt-get update
	sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

	info "Docker installation finished"
}

# Ensure Docker is present before continuing
ensure_docker_installed

# 1) If repo daemon.json exists, ensure it's present in /etc/docker; copy if different
if [ -f "$REPO_DAEMON" ]; then
	if [ -f "$SYS_DAEMON" ]; then
		if cmp -s "$REPO_DAEMON" "$SYS_DAEMON"; then
			info "/etc/docker/daemon.json matches repository copy"
		else
			info "/etc/docker/daemon.json differs from repository copy; it will be replaced (requires sudo)"
			if command -v sudo >/dev/null 2>&1; then
				sudo cp "$REPO_DAEMON" "$SYS_DAEMON"
				sudo chown root:root "$SYS_DAEMON" || true
				sudo chmod 644 "$SYS_DAEMON" || true
				info "Copied repository daemon.json to $SYS_DAEMON"
			else
				err "sudo is not available; cannot copy $REPO_DAEMON to $SYS_DAEMON. Run as root or install sudo."
				exit 1
			fi
		fi
	else
		info "/etc/docker/daemon.json not present; copying from repository (requires sudo)"
		if command -v sudo >/dev/null 2>&1; then
			sudo mkdir -p /etc/docker
			sudo cp "$REPO_DAEMON" "$SYS_DAEMON"
			sudo chown root:root "$SYS_DAEMON" || true
			sudo chmod 644 "$SYS_DAEMON" || true
			info "Copied repository daemon.json to $SYS_DAEMON"
		else
			err "sudo is not available; cannot copy $REPO_DAEMON to $SYS_DAEMON. Run as root or install sudo."
			exit 1
		fi
	fi
else
	info "No repository daemon.json at $REPO_DAEMON; skipping copy/check"
fi

# 2) Restart docker before initializing swarm
restart_docker() {
	info "Restarting Docker daemon (requires sudo)..."
	if command -v sudo >/dev/null 2>&1; then
		if command -v systemctl >/dev/null 2>&1; then
			sudo systemctl restart docker
		else
			sudo service docker restart
		fi
	else
		err "sudo not found; attempting to restart docker as current user"
		if command -v systemctl >/dev/null 2>&1; then
			systemctl restart docker
		else
			service docker restart
		fi
	fi

	# Wait for docker to become available
	timeout=30
	while ! docker info >/dev/null 2>&1; do
		timeout=$((timeout-1))
		if [ $timeout -le 0 ]; then
			err "Docker did not become available after restart"
			exit 1
		fi
		sleep 1
	done
	info "Docker is available"
}

restart_docker

# 3) Continue with swarm init and network setup
docker swarm leave --force || true
docker network rm docker_gwbridge >/dev/null 2>&1 || true
docker network create --subnet 10.174.0.0/24 --opt com.docker.network.bridge.name=docker_gwbridge --opt com.docker.network.bridge.enable_icc=false docker_gwbridge
docker swarm init --advertise-addr 127.0.0.1

docker network rm base-net >/dev/null 2>&1 || true
docker network create --ipv6 --driver overlay --scope swarm --attachable base-net
