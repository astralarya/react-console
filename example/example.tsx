"use strict";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Console from '../src/react-console.tsx';

interface EchoConsoleState {
	count: number;
}
class EchoConsole extends React.Component<{},EchoConsoleState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			count: 0,
		};
	}
	child: {
		console?: Console,
	} = {};
	echo = (text: string) => {
		this.child.console.log(text);
		this.setState({
			count: this.state.count+1,
		}, this.child.console.return);
	}
	promptLabel = () => {
		return this.state.count + "> ";
	}
	render() {
		return <Console ref={ref => this.child.console = ref}
			handler={this.echo}
			promptLabel={this.promptLabel}
			autofocus={true}
		/>;
	}
}

export function init(element: Element) {
	ReactDOM.render(<EchoConsole/>, element);
}
