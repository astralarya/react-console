'use strict';

import * as React from 'react';
import { expect } from 'chai';
import * as enzyme from 'enzyme';
import * as rewire from 'rewire';

const ConsoleMessage = require('exports?ConsoleMessage!../src/react-console.tsx');

describe('<ConsoleMessage />', function() {
	describe('type: ', function () {
		it('Adds CSS class `react-console-message`', function() {
			var wrapper = enzyme.shallow(<ConsoleMessage />);
		});
	});
});
