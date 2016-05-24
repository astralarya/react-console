var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

let config = {
	context: __dirname + "/src",
	entry: './react-console.jsx',
	output: {
		path: __dirname + '/dist',
		filename: 'react-console.js',
		library: "Console",
		libraryTarget: "var",
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loaders: ['babel?cacheDirectory'],
			},
			{
				test: /\.s?css$/,
				loader: ExtractTextPlugin.extract("css!sass")
			},
		]
	},
	plugins: [
		new ExtractTextPlugin("react-console.css"),
	],
};


let min_config = Object.assign({},config);
min_config.output.filename = 'react-console.min.js';
min_config.plugins = [
	new ExtractTextPlugin("react-console.min.css"),
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': '"production"'
	}),
	new webpack.optimize.UglifyJsPlugin(),
	new webpack.optimize.OccurenceOrderPlugin(),
	new webpack.optimize.DedupePlugin()
];

module.exports = [ config, min_config ];
