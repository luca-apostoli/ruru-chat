import React from "react"
import ReactDOM from "react-dom"
import {Socket} from "phoenix"
import {Starter} from "./starter"

let Remarkable = require('remarkable')
let $ = require("jquery")

let userSocket
let userChannel

var AnswerBootstrap = React.createClass({
  getInitialState: function() {
    return {users: [], messages: []};
  }, 
  componentDidMount: function() {
    userSocket = new Socket("/answersocket")
    userSocket.connect()
    // Now that you are connected, you can join channels with a topic:
    userChannel = userSocket.channel("answer:users", {})
    userChannel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

  },
  render: function() {
    return (
      <div className="app">
        <div className="leftColumn"><UsersList users={this.state.users}/></div>
        <div className="mainBody"><MessageBox messages={this.state.messages}/></div>
      </div>
    );
  }
});

var UsersList = React.createClass({
  render: function() {
    var userNodes = this.props.users.map(function(user) {
      return (
        <UserDetail id={user.id} chat={user.chat}>
          {user.name}
        </UserDetail>
      );
    });
    return (
      <div className="usersList">
        {userNodes}
      </div>
    );
  }
});

var MessageBox = React.createClass({
  render: function() {
    var messageNodes = this.props.messages.map(function(message) {
      return (
        <Message user={message.user} chat={message.chat}>
          {message.text}
        </Message>
      );
    });
    return (
      <div className="messageList">
        {messageNodes}
      </div>
    );
  }
});

var UserDetail = React.createClass({
  render: function() {
    return (
      <div className="userDetails">
        {this.props.name}
      </div>
    );
  }
});

var Message = React.createClass({
  render: function() {
    return (
      <div className="messageDetails">
        {this.props.text}
      </div>
    );
  }
});

Starter(<AnswerBootstrap/>,'answer');

//export default AnswerBootstrap
