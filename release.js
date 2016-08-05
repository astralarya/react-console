#!/usr/bin/env node

'use strict';

const USER = 'autochthe';
const REPO = 'react-console';
const CHANGELOG = './CHANGELOG.md';
const ASSETS = [
	'dist/dist.tar.gz',
	'dist/dist.zip',
	'dist/dist-min.tar.gz',
	'dist/dist-min.zip',
];

const project = require('./package.json');

const changelogParser = require('changelog-parser');
const GitHubAPI = require('github');
const path = require('path');
const semver = require('semver');

// Read changelog
changelogParser(CHANGELOG, (err, result) => {
	if (err) throw err;

	let found = false;
	for(let elem of result.versions) {
		if (elem.version == project.version) {
			found = true;
			if(!elem.body) {
				console.log('Changelog body is required');
				process.exit(1);
			}
			createRelease(project.version, elem.body);
		}
	}
	if(!found) {
		console.log(`No changelog found for v${project.version}`);
		process.exit(1);
	}
})

function createRelease(version, body) {
	console.log(`Creating new Github release for v${version}`);
	console.log(body);

	let auth = {
		type: 'oauth',
		token: '6c64814fd14fc726673855dfa285f201ac8d93cc',
	};

	// Connect to github
	let github = new GitHubAPI();
	github.authenticate(auth);
	github.repos.createRelease({
		user: USER,
		repo: REPO,
		tag_name: `v${version}`,
		body: body,
		prerelease: semver.prerelease(version)?true:false,
	}, (err,res) => {
		if(err) {
			console.log(err);
		} else {
			let id = res.id;

			console.log('Uploading assets')
			for(let asset of ASSETS) {
				github.repos.uploadAsset({
					user: USER,
					repo: REPO,
					id: id,
					name: path.basename(asset),
					filePath: asset,
				});
			}
			console.log('DONE')
		}
	});
}
