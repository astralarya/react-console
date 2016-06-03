var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

let options = {
	dev: process.argv.indexOf('--dev') != -1,
}

let bundle = {
	context: __dirname + "/src",
	entry: './react-console.tsx',
	output: {
		path: __dirname + '/dist',
		filename: 'react-console.bundle.js',
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

let production_plugins = [
		new ExtractTextPlugin("react-console.min.css"),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin()
]


let bundle_min = Object.assign({},bundle, {
	output: {
		path: __dirname + '/dist',
		filename: 'react-console.bundle.min.js',
		library: "Console",
		libraryTarget: "var",
	},
	plugins: production_plugins,
});

let dist = Object.assign({},bundle, {
	output: {
		path: __dirname + '/dist',
		filename: 'react-console.js',
		library: "Console",
		libraryTarget: "var",
	},
	externals: {
		"react": "React",
		"react-dom": "ReactDOM",
	},
});

let dist_min = Object.assign({},dist, {
	output: {
		path: __dirname + '/dist',
		filename: 'react-console.min.js',
		library: "Console",
		libraryTarget: "var",
	},
	plugins: production_plugins,
});

let lib = Object.assign({},dist, {
	output: {
		path: __dirname + '/lib',
		filename: 'react-console.js',
		library: "Console",
		libraryTarget: "commonjs2",
	},
});

let development = Object.assign({},bundle, {
	entry: '../example/echo.tsx',
	output: {
		path: __dirname + '/example/dist',
		filename: 'react-console.js',
		library: "Example",
		libraryTarget: "var",
	},
});

if(options.dev) {
	module.exports = [ development ];
} else {
	module.exports = [ bundle, bundle_min, dist, dist_min, lib, development ];
}
