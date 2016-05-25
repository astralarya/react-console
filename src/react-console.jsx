"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import './react-console.css';

let ConsolePrompt = React.createClass({
	render: function() {
		return <div className="react-console-prompt-box">
			<span className="react-console-prompt-label">{this.props.label}</span>
			<span className="react-console-prompt">{this.props.value}</span>
		</div>;
	}
});

let ConsoleMessage = React.createClass({
	render: function() {
		return <div className={"react-console-message " + this.props.success?"react-console-message-success":"react-console-message-failure"}>
			{this.props.value}
		</div>;
	}
});


module.exports = React.createClass({
	getInitialState: function() {
		return {
			promptText: '',
			column: 0,
			history: [],
			ringn: 0,
			log: [],
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
			{this.state.log.map( (val, idx) => {
				return [
					<ConsolePrompt label={this.props.promptLabel} value={val.command} />,
					(val.message?
						<ConsoleMessage success={val.message.success} value={val.message.value} />
						:null
					)
				];
			})}
		</div>;
	}
});
