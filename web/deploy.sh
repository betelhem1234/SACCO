#!/usr/bin/env bash
set -x

cd "$(dirname "$0")/.."

rm -rf dist/web
NODE_OPTIONS="--max-old-space-size=8192" npx nx build ngrx-crud

ssh equteba@10.10.20.60 'rm -rf /home/equteba/sacco/web/*'
scp -r dist/web/browser/* equteba@10.10.20.60:/home/equteba/sacco/web
