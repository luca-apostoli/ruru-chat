import React from "react"
import ReactDOM from "react-dom"
import TransitionGroup from 'react-addons-transition-group'
import {Message} from "operator_message"

export class MessageBox extends React.Component {

  constructor(props) {
    super(props);
    this.isActive = this.isActive.bind(this)    
  }

  isActive() {
    return "messageList ui tab segment " + ((this.props.active === "active") ? "active" : "");
  }

  render() {
    var messageNodes = this.props.messages.map((message) => {
      return (
        <Message 
          key={message.id} 
          author={message.author} 
          chat={message.chat} 
          text={message.text}
          mine={message.mine}
          total={this.props.messages.length}
          />
      );
    });
    return (
      <div className={this.isActive()} data-tab={this.props.chat.chat}>
        <TransitionGroup>
          {messageNodes}
        </TransitionGroup>  
      </div>
    );
  }
}
