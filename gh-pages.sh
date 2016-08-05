#!/usr/bin/env bash

EXAMPLE_DIR=example
EXAMPLE_DIST=example/dist/.
APP_DIR=app/

if [ -z "$*" ]; then
	echo Error: commit message required
	exit 0
fi

cd "$( dirname "${BASH_SOURCE[0]}" )"

cd "$EXAMPLE_DIR" &&
npm install &&
cd - &&
git checkout gh-pages &&
cp -r "$EXAMPLE_DIST" "$APP_DIR" &&
git commit -am"$*" &&
git push

git checkout master
