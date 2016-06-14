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
    consoleInsert: (text: string, replace?: number) => void;
    moveColumn: (n: number, max?: number) => number;
    backDelete: () => void;
    forwardDelete: () => void;
    deleteUntilStart: () => void;
    deleteUntilEnd: () => void;
    moveBackward: () => void;
    moveForward: () => void;
    moveToStart: () => void;
    moveToEnd: () => void;
    moveToNextWord: () => void;
    moveToPreviousWord: () => void;
    nextWord(): number;
    previousWord(): number;
    doComplete: () => void;
    cancelExecution: () => void;
    commandTrigger: () => void;
    rotateHistory: (n: number) => void;
    previousHistory: () => void;
    nextHistory: () => void;
    scrollSemaphore: number;
    scrollIfBottom: () => () => void;
    scrollIfBottomTrue: () => void;
    scrollToBottom: () => void;
    nextLabel: () => string;
    render(): JSX.Element;
}
