"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import './react-console.scss';

let ConsolePrompt = React.createClass({
	getDefaultProps: function() {
		return {column: -1};
	},
	componentDidMount: function() {
		this.idle();
	},
	componentDidUpdate: function() {
		this.idle();
	},
	updateSemaphore: 0,
	idle: function() {
		// Blink cursor when idle
		if(this.refs.cursor) {
			if(this.updateSemaphore == 0) {
				ReactDOM.findDOMNode(this.refs.cursor).className = "react-console-cursor";
			}
			this.updateSemaphore++;
			window.setTimeout( () => {
				this.updateSemaphore--;
				if(this.updateSemaphore == 0 && this.refs.cursor) {
					ReactDOM.findDOMNode(this.refs.cursor).className = "react-console-cursor react-console-cursor-idle";
				}
			}, 1000);
		}
	},
	renderValue: function() {
		let value = this.props.value.replace(/ /g, '\u00a0');
		if(this.props.column < 0) {
			return value;
		} else if (this.props.column == value.length) {
			return [value,<span ref="cursor" key="cursor" className="react-console-cursor">&nbsp;</span>];
		} else {
			return [value.substring(0,this.props.column),
				<span ref="cursor" key="cursor" className="react-console-cursor">{value.substring(this.props.column,this.props.column+1)}</span>,
				value.substring(this.props.column+1)];
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
	getDefaultProps: function() {
		return {value: []};
	},
	render: function() {
		return <div className={"react-console-message" + (this.props.type?" react-console-message-"+this.props.type:"")}>
			{this.props.value.map((val)=>{
				let output;
				if(typeof val == 'string') {
					output = val;
				} else {
					output = JSON.stringify(val);
				}
				return output.replace(/ /g, '\u00a0');
			}).join("\n")}
		</div>;
	}
});


module.exports = React.createClass({
	getInitialState: function() {
		return {
			promptText: '',
			restoreText: '',
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
			continue: function() {
				return false;
			},
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
			this.setState({ focus: true }, this.scrollToBottom );
		}
	},
	blur: function() {
		this.setState({ focus: false });
	},
	keyDown: function(e) {
		let keyCodes = {
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
			9: this.doComplete,
		};
		var ctrlCodes = {
			// C-a
			65: this.moveToStart,
			// C-e
			69: this.moveToEnd,
			// C-d
			68: this.forwardDelete,
			// C-n
			78: this.nextHistory,
			// C-p
			80: this.previousHistory,
			// C-b
			66: this.moveBackward,
			// C-f
			70: this.moveForward,
			// C-u
			85: this.deleteUntilStart,
			// C-k
			75: this.deleteUntilEnd,
			// C-l
			76: this.clearScreen,
		};
		var altCodes = {
			// M-f
			70: this.moveToNextWord,
			// M-b
			66: this.moveToPreviousWord,
			// M-d
			68: this.deleteNextWord,
		};
		if(this.state.acceptInput) {
			if (e.metaKey) {
				// TODO
			} else if (e.altKey) {
				if (e.keyCode in altCodes) {
					altCodes[e.keyCode]();
				}
			} else if (e.ctrlKey) {
				if (e.keyCode in ctrlCodes) {
					ctrlCodes[e.keyCode]();
				}
			} else if (e.keyCode in keyCodes) {
				if(e.keyCode == 9) { e.preventDefault(); }
				keyCodes[e.keyCode]();
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
		let promptText =
				this.state.promptText.substring(0,this.state.column)
				+ text
				+ this.state.promptText.substring(this.state.column);
		this.setState({
			promptText: promptText,
			restoreText: promptText,
			column: this.moveColumn(text.length, text.length + this.state.promptText.length)
		}, this.scrollToBottom);
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
	backDelete: function() {
		if(this.state.column > 0) {
			this.setState({
				promptText: this.state.promptText.substring(0,this.state.column-1)
					+ this.state.promptText.substring(this.state.column),
				column: this.moveColumn(-1),
			});
		}
	},
	forwardDelete: function() {
		if(this.state.column < this.state.promptText.length) {
			this.setState({
				promptText: this.state.promptText.substring(0,this.state.column)
					+ this.state.promptText.substring(this.state.column+1),
			});
		}
	},
	deleteUntilStart: function() {
		this.setState({
			promptText: this.state.promptText.substring(this.state.column),
			column: 0,
		});
	},
	deleteUntilEnd: function() {
		this.setState({
			promptText: this.state.promptText.substring(0,this.state.column),
		});
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
		let search = /\W\w/.exec(this.state.promptText.substring(this.state.column));
		if(search) {
			return search.index + this.state.column + 1;
		} else {
			return this.state.promptText.length;
		}
	},
	previousWord: function() {
		// Find first non-alphanumeric char after first alphanumeric char in reverse
		let search = /\W\w(?!.*\W\w)/.exec(this.state.promptText.substring(0,this.state.column-1));
		if(search) {
			return search.index + 1;
		} else {
			return 0;
		}
	},
	commandTrigger: function() {
		if(this.props.continue(this.state.promptText)) {
			this.consoleInsert("\n");
		} else {
			let command = this.state.promptText;
			let history = this.state.history;
			let log = this.state.log;
			history.push(command);
			log.push({ command: command, message: [] });
			this.setState({
				promptText: "",
				restoreText: "",
				column: 0,
				history: history,
				ringn: 0,
				log: log,
				acceptInput: false,
			});
			this.props.handler(command);
		}
	},
	log: function(...messages) {
		let log = this.state.log;
		log[this.state.log.length-1].message.push({value: messages});
		this.setState({
			log: log,
		}, this.scrollIfBottom() );
	},
	logX: function(type, ...messages) {
		let log = this.state.log;
		log[this.state.log.length-1].message.push({type: type, value: messages});
		this.setState({
			log: log,
		}, this.scrollIfBottom() );
	},
	return: function() {
		this.setState({ acceptInput: true }, this.scrollIfBottom() );
	},
	doComplete: function() {
		// TODO
	},
	cancelExecution: function() {
		// TODO
	},
	rotateHistory: function(n) {
		if(this.state.history.length == 0) return;
		let ringn = this.state.ringn - n;
		if(ringn < 0) {
			ringn = 0;
		} else if (ringn > this.state.history.length) {
			ringn = this.state.history.length;
		}
		if(ringn == 0) {
			this.setState({
				promptText: this.state.restoreText,
				column: this.state.restoreText.length,
				ringn: ringn,
			}, this.scrollToBottom );
		} else {
			let promptText = this.state.history[this.state.history.length-ringn];
			this.setState({
				promptText: promptText,
				column: promptText.length,
				ringn: ringn,
			}, this.scrollToBottom );
		}
	},
	previousHistory: function() {
		this.rotateHistory(-1);
	},
	nextHistory: function() {
		this.rotateHistory(1);
	},
	scrollIfBottom: function() {
		let container = ReactDOM.findDOMNode(this.refs.container);
		if(container.scrollTop == container.scrollHeight - container.offsetHeight) {
			return this.scrollToBottom;
		} else {
			return null;
		}
	},
	scrollToBottom: function() {
		let container = ReactDOM.findDOMNode(this.refs.container);
		container.scrollTop = container.scrollHeight;
	},
	render: function() {
		return <div ref="container"
				className={"react-console-container " + (this.state.focus?"react-console-focus":"react-console-nofocus")}
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
			{this.state.log.map( (val) => {
				return [
					<ConsolePrompt label={this.props.promptLabel} value={val.command} />,
					...val.message.map( (val,idx) => {
						return <ConsoleMessage key={idx} type={val.type} value={val.value} />;
					})
				];
			})}
			{this.state.acceptInput?
				<ConsolePrompt label={this.props.promptLabel} value={this.state.promptText} column={this.state.column} />
				: null
			}
		</div>;
	}
});
