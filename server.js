#!/usr/bin/env node

"use strict";

const PORT=8080;

const webpack = require('webpack');
const karma = require('karma');
const express = require('express');
const colors = require('colors');
const os = require('os');

// Status logging
function serverStatus() {
	console.log("Server listening on:")
	console.log(colors.cyan(`http://localhost:${PORT}`));

	let ifaces = os.networkInterfaces();
	Object.keys(ifaces).forEach(function (ifname) {
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' === iface.family && iface.internal === false) {
				console.log(colors.cyan(`http://${iface.address}:${PORT}`));
			}
		});
	});
}
let logSemaphore = 0;
function logStart() {
	logSemaphore++;
}
function logEnd() {
	setTimeout(function() {
		logSemaphore--;
		if(logSemaphore == 0) {
			console.log();
			serverStatus();
			console.log();
		}
	},100);
}

// Express web server
let app = express();
app.use('/', express.static(`${__dirname}/dev`));
app.listen(PORT, function() {
	serverStatus();
});

// Webpack build server
let compiler = webpack(require('./webpack.config.js'));
compiler.watch({},function(err,stats) {
	console.log(stats.toString({colors:true,chunks:false,children:false}));
	logStart();
	logEnd();
});

// Karma test server
let karmaServer = new karma.Server({
	configFile: `${__dirname}/karma.conf.js`,
	singleRun: false,
});
karmaServer.on('run_start', function() {
	logStart();
});
karmaServer.on('run_complete', function() {
	logEnd();
});
karmaServer.start();
