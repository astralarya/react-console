# react-console
Simple React console emulator

Inspired by [chrisdone/jquery-console](https://github.com/chrisdone/jquery-console).

## Example

```javascript
import ReactConsole from 'react-console';

let EchoPrompt = React.createClass({
	echo: function(text) {
		this.console.log(text);
		this.console.return();
	},
	render: function() {
		return <Console ref="console" handler={this.echo}/>;
	}
});
```
