#!/usr/bin/env node

"use strict";

process.argv.push('--watch');
require('./node_modules/.bin/webpack');

var express = require('express');
var app = express();

const PORT=8080;

app.use('/', express.static(__dirname + '/example/dist'));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/example/index.html');
});

app.listen(PORT, function() {
	console.log("Server listening on: http://localhost:%s", PORT);
});

