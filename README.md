# react-console
Simple React console emulator

Inspired by [chrisdone/jquery-console](https://github.com/chrisdone/jquery-console).

## Example

Simple prompt that echoes back input:

```javascript
let EchoConsole = React.createClass({
	echo: function(text) {
		this.refs.console.log(text);
		this.refs.console.return();
	},
	render: function() {
		return <Console ref="console" handler={this.echo}/>;
	}
});
```

Include `dist/react-console.js` and `dist/react-console.css` in your html.

See `example/echo.tsx` for an example using Typescript.


## Props

Properties you can pass to the console element

| Prop				| Type																	| Description
| ----				| ----																	| ----
| autofocus?		| bool																	| Autofocus the console on component mount.
| cancel?			| function(): any														| Function that should stop execution of the current command and call `this.return()`.
| complete?			| function(words: string[], cursor: number, prompt: string): string[]	| Return a list of possible completions given a list of (`words`), index of the word containing the cursor (`cursor`) , and the full prompt text (`prompt`).
| continue?			| function(prompt: string): bool										| Return a boolean indicating whether to continue asking for user input on a newline given the current prompt text (`prompt`).
| handler			| function(command: string): any										| Handle a command (`command`), logging data with `this.log()` or `this.logX()`, and calling `this.return()` when finished.
| promptLabel?		| string																| String displayed to prompt user for input.
| welcomeMessage?	| string																| Initial message displayed after mount.

## Public members

| Member	| Type												| Description
| ----		| ----												| ----
| log		| function(...messages: any): void					| Log messages to the console. If string, print the value, otherwise, print the JSON value of the message.
| logX		| function(type: string, ...messages: any): void	| Log messages of a particular type to the console. The messages will be given the class `react-console-message-{type}`.
| return	| function(): void									| Signal the current command has finished and a new prompt should be displayed.
