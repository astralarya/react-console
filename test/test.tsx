'use strict';

import * as React from 'react';
import { assert, expect } from 'chai';
import * as enzyme from 'enzyme';

const ConsoleMessage = require('exports?ConsoleMessage!../src/react-console.tsx');

describe('<ConsoleMessage />', function() {
	describe('type: ', function () {
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
	describe('value: ', function () {
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
