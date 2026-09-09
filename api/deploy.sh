#!/usr/bin/env bash
set -x

echo "Deploying SACCO API to Local Server"

cd "$(dirname "$0")"

mvn -DskipTests clean install

scp target/api-0.0.1-SNAPSHOT.jar equteba@10.10.20.60:/home/equteba/sacco/api/bin

ssh equteba@10.10.20.60
