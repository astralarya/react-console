"use strict";

import react from 'react';
import './react-console.css';

module.exports = {
	render: function() {
		<div className="react-console-container">
		<textarea className="react-console-typer"></textarea>
		{this.props.welcomeMessage?
			<div className="react-console-message react-console-welcome">
				this.props.welcomeMessage
			</div>
			: null
		}
		</div>
	}
};
