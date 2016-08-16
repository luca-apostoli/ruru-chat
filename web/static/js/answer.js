import React from "react"
import ReactDOM from "react-dom"
import {Socket} from "phoenix"
import {Starter} from "./starter"

let Remarkable = require('remarkable')
let $ = require("jquery")

let userSocket
let userChannel
let messageSocket
let messageChannel

var AnswerBootstrap = React.createClass({
  getInitialState: function() {
    return {users: [], messages: [], selected: false};
  },
  loadUsersFromServer: function() {
    userChannel.on("new_usr", payload => {
      var users = this.state.users
      var usr = {id: Date.now(), name: payload.name, chat: payload.chat}
      var newUsers = users.concat([usr])
      this.setState({users: newUsers});
    })
  },
  componentDidMount: function() {
    userSocket = new Socket("/answersocket")
    userSocket.connect()
    // Now that you are connected, you can join channels with a topic:
    userChannel = userSocket.channel("answer:users", {})
    userChannel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    this.loadUsersFromServer();
  },
  loadMessageChannel: function(chat_id, guest) {
    messageSocket = new Socket("/socket", {params: {role: "operator"}})
    messageSocket.connect()
    // Now that you are connected, you can join channels with a topic:
    messageChannel = messageSocket.channel("room:" + chat_id, {role: "operator"})
    messageChannel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    messageChannel.on("new_msg", payload => {
        var comments = this.state.messages
        var comment = {id: Date.now(), text: payload.body, author: payload.author}
        var newComments = comments.concat([comment])
        this.setState({messages: newComments});
    })    
  },
  handleClickOnUser: function(user) {
    this.setState({selected: user});
    console.log(user);
    this.loadMessageChannel(user.chat, user.name);
  },
  submitMessage: function(message) {
    messageChannel.push("new_msg", {body: message.text, author: message.author, guest: message.guest, role: "operator"})    
  },
  render: function() {
    return (
      <div className="ui two column grid">
        <div className="four wide column"><UsersList users={this.state.users} handleClick={this.handleClickOnUser}/></div>
        <div className="ten wide column">
          <MessageBox messages={this.state.messages}/>
          {(() => {
            if (this.state.selected) {
              return <MessageForm onMessageSubmit={this.submitMessage}/>;
            }
          })()}
        </div>
      </div>
    );
  }
});

var UsersList = React.createClass({
  handleClick: function(user) {
    this.props.handleClick(user);
  },
  render: function() {
    var handleClick = this.handleClick;
    var userNodes = this.props.users.map(function(user) {
      return (
        <UserDetail key={user.id} chat={user.chat} name={user.name} handleClick={handleClick} user={user}/>
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
        <Message 
          key={message.id} 
          author={message.author} 
          chat={message.chat} 
          text={message.text}/>
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
  handleClick: function(){
    this.props.handleClick(this.props.user);
  },
  render: function() {
    return (
      <div className="userDetails" onClick={this.handleClick}>
        {this.props.name}
      </div>
    );
  }
});

var Message = React.createClass({
  render: function() {
    return (
      <div className="column">
      <h4 className="ui top attached block header">{this.props.author}</h4>
      <div className="ui bottom attached segment">{this.props.text}</div>      
      </div>
    );
  }
});

var MessageForm = React.createClass({
    getInitialState: function() {
      return {text: ""};
    },
    handleTextChange: function(e) {
      this.setState({text: e.target.value})
    },
    handleSubmit: function (e) {
      e.preventDefault();
      this.props.onMessageSubmit({author: window.operatorEmail, text: this.state.text, guest: window.operatorID});
      this.setState({text: ''});
    },
    render: function() {
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
});

Starter(<AnswerBootstrap/>,'answer');

//export default AnswerBootstrap
