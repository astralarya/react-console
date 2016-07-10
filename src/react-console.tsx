"use strict";

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './react-console.scss';

interface ConsolePromptProps {
	point?: number;
	value: string;
	label: string;
	argument?: string;
}
class ConsolePrompt extends React.Component<ConsolePromptProps,{}> {
	static defaultProps: ConsolePromptProps = {
		point: -1,
		value: "",
		label: "> ",
		argument: null,
	}
	child: {
		cursor?: Element;
	} = {};
	// Component Lifecycle
	componentDidMount() {
		this.idle();
	}
	componentDidUpdate() {
		this.idle();
	}
	// DOM Management
	updateSemaphore: number = 0;
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
		if(this.props.point < 0) {
			return [this.props.value];
		} else if (this.props.point == this.props.value.length) {
			return [this.props.value,<span ref={ref => this.child.cursor = ref} key="cursor" className="react-console-cursor">&nbsp;</span>];
		} else {
			return [this.props.value.substring(0,this.props.point),
				<span ref={ref => this.child.cursor = ref} key="cursor" className="react-console-cursor">{this.props.value.substring(this.props.point,this.props.point+1)}</span>,
				this.props.value.substring(this.props.point+1)];
		}
	}
	render() {
		let label = this.props.label;
		if(this.props.argument) {
			let idx = label.lastIndexOf("\n");
			if(idx >= 0) {
				label = label.substring(0, idx+1);
			} else {
				label = '';
			}
		}
		return <div className="react-console-prompt-box">
			<span className="react-console-prompt-label">{ label }</span>
			<span className="react-console-prompt-argument">{ this.props.argument }</span>
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
				return val;
			} else {
				return JSON.stringify(val);
			}
		}).join("\n")}
	</div>;
}

export interface LogMessage {
	type?: string;
	value: any[];
}
export interface LogEntry {
	label: string;
	command: string;
	message: LogMessage[];
}

export interface ConsoleProps{
	handler(command: string): any;
	cancel?(): any;
	complete?(words: string[], curr: number, promptText: string): string[];
	continue?(promptText: string): boolean;
	autofocus?: boolean;
	promptLabel?: string | (()=>string);
	welcomeMessage?: string;
}
export const enum ConsoleCommand {
	Default,
	InitSearch,
	Search,
	Kill,
	Yank,
};
export interface ConsoleState{
	focus?: boolean;
	acceptInput?: boolean;
	typer?: string;
	point?: number;
	currLabel?: string;
	promptText?: string;
	restoreText?: string;
	searchText?: string;
	log?: LogEntry[];
	history?: string[];
	historyn?: number;
	kill?: string[];
	killn?: number;
	argument?: string;
	lastCommand?: ConsoleCommand;
};
export default class extends React.Component<ConsoleProps,ConsoleState> {
	constructor(props: ConsoleProps) {
		super(props);
		this.state = {
			focus: false,
			acceptInput: true,
			typer: '',
			point: 0,
			currLabel: this.nextLabel(),
			promptText: '',
			restoreText: '',
			searchText: '',
			log: [],
			history: [],
			historyn: 0,
			kill: [],
			killn: 0,
			argument: null,
			lastCommand: ConsoleCommand.Default,
		};
	}
	static defaultProps = {
		promptLabel: '> ',
		continue: function() { return false; },
		cancel: function() {},
	};
	child: {
		typer?: HTMLTextAreaElement;
		container?: HTMLElement;
		focus?: HTMLElement;
	} = {};
	// Command API
	log = (...messages: any[]) => {
		let log = this.state.log;
		log[this.state.log.length-1].message.push({value: messages});
		this.setState({
			log: log,
		}, this.scrollIfBottom() );
	}
	logX = (type: string, ...messages: any[]) => {
		let log = this.state.log;
		log[this.state.log.length-1].message.push({type: type, value: messages});
		this.setState({
			log: log,
		}, this.scrollIfBottom() );
	}
	return = () => {
		this.setState({
			acceptInput: true,
			currLabel: this.nextLabel(),
		}, this.scrollIfBottom() );
	}
	// Component Lifecycle
	componentDidMount() {
		if(this.props.autofocus) {
			this.focus();
		}
	}
	// Event Handlers
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
			// return
			13: this.acceptLine,
			// left
			37: this.backwardChar,
			// right
			39: this.forwardChar,
			// up
			38: this.previousHistory,
			// down
			40: this.nextHistory,
			// backspace
			8:  this.backwardDeleteChar,
			// delete
			46: this.deleteChar,
			// end
			35: this.endOfLine,
			// start
			36: this.beginningOfLine,
			// tab
			9: this.complete,
			// esc
			//27: this.prefixMeta,
		};
		var ctrlCodes: keyMap = {
			// C-a
			65: this.beginningOfLine,
			// C-e
			69: this.endOfLine,
			// C-f
			70: this.forwardChar,
			// C-b
			66: this.backwardChar,
			// C-l TODO
			//76: this.clearScreen,
			// C-p
			80: this.previousHistory,
			// C-n
			78: this.nextHistory,
			// C-r
			82: this.reverseSearchHistory,
			// C-s
			83: this.forwardSearchHistory,
			// C-d
			68: this.deleteChar, // TODO EOF
			// C-q TODO
			//81: this.quotedInsert,
			// C-v TODO
			//86: this.quotedInsert,
			// C-t TODO
			//84: this.transposeChars,
			// C-k
			75: this.killLine,
			// C-u
			85: this.backwardKillLine,
			// C-y TODO
			89: this.yank,
			// C-c
			67: this.cancelCommand,
			// C-w TODO
			//87: this.killPreviousWhitespace,
			// C-] TODO
			//221: this.characterSearch,
			// C-x TODO
			//88: this.prefixCtrlX,
		};
		var ctrlXCodes: keyMap = { // TODO state
			// C-x Rubout
			8: this.backwardKillLine,
			// C-x ( TODO
			//57: this.startKbdMacro,
			// C-x ) TODO
			//48: this.endKbdMacro,
			// C-x e TODO
			//69: this.callLastKbdMacro,
			// C-x C-u TODO
			//85: this.undo,
			// C-x C-x TODO
			//88: this.exchangePointAndMark,
		};
		var ctrlShiftCodes: keyMap = {
			// C-_ TODO
			//189: this.undo,
			// C-@ TODO
			//50: this.setMark,
		};
		var metaCodes: keyMap = {
			// M-f
			70: this.forwardWord,
			// M-b
			66: this.backwardWord,
			// M-p
			80: this.nonIncrementalReverseSearchHistory,
			// M-n
			78: this.nonIncrementalForwardSearchHistory,
			// M-.
			190: this.yankLastArg,
			// M-TAB TODO
			//9: this.tabInsert,
			// M-t TODO
			//84: this.transposeWords,
			// M-u TODO
			//85: this.upcaseWord,
			// M-l TODO
			//76: this.downcaseWord,
			// M-c TODO
			//67: this.capitalizeWord,
			// M-d
			68: this.killWord,
			// M-backspace
			8: this.backwardKillWord,
			// M-w TODO
			//87: this.unixWordRubout,
			// M-\ TODO
			//220: this.deleteHorizontalSpace,
			// M-y
			89: this.yankPop,
			// M-0 TODO
			//48: () => this.digitArgument(0),
			// M-1 TODO
			//49: () => this.digitArgument(1),
			// M-2 TODO
			//50: () => this.digitArgument(2),
			// M-3 TODO
			//51: () => this.digitArgument(3),
			// M-4 TODO
			//52: () => this.digitArgument(4),
			// M-5 TODO
			//53: () => this.digitArgument(5),
			// M-6 TODO
			//54: () => this.digitArgument(6),
			// M-7 TODO
			//55: () => this.digitArgument(7),
			// M-8 TODO
			//56: () => this.digitArgument(8),
			// M-9 TODO
			//57: () => this.digitArgument(9),
			// M-- TODO
			//189: () => this.digitArgument('-'),
			// M-f TODO
			//71: () => this.abort,
			// M-r TODO
			//82: this.revertLine,
			// M-SPACE TODO
			//32: this.setMark,
		};
		var metaShiftCodes: keyMap = { // TODO hook in
			// M-<
			188: this.beginningOfHistory,
			// M->
			190: this.endOfHistory,
			// M-_
			189: this.yankLastArg,
			// M-? TODO
			//191: this.possibleCompletions,
			// M-* TODO
			//56: this.insertCompletions,
		}
		var metaCtrlCodes: keyMap = {
			// M-C-y
			89: this.yankNthArg,
			// M-C-] TODO
			//221: this.characterSearchBackward,
			// M-C-j TODO !!!
			//74: this.viEditingMode,
		};
		if(this.state.acceptInput) {
			if (e.altKey) {
				if (e.ctrlKey) {
					if (e.keyCode in metaCtrlCodes) {
						metaCtrlCodes[e.keyCode]();
						e.preventDefault();
					}
				} else if (e.shiftKey) {
					if (e.keyCode in metaShiftCodes) {
						metaShiftCodes[e.keyCode]();
						e.preventDefault();
					}
				} else if (e.keyCode in metaCodes) {
					metaCodes[e.keyCode]();
					e.preventDefault();
				}
				e.preventDefault();
			} else if (e.ctrlKey) {
				if (e.keyCode in ctrlCodes) {
					ctrlCodes[e.keyCode]();
					e.preventDefault();
				}
				e.preventDefault();
			} else if (e.keyCode in keyCodes) {
				keyCodes[e.keyCode]();
				e.preventDefault();
			}
		}
	}
	change = () => {
		let idx = 0;
		for(;idx < this.state.typer.length && idx < this.child.typer.value.length; idx++) {
			if(this.state.typer[idx] != this.child.typer.value[idx]) {
				break;
			}
		}
		this.setState(Object.assign(
			this.consoleInsert(this.child.typer.value.substring(idx), this.state.typer.length - idx),{
				typer: this.child.typer.value,
				lastCommand: ConsoleCommand.Default,
			}), this.scrollToBottom
		);
	}
	paste = (e: ClipboardEvent) => {
		this.setState(Object.assign(
			this.consoleInsert(e.clipboardData.getData('text')),{
				lastCommand: ConsoleCommand.Default,
			}), this.scrollToBottom
		);
		e.preventDefault();
	}
	// Commands for Moving
	beginningOfLine = () => {
		this.setState({
			point: 0,
			argument: null,
			lastCommand: ConsoleCommand.Default,
		}, this.scrollToBottom);
	}
	endOfLine = () => {
		this.setState({
			point: this.state.promptText.length,
			argument: null,
			lastCommand: ConsoleCommand.Default,
		}, this.scrollToBottom);
	}
	forwardChar = () => {
		this.setState({
			point: this.movePoint(1),
			argument: null,
			lastCommand: ConsoleCommand.Default,
		}, this.scrollToBottom);
	}
	backwardChar = () => {
		this.setState({
			point: this.movePoint(-1),
			argument: null,
			lastCommand: ConsoleCommand.Default,
		}, this.scrollToBottom);
	}
	forwardWord = () => {
		this.setState({
			point: this.nextWord(),
			argument: null,
			lastCommand: ConsoleCommand.Default,
		}, this.scrollToBottom);
	}
	backwardWord = () => {
		this.setState({
			point: this.previousWord(),
			argument: null,
			lastCommand: ConsoleCommand.Default,
		}, this.scrollToBottom);
	}
	// Commands for Manipulating the History
	acceptLine = () => {
		this.child.typer.value = "";
		if(this.props.continue(this.state.promptText)) {
			this.setState(Object.assign(
				this.consoleInsert("\n"),{
					typer: "",
					lastCommand: ConsoleCommand.Default,
				}), this.scrollToBottom
			);
		} else {
			let command = this.state.promptText;
			let history = this.state.history;
			let log = this.state.log;
			if(!history || history[history.length-1] != command) {
				history.push(command);
			}
			log.push({
				label: this.state.currLabel,
				command: command,
				message: []
			});
			this.setState({
				acceptInput: false,
				typer: "",
				point: 0,
				promptText: "",
				restoreText: "",
				log: log,
				history: history,
				historyn: 0,
				argument: null,
				lastCommand: ConsoleCommand.Default,
			}, () => {
				this.scrollToBottom();
				this.props.handler(command);
			});
		}
	}
	previousHistory = () => {
		this.rotateHistory(-1);
	}
	nextHistory = () => {
		this.rotateHistory(1);
	}
	beginningOfHistory = () => {
		this.rotateHistory(-this.state.history.length);
	}
	endOfHistory = () => {
		this.rotateHistory(this.state.history.length);
	}
	reverseSearchHistory = () => {
		if(this.state.lastCommand == ConsoleCommand.Search || this.state.lastCommand == ConsoleCommand.InitSearch) {
			// TODO search backwards
		} else {
			this.setState({
				argument: `(reverse-i-search)\`': `,
				lastCommand: ConsoleCommand.Search,
			});
		}
	}
	forwardSearchHistory = () => {
		if(this.state.lastCommand == ConsoleCommand.Search || this.state.lastCommand == ConsoleCommand.InitSearch) {
			// TODO search forwards
		} else {
			this.setState({
				argument: `(forward-i-search)\`': `,
				lastCommand: ConsoleCommand.Search,
			});
		}
	}
	nonIncrementalReverseSearchHistory = () => {
		// TODO
	}
	nonIncrementalForwardSearchHistory = () => {
		// TODO
	}
	historySearchBackward = () => {
		// TODO
	}
	historySearchForward = () => {
		// TODO
	}
	historySubstringSearchBackward = () => {
		// TODO
	}
	historySubstringSearchForward = () => {
		// TODO
	}
	yankNthArg = () => {
		// TODO
	}
	yankLastArg = () => {
		// TODO
	}
	// Commands for Changing Text
	deleteChar = () => {
		if(this.state.point < this.state.promptText.length) {
			this.setState({
				promptText: this.state.promptText.substring(0,this.state.point)
					+ this.state.promptText.substring(this.state.point+1),
				argument: null,
				lastCommand: ConsoleCommand.Default,
			}, this.scrollToBottom);
		}
	}
	backwardDeleteChar = () => {
		if(this.state.point > 0) {
			this.setState({
				point: this.movePoint(-1),
				promptText: this.state.promptText.substring(0,this.state.point-1)
					+ this.state.promptText.substring(this.state.point),
				argument: null,
				lastCommand: ConsoleCommand.Default,
			}, this.scrollToBottom);
		}
	}
	// Killing and Yanking
	killLine = () => {
		let kill = this.state.kill;
		if(this.state.lastCommand == ConsoleCommand.Kill) {
			kill[0] = kill[0] + this.state.promptText.substring(this.state.point);
		} else {
			kill.unshift(this.state.promptText.substring(this.state.point));
		}
		this.setState({
			promptText: this.state.promptText.substring(0,this.state.point),
			kill: kill,
			killn: 0,
			argument: null,
			lastCommand: ConsoleCommand.Kill,
		}, this.scrollToBottom);
	}
	backwardKillLine = () => {
		let kill = this.state.kill;
		if(this.state.lastCommand == ConsoleCommand.Kill) {
			kill[0] = this.state.promptText.substring(0,this.state.point) + kill[0];
		} else {
			kill.unshift(this.state.promptText.substring(0,this.state.point));
		}
		this.setState({
			point: 0,
			promptText: this.state.promptText.substring(this.state.point),
			kill: kill,
			killn: 0,
			argument: null,
			lastCommand: ConsoleCommand.Kill,
		}, this.scrollToBottom);
	}
	killWholeLine = () => {
		let kill = this.state.kill;
		if(this.state.lastCommand == ConsoleCommand.Kill) {
			kill[0] = this.state.promptText.substring(0,this.state.point)
				+ kill[0] + this.state.promptText.substring(this.state.point);
		} else {
			kill.unshift(this.state.promptText);
		}
		this.setState({
			point: 0,
			promptText: '',
			kill: kill,
			killn: 0,
			argument: null,
			lastCommand: ConsoleCommand.Kill,
		}, this.scrollToBottom);
	}
	killWord = () => {
		let kill = this.state.kill;
		if(this.state.lastCommand == ConsoleCommand.Kill) {
			kill[0] = kill[0] + this.state.promptText.substring(this.state.point,this.nextWord());
		} else {
			kill.unshift(this.state.promptText.substring(this.state.point,this.nextWord()));
		}
		this.setState({
			promptText: this.state.promptText.substring(0,this.state.point)
				+ this.state.promptText.substring(this.nextWord()),
			kill: kill,
			killn: 0,
			argument: null,
			lastCommand: ConsoleCommand.Kill,
		}, this.scrollToBottom);
	}
	backwardKillWord = () => {
		let kill = this.state.kill;
		if(this.state.lastCommand == ConsoleCommand.Kill) {
			kill[0] = this.state.promptText.substring(this.previousWord(),this.state.point) + kill[0];
		} else {
			kill.unshift(this.state.promptText.substring(this.previousWord(),this.state.point));
		}
		this.setState({
			point: this.previousWord(),
			promptText: this.state.promptText.substring(0,this.previousWord())
				+ this.state.promptText.substring(this.state.point),
			kill: kill,
			killn: 0,
			argument: null,
			lastCommand: ConsoleCommand.Kill,
		}, this.scrollToBottom);
	}
	yank = () => {
		this.setState(Object.assign(
			this.consoleInsert(this.state.kill[this.state.killn]),{
				lastCommand: ConsoleCommand.Yank,
			}), this.scrollToBottom
		);
	}
	yankPop = () => {
		if(this.state.lastCommand == ConsoleCommand.Yank) {
			let killn = this.rotateRing(1, this.state.killn, this.state.kill.length);
			this.setState(Object.assign(
				this.consoleInsert(this.state.kill[killn], this.state.kill[this.state.killn].length),{
					killn: killn,
					lastCommand: ConsoleCommand.Yank,
				}), this.scrollToBottom
			);
		}
	}
	// Numeric Arguments
	// Completing
	complete = () => {
		if(this.props.complete) {
			// Split text and find current word
			let words = this.state.promptText.split(" ");
			let curr = 0;
			let idx = words[0].length;
			while(idx < this.state.point && curr + 1 < words.length) {
				idx += words[++curr].length + 1;
			}

			let completions = this.props.complete(words, curr, this.state.promptText);
			if(completions.length == 1) {
				// Perform completion
				words[curr] = completions[0];
				let point = -1;
				for(let i = 0; i <= curr; i++) {
					point += words[i].length + 1;
				}
				this.setState({
					point: point,
					promptText: words.join(" "),
					argument: null,
					lastCommand: ConsoleCommand.Default,
				}, this.scrollToBottom );
			} else if (completions.length > 1) {
				// show completions
				let log = this.state.log;
				log.push({
					label: this.state.currLabel,
					command: this.state.promptText,
					message: [{
						type: "completion",
						value: [completions.join("\t")],
					}]
				});
				this.setState({
					currLabel: this.nextLabel(),
					log: log,
					argument: null,
					lastCommand: ConsoleCommand.Default,
				}, this.scrollToBottom );
			}
		}
	}
	// Keyboard Macros
	// Miscellaneous
	cancelCommand = () => {
		if(this.state.acceptInput) { // Typing command
			this.child.typer.value = "";
			let log = this.state.log;
			log.push({
				label: this.state.currLabel,
				command: this.state.promptText,
				message: []
			});
			this.setState({
				typer: "",
				point: 0,
				promptText: "",
				restoreText: "",
				log: log,
				historyn: 0,
				argument: null,
				lastCommand: ConsoleCommand.Default,
			}, this.scrollToBottom);
		} else { // command is executing, call handler
			this.props.cancel();
		}
	}
	// Helper functions
	consoleInsert = (text: string, replace: number = 0): ConsoleState => {
		let promptText =
				this.state.promptText.substring(0,this.state.point - replace)
				+ text + this.state.promptText.substring(this.state.point);
		return {
			point: this.movePoint(text.length - replace, text.length - replace + this.state.promptText.length),
			promptText: promptText,
			restoreText: promptText,
			argument: null,
			lastCommand: ConsoleCommand.Default,
		};
	}
	movePoint = (n: number, max: number = this.state.promptText.length) => {
		let pos = this.state.point + n;
		if (pos < 0) {
			return 0;
		} if (pos > max) {
			return max;
		} else {
			return pos;
		}
	}
	nextWord(): number {
		// Find first alphanumeric char after first non-alphanumeric char
		let search = /\W\w/.exec(this.state.promptText.substring(this.state.point));
		if(search) {
			return search.index + this.state.point + 1;
		} else {
			return this.state.promptText.length;
		}
	}
	previousWord(): number {
		// Find first non-alphanumeric char after first alphanumeric char in reverse
		let search = /\W\w(?!.*\W\w)/.exec(this.state.promptText.substring(0,this.state.point-1));
		if(search) {
			return search.index + 1;
		} else {
			return 0;
		}
	}
	rotateRing = (n: number, ringn: number, ring: number, circular: boolean = true): number => {
		if(ring == 0) return 0;
		if(circular) {
			return (ring + (ringn + n) % ring) % ring;
		} else {
			ringn = ringn - n;
			if(ringn < 0) {
				return 0;
			} else if (ringn >= ring) {
				return ring;
			} else {
				return ringn;
			}
		}
	}
	rotateHistory = (n: number) => {
		let historyn = this.rotateRing(n, this.state.historyn, this.state.history.length+1, false);
		if(historyn == 0) {
			this.setState({
				point: this.state.restoreText.length,
				promptText: this.state.restoreText,
				historyn: historyn,
				argument: null,
				lastCommand: ConsoleCommand.Default,
			}, this.scrollToBottom );
		} else {
			let promptText = this.state.history[this.state.history.length-historyn];
			this.setState({
				point: promptText.length,
				promptText: promptText,
				historyn: historyn,
				argument: null,
				lastCommand: ConsoleCommand.Default,
			}, this.scrollToBottom );
		}
	}
	// DOM management
	scrollSemaphore = 0;
	scrollIfBottom = () => {
		if(this.scrollSemaphore > 0 || this.child.container.scrollTop == this.child.container.scrollHeight - this.child.container.offsetHeight) {
			this.scrollSemaphore++;
			return this.scrollIfBottomTrue;
		} else {
			return null;
		}
	}
	scrollIfBottomTrue = () => {
		this.scrollToBottom();
		this.scrollSemaphore--;
	}
	scrollToBottom = () => {
		this.child.container.scrollTop = this.child.container.scrollHeight;
		let rect = this.child.focus.getBoundingClientRect();
		if(rect.top < 0 || rect.left < 0 ||
			rect.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
			rect.right > (window.innerWidth || document.documentElement.clientWidth)
		) { this.child.typer.scrollIntoView(false); }
	}
	nextLabel = () => {
		if(typeof this.props.promptLabel === "string") {
			return this.props.promptLabel as string;
		} else {
			return (this.props.promptLabel as ()=>string)();
		}
	}
	render() {
		return <div ref={ref => this.child.container = ref}
				className={"react-console-container " + (this.state.focus?"react-console-focus":"react-console-nofocus")}
				onClick={this.focus}
			>
			{this.props.welcomeMessage?
				<div className="react-console-message react-console-welcome">
					{this.props.welcomeMessage}
				</div>
				: null
			}
			{this.state.log.map( (val: LogEntry) => {
				return [
					<ConsolePrompt label={val.label} value={val.command} />,
					...val.message.map( (val: LogMessage, idx: number) => {
						return <ConsoleMessage key={idx} type={val.type} value={val.value} />;
					})
				];
			})}
			{this.state.acceptInput?
				<ConsolePrompt
					label={this.state.currLabel}
					value={this.state.promptText}
					point={this.state.point}
					argument={this.state.argument}
					/>
				: null
			}
			<div style={{ overflow: "hidden", height: 1, width: 1 }}>
				<textarea
					ref={ref => this.child.typer = ref}
					className="react-console-typer"
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck="false"
					style={{ outline: "none",
						color: "transparent",
						backgroundColor: "transparent",
						border: "none",
						resize: "none",
						overflow: "hidden",
					}}
					onBlur={this.blur}
					onKeyDown={this.keyDown}
					onChange={this.change}
					onPaste={this.paste}
				></textarea>
			</div>
			<div ref={ref => this.child.focus = ref}>&nbsp;</div>
		</div>;
	}
}
