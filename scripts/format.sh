#!/bin/bash

set -e # exit on first error

prettier --ignore-unknown --write "$@"

onlypy=()

for o in "$@"; do
    if [[ "$o" =~ .\.py$ ]] ; then
        onlypy+=("$o")
    fi
done

if [[ ${onlypy[@]} ]]; then
    python -m black --include="\.py$" --exclude="\.(json|sh)$" -- "${onlypy[@]}"
fi
