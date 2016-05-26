"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import './react-console.scss';

let ConsolePrompt = React.createClass({
	getDefaultProps: function() {
		return {column: -1};
	},
	renderValue: function() {
		if(this.props.column < 0) {
			return this.props.value;
		} else if (this.props.column == this.props.value.length) {
			return [this.props.value,<span key="cursor" className="react-console-cursor">&nbsp;</span>];
		} else {
			return [this.props.value.substring(0,this.props.column),
				<span key="cursor" className="react-console-cursor">{this.props.value.substring(this.props.column,this.props.column+1)}</span>,
				this.props.value.substring(this.props.column+1)];
		}
	},
	render: function() {
		return <div className="react-console-prompt-box">
			<span className="react-console-prompt-label">{this.props.label}</span>
			<span className="react-console-prompt">{ this.renderValue() }</span>
		</div>;
	}
});

let ConsoleMessage = React.createClass({
	render: function() {
		return <div className={"react-console-message" + (this.props.type?" react-console-message-"+this.props.type:"")}>
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
			focus: false,
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
			this.focus();
		}
	},
	focus: function() {
		if(!window.getSelection().toString()) {
			ReactDOM.findDOMNode(this.refs.typer).focus();
			this.setState({ focus: true });
		}
	},
	blur: function() {
		this.setState({ focus: false });
	},
	keyDown: function(e) {
		if(this.state.acceptInput) {
			if(e.altKey || e.ctrlKey || e.metaKey) {
				// TODO
			} else if (e.keyCode in this.keyCodes) {
				this.keyCodes[e.keyCode]();
			} else {
				let key = String.fromCharCode(e.keyCode);
				if(!e.shiftKey) {
					key = key.toLowerCase();
				}
				this.consoleInsert(key);
			}
		}
	},
	keyCodes: {
		// left
		37: this.moveBackward,
		// right
		39: this.moveForward,
		// up
		38: this.previousHistory,
		// down
		40: this.nextHistory,
		// backspace
		8:  this.backDelete,
		// delete
		46: this.forwardDelete,
		// end
		35: this.moveToEnd,
		// start
		36: this.moveToStart,
		// return
		13: this.commandTrigger,
		// tab
		18: this.doNothing,
		// tab
		9: this.doComplete
	},
	consoleInsert: function(text) {
		this.setState({
			promptText: this.state.promptText.substring(0,this.state.column)
				+ text
				+ this.state.promptText.substring(this.state.column),
			column: this.moveColumn(text.length, text.length + this.state.promptText.length)
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
	moveBackward: function() {
		this.setState({
			column: this.moveColumn(-1)
		});
	},
	moveForward: function() {
		this.setState({
			column: this.moveColumn(1)
		});
	},
	moveToStart: function() {
		this.setState({
			column: 0
		});
	},
	moveToEnd: function() {
		this.setState({
			column: this.state.promptText.length
		});
	},
	moveToEnd: function() {
		this.setState({
			column: this.state.promptText.length
		});
	},
	moveToNextWord: function() {
		this.setState({
			column: this.nextWord()
		});
	},
	moveToPreviousWord: function() {
		this.setState({
			column: this.previousWord()
		});
	},
	nextWord: function() {
		// Find first alphanumeric char after first non-alphanumeric char
		let search = /\W\w/.exec(this.state.promptText.substring(this.props.column));
		if(search) {
			return search.index + this.state.column + 1;
		} else {
			return this.state.promptText.length;
		}
	},
	previousWord: function() {
		// Find first non-alphanumeric char after first alphanumeric char in reverse
		let search = /\W\w(?!.*\W\w)/.exec(this.state.promptText.substring(0,column-1));
		if(search) {
			return search.index + 2;
		} else {
			return 0;
		}
	},
	render: function() {
		return <div className={"react-console-container " + (this.state.focus?"react-console-focus":"react-console-nofocus")}
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
				onBlur={this.blur}
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
						<ConsoleMessage type={val.message.type} value={val.message.value} />
						:null
					)
				];
			})}
			<ConsolePrompt label={this.props.promptLabel} value={this.state.promptText} column={this.state.column} />
		</div>;
	}
});
