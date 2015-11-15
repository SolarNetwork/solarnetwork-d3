#!/usr/bin/env bash

# Do a diff of files found via `find` compared to those imported via `smash`, we expect the list to be the same
diff <(find src -type f -not -path '*/\.*' |sort) <(./node_modules/smash/smash --list src/sn.js |sort)
