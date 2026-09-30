#!/bin/bash
set -e

if ! psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='kratos'" | grep -q 1; then
	psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE DATABASE kratos"
fi
