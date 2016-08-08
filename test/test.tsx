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
