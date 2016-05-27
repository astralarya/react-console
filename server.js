#!/usr/bin/env node

"use strict";

var express = require('express');
var app = express();

const PORT=8080;

app.use('/', express.static(__dirname + '/example/dist'));

app.listen(PORT, function() {
	console.log("Server listening on: http://localhost:%s", PORT);
});

