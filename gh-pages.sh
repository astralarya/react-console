#!/usr/bin/env bash

cd "$( dirname "${BASH_SOURCE[0]}" )"

npm run build &&
git checkout gh-pages &&
cp -r example/dist app &&
git commit -am"$*" &&
git push

git checkout master
