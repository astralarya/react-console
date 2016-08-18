#!/usr/bin/env bash

EXAMPLE_DIR=example
EXAMPLE_DIST=example/dist/.
APP_DIR=docs/app/

if [ -z "$*" ]; then
	echo Error: commit message required
	exit 0
fi

cd "$( dirname "${BASH_SOURCE[0]}" )"

cd "$EXAMPLE_DIR" &&
npm install &&
cd - &&
cp -r "$EXAMPLE_DIST" "$APP_DIR" &&
git commit -am"$*" &&
git push
