'use strict';


let FailPlugin = require('webpack-fail-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let nodeExternals = require('webpack-node-externals');

module.exports = {
	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
			},
			{
				test: /\.s?css$/,
				loader: ExtractTextPlugin.extract("css-loader?sourceMap!sass-loader?sourceMap"),
			},
		],
		preLoaders: [
			{
				test: /\.(css|js)$/,
				loader: "source-map-loader",
			}
		],
	},
	output: {
		devtoolModuleFilenameTemplate: '[absolute-resource-path]',
		devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
	},
	devtool: 'source-map',
	target: 'node',
	externals: [nodeExternals()],
	plugins: [
		FailPlugin,
		new ExtractTextPlugin('test.css'),
	],
};

