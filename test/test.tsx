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
});
