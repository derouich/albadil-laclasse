#!/usr/bin/env bash
echo "Serving albadil-dashboard!"
npm install -g serve
serve -l 8082 -s build
