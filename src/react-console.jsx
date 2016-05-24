"use strict";

import React from 'react';
import './react-console.css';

module.exports = React.createClass({
	render: function() {
		return <div className="react-console-container">
			<textarea className="react-console-typer"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
			></textarea>
			{this.props.welcomeMessage?
				<div className="react-console-message react-console-welcome">
					this.props.welcomeMessage
				</div>
				: null
			}
		</div>;
	}
});
