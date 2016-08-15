'use strict';

import * as React from 'react';
import { assert, expect } from 'chai';
import * as enzyme from 'enzyme';

import {
	ConsolePrompt,
	ConsoleMessage,
	default as Console
} from 'exports?ConsolePrompt&ConsoleMessage!../src/react-console.tsx';


describe('<ConsolePrompt />', function() {
	describe('[Property] point: ', function () {
		it('Has no cursor when point is not passed', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt />);
			expect((wrapper.instance() as ConsolePrompt).child.cursor).not.exist;
			expect(wrapper.find('.react-console-cursor')).length(0);
		});
		it('Has cursor when point is >= 0', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt point={0}/>);
			expect(wrapper.find('.react-console-cursor')).length(1);
		});
	});
	describe('[Property] value: ', function () {
		it('`.react-console-prompt` has text \'foo\' when value=\'foo\'', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt value='foo'/>);
			expect(wrapper.find('.react-console-prompt').text()).equals('foo');
		});
		it('`.react-console-prompt` has text \'bar\' and `.react-console-cursor` has text \'b\' when value=\'bar\' and point=0', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt value='bar' point={0}/>);
			expect(wrapper.find('.react-console-prompt').text()).equals('bar');
			expect(wrapper.find('.react-console-cursor').text()).equals('b');
		});
		it('`.react-console-prompt` has text \'bar\' and `.react-console-cursor` has text \'a\' when value=\'bar\' and point=1', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt value='bar' point={1}/>);
			expect(wrapper.find('.react-console-prompt').text()).equals('bar');
			expect(wrapper.find('.react-console-cursor').text()).equals('a');
		});
		it('`.react-console-prompt` has text \'bar\' and `.react-console-cursor` has text \'r\' when value=\'bar\' and point=2', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt value='bar' point={2}/>);
			expect(wrapper.find('.react-console-prompt').text()).equals('bar');
			expect(wrapper.find('.react-console-cursor').text()).equals('r');
		});
	});
	describe('[Property] label: ', function () {
		it('`.react-console-prompt-label` has text \'foo\' when label=\'foo\'', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt label='foo'/>);
			expect(wrapper.find('.react-console-prompt-label').text()).equals('foo');
		});
	});
	describe('[Property] argument: ', function () {
		it('`.react-console-prompt-argument` has text \'foo\' when argument=\'foo\'', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt argument='foo'/>);
			expect(wrapper.find('.react-console-prompt-argument').text()).equals('foo');
		});
		it('`.react-console-prompt-label` has text \'\' when label=\'foo\' and `.react-console-prompt-argument` has text \'bar\' when argument=\'bar\'', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt label='foo' argument='bar'/>);
			expect(wrapper.find('.react-console-prompt-label').text()).equals('');
			expect(wrapper.find('.react-console-prompt-argument').text()).equals('bar');
		});
		it('`.react-console-prompt-label` has text \'foo\\n\' when label=\'foo\\nbar\' and `.react-console-prompt-argument` has text \'baz\' when argument=\'baz\'', function() {
			var wrapper = enzyme.mount(<ConsolePrompt label='foo\nbar' argument='baz'/>);
			expect(wrapper.find('.react-console-prompt-label').text()).equals('foo\n');
			expect(wrapper.find('.react-console-prompt-argument').text()).equals('baz');
		});
	});
	describe('[Style] idle: ', function () {
		it('Is not idle right after mount', function() {
			var wrapper = enzyme.shallow(<ConsolePrompt point={0}/>);
			expect(wrapper.find('.react-console-cursor-idle')).length(0);
		});
		it('Is idle after 1 second', function(done) {
			var wrapper = enzyme.mount(<ConsolePrompt point={0}/>);
			window.setTimeout( () => {
				expect(wrapper.find('.react-console-cursor-idle')).length(1);
				done();
			}, 1100);
		});
	});
});

describe('<ConsoleMessage />', function() {
	describe('[Property] type: ', function () {
		it('Has class `react-console-message` when type=null', function() {
			var wrapper = enzyme.shallow(<ConsoleMessage />);
			assert(wrapper.hasClass('react-console-message'), 'Missing class `react-console-message`');
		});
		it('Has class `react-console-message react-console-message-foo` when type=\'foo\'', function() {
			var wrapper = enzyme.shallow(<ConsoleMessage type='foo'/>);
			assert(wrapper.hasClass('react-console-message-foo'), 'Missing class `react-console-message-foo`');
			assert(wrapper.hasClass('react-console-message'), 'Missing class `react-console-message`');
		});
	});
	describe('[Property] value: ', function () {
		it('Text == \'ababa\' when value={[\'ababa\']}', function() {
			var wrapper = enzyme.shallow(<ConsoleMessage value={['ababa']}/>);
			assert(wrapper.text() == 'ababa', 'Text does not equal \'ababa\'');
		});
		it('Text == \'a\\nb\\nc\' when value={[\'a\',\'b\',\'c\']}', function() {
			var wrapper = enzyme.mount(<ConsoleMessage value={['a','b','c']}/>);
			assert(wrapper.text() == 'a\nb\nc', 'Text does not equal \'a\\nb\\nc\'');
		});
		it('Text == JSON.stringify(value) when value={[[\'a\',\'b\',\'c\',1,2,3]]}', function() {
			var wrapper = enzyme.shallow(<ConsoleMessage value={[['a','b','c',1,2,3]]}/>);
			assert(wrapper.text() == JSON.stringify(['a','b','c',1,2,3]), 'Text does not equal JSON.stringify(value)');
		});
		it('Text == JSON.stringify(value) when value={[{a:1,b:2,c:[3,4,5]}]}', function() {
			var wrapper = enzyme.shallow(<ConsoleMessage value={[{a:1,b:2,c:[3,4,5]}]}/>);
			assert(wrapper.text() == JSON.stringify({a:1,b:2,c:[3,4,5]}), 'Text does not equal JSON.stringify(value)');
		});
	});
});

describe('<Console />', function() {
	describe('[Property] autofocus: ', function () {
		it('Has class `react-console-nofocus` on mount when autofocus undefined', function() {
			var wrapper = enzyme.mount(<Console />);
			expect(wrapper.find('.react-console-nofocus')).length(1);
		});
		it('Has class `react-console-focus` on mount when autofocus=true', function() {
			var wrapper = enzyme.mount(<Console autofocus={true}/>);
			expect(wrapper.find('.react-console-focus')).length(1);
		});
	});
	describe('[Property] welcomeMessage: ', function () {
		it('Doesn\'t have class `react-console-welcome` when welcomeMessage undefined', function() {
			var wrapper = enzyme.shallow(<Console />);
			expect(wrapper.find('.react-console-message')).length(0);
		});
		it('Has div `react-console-welcome` with text()=\'foo\' when welcomeMessage=\'foo\'', function() {
			var wrapper = enzyme.shallow(<Console welcomeMessage='foo'/>);
			var welcome = wrapper.find('.react-console-welcome');
			expect(welcome).length(1);
			expect(welcome.text()).equal('foo')
		});
	});
});
