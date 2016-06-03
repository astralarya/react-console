let project = 'react-console';
let externals = {
	"react": "React",
	"react-dom": "ReactDOM",
};
let library = 'Console';


let webpack = require('webpack');
let path = require('path');
let fs = require('fs');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let options = {
	dev: process.argv.indexOf('--dev') != -1,
}

let bundle = {
	context: __dirname + "/src",
	entry: './' + project + '.tsx',
	output: {
		path: __dirname + '/dist/bundle',
		filename: project + '.bundle.js',
		library: library,
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
		new ExtractTextPlugin(project + '.css'),
	],
};

let production_plugins = [
		new ExtractTextPlugin(project + '.min.css'),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.DedupePlugin()
]


let bundle_min = Object.assign({},bundle, {
	output: {
		path: __dirname + '/dist/bundle',
		filename: project + '.bundle.min.js',
		library: library,
		libraryTarget: "var",
	},
	plugins: production_plugins,
});

let dist = Object.assign({},bundle, {
	output: {
		path: __dirname + '/dist',
		filename: project + '.js',
		library: library,
		libraryTarget: "var",
	},
	externals: externals,
});

let dist_min = Object.assign({},dist, {
	output: {
		path: __dirname + '/dist',
		filename: project + '.min.js',
		library: library,
		libraryTarget: "var",
	},
	plugins: production_plugins,
});

let lib = Object.assign({},dist, {
	output: {
		path: __dirname + '/lib',
		filename: project + '.js',
		library: library,
		libraryTarget: "commonjs2",
	},
	devtool: 'source-map',
});

let development = Object.assign({},bundle, {
	entry: '../example/example.tsx',
	output: {
		path: __dirname + '/example/dist',
		filename: project + '.example.js',
		library: "Example",
		libraryTarget: "var",
	},
	devtool: 'source-map',
	plugins: [
		new ExtractTextPlugin(project + '.example.css'),
	],
});

if(options.dev) {
	module.exports = [ development ];
} else {
	module.exports = [ bundle, bundle_min, dist, dist_min, lib, development ];
}
