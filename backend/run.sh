#!/usr/bin/env bash

set -e

sudo systemctl start docker

tmux new-session -d -s dev -n nvim

tmux new-window -t dev -n docker
tmux new-window -t dev -n app
tmux new-window -t dev -n drizzle

tmux send-keys -t dev:docker 'docker compose up' C-m
tmux send-keys -t dev:app 'npm run dev' C-m
tmux send-keys -t dev:drizzle 'npx drizzle-kit studio' C-m

tmux select-window -t dev:nvim

tmux attach -t dev
