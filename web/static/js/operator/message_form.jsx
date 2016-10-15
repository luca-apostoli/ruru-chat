import React from "react"
import ReactDOM from "react-dom"

export class MessageForm extends React.Component {

    constructor(props) {
      super(props);
      this.handleTextChange = this.handleTextChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      // set initial state
      this.state = {text: ""};
    }

    handleTextChange(e) {
      this.setState({text: e.target.value})
    }

    handleSubmit(e) {
      e.preventDefault();
      this.props.onMessageSubmit({author: window.operatorEmail, text: this.state.text, guest: window.operatorID});
      this.setState({text: ''});
    }

    render() {
      return (
        <form className="messageForm ui form" onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="Say your answer..."
            value={this.state.text}
            onChange={this.handleTextChange}
          />
          <input type="submit" value="Send" className="ui button" />
        </form>
      );
  }
}
