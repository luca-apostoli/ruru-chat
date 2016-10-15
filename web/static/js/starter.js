import React from "react"
import ReactDOM from "react-dom"

export function Starter(element, position) {
	if(document.getElementById(position)) {
		ReactDOM.render(
			element,
		  	document.getElementById(position)
		);	
	}
}
