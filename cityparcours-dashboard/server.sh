#!/usr/bin/env bash
echo "Serving cityparcours-dashboard!"
npm install -g serve
serve -l 8082 -s build
