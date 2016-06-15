#!/usr/bin/env bash

if [ -z "$*" ]; then
	echo Error: commit message required
	exit 0
fi

cd "$( dirname "${BASH_SOURCE[0]}" )"

cd example &&
npm install &&
cd .. &&
git checkout gh-pages &&
cp -r example/dist/. app/ &&
git commit -am"$*" &&
git push

git checkout master
