var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

let config = {
	context: __dirname + "/src",
	entry: './react-console.tsx',
	output: {
		path: __dirname + '/dist',
		filename: 'react-console.js',
		library: "Console",
		libraryTarget: "var",
	},
	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
			},
			{
				test: /\.s?css$/,
				loader: ExtractTextPlugin.extract("css!sass"),
			},
		],
		preLoaders: [
			{
				test: /\.js$/,
				loader: "source-map-loader",
			}
		],
	},
	plugins: [
		new ExtractTextPlugin("react-console.css"),
	],
};


let production = Object.assign({},config, {
	output: {
		path: __dirname + '/dist',
		filename: 'react-console.min.js',
		library: "Console",
		libraryTarget: "var",
	},
	plugins: [
		new ExtractTextPlugin("react-console.min.css"),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin()
	]
});

let development = Object.assign({},config, {
	entry: '../example/example.tsx',
	output: {
		path: __dirname + '/example/dist',
		filename: 'react-console.js',
		library: "ExampleConsole",
		libraryTarget: "var",
	},
});

module.exports = [ config, production, development ];
