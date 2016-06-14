// Project settings

let project = 'react-console';
let library = 'Console';
let externals = {
	"react": "React",
	"react-dom": "ReactDOM",
};

// Build system

let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	context: __dirname,
	entry: './example.tsx',
	output: {
		path: __dirname + '/dist',
		filename: project + '.example.js',
		library: "Example",
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
				loader: ExtractTextPlugin.extract("css-loader?sourceMap!sass-loader?sourceMap"),
			},
		],
		preLoaders: [
			{
				test: /\.js$/,
				loader: "source-map-loader",
			}
		],
	},
	devtool: 'source-map',
	plugins: [
		new ExtractTextPlugin(project + '.example.css'),
	],
};
