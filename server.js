#!/usr/bin/env node

"use strict";

const PORT=8080;


// Webpack build server
require('./node_modules/.bin/webpack');
var webpack = require('webpack');
var config = require('./webpack.config.js');
var compiler = webpack(require('./webpack.config.js'));

var first_wave = config.length - 1;
compiler.watch({},function(err,stats) {
	if(!err && --first_wave < 0) serverStatus();
});

// Express web server
var express = require('express');
var app = express();
var os = require('os');
var ifaces = os.networkInterfaces();

app.use('/', express.static(__dirname + '/example/dist'));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/example/index.html');
});

app.listen(PORT, function() {
	serverStatus();
});

function serverStatus() {
	console.log("Server listening on:")
	console.log("http://localhost:%s", PORT);

	Object.keys(ifaces).forEach(function (ifname) {
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' === iface.family && iface.internal === false) {
				console.log("http://%s:%s", iface.address, PORT);
			}
		});
	});
}
