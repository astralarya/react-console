# react-console

Simple React.js console emulator.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![Travis Build][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[![Dependency Status][david-image]][david-url]
[![devDependency Status][david-dev-image]][david-dev-url]
[![peerDependency Status][david-peer-image]][david-peer-url]

[![Demo Image][demo-image]][demo-url]

## Example

Simple prompt that echoes back input:

```javascript
let EchoConsole = React.createClass({
	echo: function(text) {
		this.refs.console.log(text);
		this.refs.console.return();
	},
	render: function() {
		return <Console ref="console"
			handler={this.echo}
			autofocus={true}
		/>;
	}
});
```

See the [example project](docs/example) used in the [live demo][demo-url].


## Installation

    npm install --save-dev react-console-component


## Features

* Readline emulation
* Mobile friendly
* Input Method Editor (IME) support


## Props

Properties you can pass to the console element

| Prop			| Type									| Description
| ----			| ----									| ----
| autofocus?		| bool								| Autofocus the console on component mount.
| cancel?		| ()=>any							| Function that should stop execution of the current command and call `this.return()`.
| complete?		| (words: string[], cursor: number, prompt: string)=>string[]	| Return a list of possible completions given a list of (`words`), index of the word containing the cursor (`cursor`) , and the full prompt text (`prompt`).
| continue?		| (prompt: string)=>bool					| Return a boolean indicating whether to continue asking for user input on a newline given the current prompt text (`prompt`).
| handler		| (command: string)=>any					| Handle a command (`command`), logging data with `this.log()` or `this.logX()`, and calling `this.return()` when finished.
| promptLabel?		| string \| ()=>string						| String displayed to prompt user for input.
| welcomeMessage?	| string							| Initial message displayed after mount.


## Public members

| Member	| Type							| Description
| ----		| ----							| ----
| log		| (...messages: any)=>void			| Log messages to the console. If string, print the value, otherwise, print the JSON value of the message.
| logX		| (type: string, ...messages: any)=>void	| Log messages of a particular type to the console. The messages will be given the class `react-console-message-{type}`.
| return	| ()=>void					| Signal the current command has finished and a new prompt should be displayed.


## Awknoledgements

React-console is inspired by [chrisdone/jquery-console](https://github.com/chrisdone/jquery-console).

[demo-image]: https://autochthe.github.io/react-console/images/example.svg
[demo-url]: https://autochthe.github.io/react-console/#react-console
[npm-image]: https://img.shields.io/npm/v/react-console-component.svg
[npm-url]: https://npmjs.org/package/react-console-component
[downloads-image]: https://img.shields.io/npm/dm/react-console-component.svg
[travis-image]: https://img.shields.io/travis/autochthe/react-console/master.svg
[travis-url]: https://travis-ci.org/autochthe/react-console
[coveralls-image]: https://coveralls.io/repos/github/autochthe/react-console/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/autochthe/react-console?branch=master
[david-url]: https://david-dm.org/autochthe/react-console
[david-image]: https://david-dm.org/autochthe/react-console.svg
[david-dev-url]: https://david-dm.org/autochthe/react-console?type=dev
[david-dev-image]: https://david-dm.org/autochthe/react-console/dev-status.svg
[david-peer-url]: https://david-dm.org/autochthe/react-console?type=peer
[david-peer-image]: https://david-dm.org/autochthe/react-console/peer-status.svg
