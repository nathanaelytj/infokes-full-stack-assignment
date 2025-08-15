#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_SQL="$script_dir/seeder.sql"

usage() {
	cat <<EOF
Usage: $(basename "$0") <container-name-filter> [db_name] [db_user] [path_to_sql]

Finds the first running container whose name matches <container-name-filter>,
copies the SQL file into the container and runs it with psql.

Defaults:
	db_name: postgres
	db_user: postgres
	path_to_sql: $DEFAULT_SQL

Example:
	$(basename "$0") postgres                # uses defaults and stack/seeder.sql
	$(basename "$0") postgres mydb myuser ./migrations/init.sql
EOF
}

if [ "$#" -lt 1 ]; then
	usage
	exit 2
fi

container_filter="$1"
db_name="${2:-postgres}"
db_user="${3:-postgres}"
sql_file="${4:-$DEFAULT_SQL}"

if ! command -v docker >/dev/null 2>&1; then
	echo "docker CLI not found in PATH" >&2
	exit 3
fi

cid="$(docker ps -q -f name="${container_filter}" | head -n 1 || true)"

if [ -z "$cid" ]; then
	echo "No running container found matching name filter: '${container_filter}'" >&2
	docker ps --format 'table {{.Names}}	{{.ID}}	{{.Status}}'
	exit 4
fi

if [ ! -f "$sql_file" ]; then
	echo "SQL file not found: $sql_file" >&2
	exit 5
fi

echo "Seeding database '$db_name' (user: $db_user) in container $cid (filter='$container_filter')"
echo "Copying $sql_file -> $cid:/tmp/seeder.sql"
docker cp "$sql_file" "$cid:/tmp/seeder.sql"

echo "Executing psql inside container..."
if docker exec -i "$cid" psql -U "$db_user" -d "$db_name" -f /tmp/seeder.sql; then
	echo "Seeding completed successfully"
	docker exec "$cid" rm -f /tmp/seeder.sql || true
	exit 0
else
	echo "Seeding failed" >&2
	docker exec "$cid" rm -f /tmp/seeder.sql || true
	exit 6
fi

