"use strict";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Console from '../src/react-console.tsx';

export function init(element: Element) {
	let ReactConsole = ReactDOM.render(<Console handler={echo}/>, element) as Console;
	function echo(text: string) {
		window.setTimeout(function() {
			ReactConsole.log(text);
			window.setTimeout(function() {
				ReactConsole.return();
			},200);
		}, 500);
	}
}
