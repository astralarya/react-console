"use strict";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './react-console.scss';

interface ConsolePromptProps {
	column?: number;
	value: string;
	label: string;
}
class ConsolePrompt extends React.Component<ConsolePromptProps,{}> {
	static defaultProps: ConsolePromptProps = {
		column: -1,
		value: "",
		label: "> "
	}
	child: {
		cursor?: Element;
	} = {};
	updateSemaphore: number = 0;
	componentDidMount() {
		this.idle();
	}
	componentDidUpdate() {
		this.idle();
	}
	idle() {
		// Blink cursor when idle
		if(this.child.cursor) {
			if(this.updateSemaphore == 0) {
				this.child.cursor.className = "react-console-cursor";
			}
			this.updateSemaphore++;
			window.setTimeout( () => {
				this.updateSemaphore--;
				if(this.updateSemaphore == 0 && this.child.cursor) {
					this.child.cursor.className = "react-console-cursor react-console-cursor-idle";
				}
			}, 1000);
		}
	}
	renderValue() {
		let value = this.props.value.replace(/ /g, '\u00a0');
		if(this.props.column < 0) {
			return [value];
		} else if (this.props.column == value.length) {
			return [value,<span ref={ref => this.child.cursor = ref} key="cursor" className="react-console-cursor">&nbsp;</span>];
		} else {
			return [value.substring(0,this.props.column),
				<span ref={ref => this.child.cursor = ref} key="cursor" className="react-console-cursor">{value.substring(this.props.column,this.props.column+1)}</span>,
				value.substring(this.props.column+1)];
		}
	}
	render() {
		return <div className="react-console-prompt-box">
			<span className="react-console-prompt-label">{this.props.label}</span>
			<span className="react-console-prompt">{ this.renderValue() }</span>
		</div>;
	}
}

interface ConsoleMessageProps {
	type?: string;
	value: any[];
}
function ConsoleMessage(props: ConsoleMessageProps): JSX.Element {
	return <div className={"react-console-message" + (props.type?" react-console-message-"+props.type:"")}>
		{props.value.map((val: any)=>{
			let output: string;
			if(typeof val == 'string') {
				output = val;
			} else {
				output = JSON.stringify(val);
			}
			return output.replace(/ /g, '\u00a0');
		}).join("\n")}
	</div>;
}

interface LogMessage {
	type?: string;
	value: any[];
}
interface LogEntry {
	command: string;
	message: LogMessage[];
}
interface ConsoleProps{
	handler(command: string): any;
	cancel?(): any;
	complete?(words: string[], curr: number, promptText: string): string[];
	continue?(promptText: string): boolean;
	autofocus?: boolean;
	promptLabel?: string;
	welcomeMessage?: string;
}
interface ConsoleState{
	promptText?: string;
	restoreText?: string;
	column?: number;
	history?: string[];
	ringn?: number;
	log?: LogEntry[];
	focus?: boolean;
	acceptInput?: boolean;
};
export default class extends React.Component<ConsoleProps,ConsoleState> {
	static defaultProps = {
		promptLabel: '> ',
		continue: function() { return false; },
		cancel: function() {},
	};
	child: {
		typer?: HTMLElement;
		container?: HTMLElement;
	} = {};
	constructor(props: ConsoleProps) {
		super(props);
		this.state = {
			promptText: '',
			restoreText: '',
			column: 0,
			history: [],
			ringn: 0,
			log: [],
			focus: false,
			acceptInput: true,
		};
	}
	log(...messages: any[]) {
		let log = this.state.log;
		log[this.state.log.length-1].message.push({value: messages});
		this.setState({
			log: log,
		}, this.scrollIfBottom() );
	}
	logX(type: string, ...messages: any[]) {
		let log = this.state.log;
		log[this.state.log.length-1].message.push({type: type, value: messages});
		this.setState({
			log: log,
		}, this.scrollIfBottom() );
	}
	return() {
		this.setState({ acceptInput: true }, this.scrollIfBottom() );
	}
	componentDidMount() {
		if(this.props.autofocus) {
			this.focus();
		}
	}
	focus = () => {
		if(!window.getSelection().toString()) {
			this.child.typer.focus();
			this.setState({ focus: true }, this.scrollToBottom );
		}
	}
	blur = () => {
		this.setState({ focus: false });
	}
	keyDown = (e: KeyboardEvent) => {
		interface keyMap {
			[key: number]: ()=>void
		}
		let keyCodes: keyMap = {
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
		var ctrlCodes: keyMap = {
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
			// C-l TODO
			//76: this.clearScreen,
		};
		var altCodes: keyMap = {
			// M-f
			70: this.moveToNextWord,
			// M-b
			66: this.moveToPreviousWord,
			// M-d TODO
			//68: this.deleteNextWord,
		};
		if(this.state.acceptInput) {
			if (e.altKey) {
				if (e.keyCode in altCodes) {
					altCodes[e.keyCode]();
				}
				e.preventDefault();
			} else if (e.ctrlKey) {
				if (e.keyCode in ctrlCodes) {
					ctrlCodes[e.keyCode]();
				}
				e.preventDefault();
			} else if (e.keyCode in keyCodes) {
				keyCodes[e.keyCode]();
				e.preventDefault();
			}
		}
	}
	change = (e: Event) => {
		this.consoleInsert((e.target as HTMLInputElement).value);
		(e.target as HTMLInputElement).value = "";
	}
	paste = (e: Event) => {
		this.consoleInsert((e.target as HTMLInputElement).value);
		(e.target as HTMLInputElement).value = "";
	}
	consoleInsert = (text: string) => {
		let promptText =
				this.state.promptText.substring(0,this.state.column)
				+ text
				+ this.state.promptText.substring(this.state.column);
		this.setState({
			promptText: promptText,
			restoreText: promptText,
			column: this.moveColumn(text.length, text.length + this.state.promptText.length)
		}, this.scrollToBottom);
	}
	moveColumn = (n: number, max: number = this.state.promptText.length) => {
		let pos = this.state.column + n;
		if (pos < 0) {
			return 0;
		} if (pos > max) {
			return max;
		} else {
			return pos;
		}
	}
	backDelete = () => {
		if(this.state.column > 0) {
			this.setState({
				promptText: this.state.promptText.substring(0,this.state.column-1)
					+ this.state.promptText.substring(this.state.column),
				column: this.moveColumn(-1),
			}, this.scrollToBottom);
		}
	}
	forwardDelete = () => {
		if(this.state.column < this.state.promptText.length) {
			this.setState({
				promptText: this.state.promptText.substring(0,this.state.column)
					+ this.state.promptText.substring(this.state.column+1),
			}, this.scrollToBottom);
		}
	}
	deleteUntilStart = () => {
		this.setState({
			promptText: this.state.promptText.substring(this.state.column),
			column: 0,
		}, this.scrollToBottom);
	}
	deleteUntilEnd = () => {
		this.setState({
			promptText: this.state.promptText.substring(0,this.state.column),
		}, this.scrollToBottom);
	}
	moveBackward = () => {
		this.setState({
			column: this.moveColumn(-1)
		}, this.scrollToBottom);
	}
	moveForward = () => {
		this.setState({
			column: this.moveColumn(1)
		}, this.scrollToBottom);
	}
	moveToStart = () => {
		this.setState({
			column: 0
		}, this.scrollToBottom);
	}
	moveToEnd = () => {
		this.setState({
			column: this.state.promptText.length
		}, this.scrollToBottom);
	}
	moveToNextWord = () => {
		this.setState({
			column: this.nextWord()
		}, this.scrollToBottom);
	}
	moveToPreviousWord = () => {
		this.setState({
			column: this.previousWord()
		}, this.scrollToBottom);
	}
	nextWord(): number {
		// Find first alphanumeric char after first non-alphanumeric char
		let search = /\W\w/.exec(this.state.promptText.substring(this.state.column));
		if(search) {
			return search.index + this.state.column + 1;
		} else {
			return this.state.promptText.length;
		}
	}
	previousWord(): number {
		// Find first non-alphanumeric char after first alphanumeric char in reverse
		let search = /\W\w(?!.*\W\w)/.exec(this.state.promptText.substring(0,this.state.column-1));
		if(search) {
			return search.index + 1;
		} else {
			return 0;
		}
	}
	doComplete = () => {
		if(this.props.complete) {
			// Split text and find current word
			let words = this.state.promptText.split(" ");
			let curr = 0;
			let idx = words[0].length;
			while(idx < this.state.column && curr + 1 < words.length) {
				idx += words[++curr].length + 1;
			}

			let completions = this.props.complete(words, curr, this.state.promptText);
			if(completions.length == 1) {
				// Perform completion
				words[curr] = completions[0];
				let column = -1;
				for(let i = 0; i <= curr; i++) {
					column += words[i].length + 1;
				}
				this.setState({
					promptText: words.join(" "),
					column: column,
				}, this.scrollToBottom );
			} else if (completions.length > 1) {
				// show completions
				let log = this.state.log;
				log.push({
					command: this.state.promptText,
					message: [{
						type: "completion",
						value: [completions.join("\t")],
					}]
				});
				this.setState({
					log: log,
				}, this.scrollToBottom );
			}
		}
	}
	cancelExecution = () => {  // TODO link this handle
		this.props.cancel();
	}
	commandTrigger = () => {
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
	}
	rotateHistory = (n: number) => {
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
	}
	previousHistory = () => {
		this.rotateHistory(-1);
	}
	nextHistory = () => {
		this.rotateHistory(1);
	}
	scrollIfBottom = () => {
		if(this.child.container.scrollTop == this.child.container.scrollHeight - this.child.container.offsetHeight) {
			return this.scrollToBottom;
		} else {
			return null;
		}
	}
	scrollToBottom = () => {
		this.child.container.scrollTop = this.child.container.scrollHeight; //TODO fix weird scrolling bug
	}
	render() {
		return <div ref={ref => this.child.container = ref}
				className={"react-console-container " + (this.state.focus?"react-console-focus":"react-console-nofocus")}
				onClick={this.focus}
			>
			<textarea
				ref={ref => this.child.typer = ref}
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
				onChange={this.change}
				onPaste={this.paste}
			></textarea>
			{this.props.welcomeMessage?
				<div className="react-console-message react-console-welcome">
					this.props.welcomeMessage
				</div>
				: null
			}
			{this.state.log.map( (val: LogEntry) => {
				return [
					<ConsolePrompt label={this.props.promptLabel} value={val.command} />,
					...val.message.map( (val: LogMessage, idx: number) => {
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
}
