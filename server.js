#!/usr/bin/env node

"use strict";

const PORT=8080;


// Webpack build server
process.argv.push('--watch');
require('./node_modules/.bin/webpack');

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
	setTimeout(function() {
		serverStatus();
	}, 10000);
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
