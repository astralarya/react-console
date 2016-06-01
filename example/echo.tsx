"use strict";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Console from '../src/react-console.tsx';

class EchoConsole extends React.Component<{},{}> {
	child: {
		console?: Console,
	} = {};
	echo = (text: string) => {
		this.child.console.log(text);
		this.child.console.return();
	}
	render() {
		return <Console ref={ref => this.child.console = ref} handler={this.echo}/>;
	}
}

export function init(element: Element) {
	ReactDOM.render(<EchoConsole/>, element);
}
