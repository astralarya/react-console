"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import Console from './react-console.jsx';

export function init(element) {
	ReactDOM.render(<Console />, element);
}
