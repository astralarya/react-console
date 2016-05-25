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
			acceptInput: true,
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
	focus: function() {
		if(!window.getSelection().toString()) {
			ReactDOM.findDOMNode(this.refs.typer).focus();
		}
	},
	keyDown: function(e) {
		if(this.state.acceptInput) {
			if(e.altKey || e.ctrlKey || e.metaKey) {
				// TODO
			} else {
				let key = String.fromCharCode(e.keyCode);
				if(!e.shiftKey) {
					key = key.toLowerCase();
				}
				this.consoleInsert(key);
			}
		}
	},
	consoleInsert: function(text) {
		this.setState({
			promptText: this.state.promptText.substring(0,this.state.column)
				+ text
				+ this.state.promptText.substring(this.state.column),
			column: this.moveColumn(text.length, text + this.state.promptText.length)
		});
	},
	moveColumn: function(n, max = this.state.promptText.length) {
		let pos = this.state.column + n;
		if (pos < 0) {
			return 0;
		} if (pos > max) {
			return max;
		} else {
			return pos;
		}
	},
	render: function() {
		return <div className="react-console-container"
				onClick={this.focus}
			>
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
				onKeyDown={this.keyDown}
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
			<ConsolePrompt label={this.props.promptLabel} value={this.state.promptText} />
		</div>;
	}
});
