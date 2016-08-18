'use strict';

// Karma configuration

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['detectBrowsers', 'mocha'],


		// list of files / patterns to load in the browser
		files: [
			'test/*.tsx'
		],


		// list of files to exclude
		exclude: [
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'test/*.tsx': ['webpack', 'sourcemap'],
		},

		webpack: {
			module: {
				loaders: [
					{
						test: /\.tsx?$/,
						loader: "ts-loader",
					},
					{
						test: /\.s?css$/,
						loader: "css-loader?sourceMap!sass-loader?sourceMap",
					},
				],
				preLoaders: [
					{
						test: /\.(css|js)$/,
						loader: "source-map-loader",
					},
				],
				postLoaders: [
					{
						test: /\.tsx?$/,
						include: /src\//,
						loader: "istanbul-instrumenter",
					},
				],
			},
			devtool: 'inline-source-map',
			externals: {
				'cheerio': 'window',
				'react/addons': true,
				'react/lib/ExecutionEnvironment': true,
				'react/lib/ReactContext': true,
			},
		},

		// Travis CI Chrome config
		customLaunchers: {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox'],
			},
		},

		detectBrowsers: {
			postDetection: function(availableBrowser) {
				if(process.env.TRAVIS) {
					availableBrowser[availableBrowser.indexOf('Chrome')] = 'Chrome_travis_ci';
				}
				return availableBrowser;
			}
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['mocha', 'coverage', 'coveralls'],
		coverageReporter: {
			reporters: [
				{ type: 'text-summary' },
				{ type: 'lcovonly', dir: 'coverage/' },
			]
		},


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// Long timeout to allow for slow test environments
		browserDisconnectTimeout: 10000,

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	})
}
