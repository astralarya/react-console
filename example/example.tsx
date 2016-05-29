"use strict";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Console from '../src/react-console.jsx';

export function init(element) {
	let ReactConsole = ReactDOM.render(<Console handler={echo}/>, element);
	function echo(text) {
		window.setTimeout(function() {
			ReactConsole.log(text);
			window.setTimeout(function() {
				ReactConsole.return();
			},200);
		}, 500);
	}
}
