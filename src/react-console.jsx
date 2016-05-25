"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import './react-console.css';

module.exports = React.createClass({
	getInitialState: function() {
		return {
			promptText: '',
			column: 0,
			history: [],
			ringn: 0,
		};
	},
	getDefaultProps: function() {
		return {
			promptLabel: '> ',
		};
	},
	componentDidMount() {
		if(this.props.autofocus) {
			ReactDOM.findDOMNode(this.refs.typer).focus();
		}
	},
	render: function() {
		return <div className="react-console-container">
			<textarea ref="typer"
				className="react-console-typer"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
				style={{
					position: 'absolute',
					top: 0,
					left: '-9999px',
				}}
			></textarea>
			{this.props.welcomeMessage?
				<div className="react-console-message react-console-welcome">
					this.props.welcomeMessage
				</div>
				: null
			}
		</div>;
	}
});
