#!/usr/bin/env node

"use strict";

const PORT=8080;


// Webpack build server
var webpack = require('webpack');
var config = require('./webpack.config.js');
var compiler = webpack(config);
var colors = require('colors');

var logSemaphore = 0;
compiler.watch({},function(err,stats) {
	console.log(stats.toString({colors:true,chunks:false,children:false}));
	logSemaphore++;
	setTimeout(function() {
		logSemaphore--;
		if(logSemaphore == 0) {
			console.log();
			serverStatus();
			console.log();
		}
	},100);
});

// Express web server
var express = require('express');
var app = express();
var os = require('os');
var ifaces = os.networkInterfaces();

app.use('/dist', express.static(__dirname + '/dist'));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, function() {
	serverStatus();
});

function serverStatus() {
	console.log("Server listening on:")
	console.log(colors.cyan("http://localhost:%s"), PORT);

	Object.keys(ifaces).forEach(function (ifname) {
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' === iface.family && iface.internal === false) {
				console.log(colors.cyan("http://%s:%s"), iface.address, PORT);
			}
		});
	});
}
