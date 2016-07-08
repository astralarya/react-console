import * as React from 'react';
import './react-console.scss';
export interface LogMessage {
    type?: string;
    value: any[];
}
export interface LogEntry {
    label: string;
    command: string;
    message: LogMessage[];
}
export interface ConsoleProps {
    handler(command: string): any;
    cancel?(): any;
    complete?(words: string[], curr: number, promptText: string): string[];
    continue?(promptText: string): boolean;
    autofocus?: boolean;
    promptLabel?: string | (() => string);
    welcomeMessage?: string;
}
export declare enum ConsoleCommand {
    Default = 0,
    Kill = 1,
    Yank = 2,
}
export interface ConsoleState {
    currLabel?: string;
    promptText?: string;
    restoreText?: string;
    column?: number;
    history?: string[];
    ringn?: number;
    log?: LogEntry[];
    focus?: boolean;
    acceptInput?: boolean;
    typer?: string;
    kill?: string[];
    killn?: number;
    lastCommand?: ConsoleCommand;
}
export default class  extends React.Component<ConsoleProps, ConsoleState> {
    static defaultProps: {
        promptLabel: string;
        continue: () => boolean;
        cancel: () => void;
    };
    child: {
        typer?: HTMLTextAreaElement;
        container?: HTMLElement;
        focus?: HTMLElement;
    };
    constructor(props: ConsoleProps);
    log: (...messages: any[]) => void;
    logX: (type: string, ...messages: any[]) => void;
    return: () => void;
    componentDidMount(): void;
    focus: () => void;
    blur: () => void;
    keyDown: (e: KeyboardEvent) => void;
    change: () => void;
    paste: (e: ClipboardEvent) => void;
    beginningOfLine: () => void;
    endOfLine: () => void;
    forwardChar: () => void;
    backwardChar: () => void;
    forwardWord: () => void;
    backwardWord: () => void;
    acceptLine: () => void;
    previousHistory: () => void;
    nextHistory: () => void;
    deleteChar: () => void;
    backwardDeleteChar: () => void;
    killLine: () => void;
    backwardKillLine: () => void;
    killWholeLine: () => void;
    killWord: () => void;
    backwardKillWord: () => void;
    yank: () => void;
    yankPop: () => void;
    complete: () => void;
    cancelCommand: () => void;
    consoleInsert: (text: string, replace?: number) => {
        promptText: string;
        restoreText: string;
        column: number;
        lastCommand: ConsoleCommand;
    };
    moveColumn: (n: number, max?: number) => number;
    nextWord(): number;
    previousWord(): number;
    rotateRing: (n: number, ringn: number, ring: number) => number;
    rotateHistory: (n: number) => void;
    scrollSemaphore: number;
    scrollIfBottom: () => () => void;
    scrollIfBottomTrue: () => void;
    scrollToBottom: () => void;
    nextLabel: () => string;
    render(): JSX.Element;
}
