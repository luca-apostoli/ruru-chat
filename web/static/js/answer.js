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
    return {users: [], chats: [], selected: false};
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
        
        var comment = {id: Date.now(), text: payload.body, author: payload.author}        
        var oldchats = this.state.chats;
        for (var i = oldchats.length - 1; i >= 0; i--) {
          if(oldchats[i].chat === chat_id){
            var comments = oldchats[i].messages
            var newComments = comments.concat([comment])
            oldchats[i].messages = newComments;
          }
        }
        this.setState({chats: oldchats});
//        this.setState({messages: newComments});
    })    
  },
  handleClickOnUser: function(user) {
    this.setState({selected: user});    
    var found = false;
    var oldchats = this.state.chats;
    var chats = oldchats;
    for (var i = oldchats.length - 1; i >= 0; i--) {
      if(oldchats[i].chat === user.chat){
        found = true;
        oldchats[i].status = 'active';    
      } else {
        oldchats[i].status = '';
      }
    }
    if(!found) {
      var chat = {chat: user.chat, user: user.id, status: "active", messages: []};
      chats = oldchats.concat([chat]);
      // subscription to channel
      this.loadMessageChannel(user.chat, user.name);
    }
    this.setState({chats: chats});      
  },
  submitMessage: function(message) {
    messageChannel.push("new_msg", {body: message.text, author: message.author, guest: message.guest, role: "operator"})    
  },
  render: function() {
    var selected = this.state.selected
    var chatsNodes = this.state.chats.map(function(chat) {
      return (
        <MessageBox key={chat.chat} chat={chat} messages={chat.messages} active={chat.status} selected={selected}/>
        );
    });
    return (
      <div className="ui two column grid">
        <div className="four wide column"><UsersList users={this.state.users} handleClick={this.handleClickOnUser}/></div>
        <div className="ten wide column">
          {(() => {
            if (this.state.selected) {
              return <div>
                      {chatsNodes}
                      <MessageForm onMessageSubmit={this.submitMessage}/>
                      </div>;
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
      <div className="usersList ui secondary menu">
        {userNodes}
      </div>
    );
  }
});

var MessageBox = React.createClass({
  isActive: function() {
    return "messageList ui tab segment " + ((this.props.active === "active") ? "active" : "");
  },
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
      <div className={this.isActive()} data-tab={this.props.chat.chat}>
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
      <a className="userDetails item" data-tab={this.props.chat} onClick={this.handleClick}>
        {this.props.name}
      </a>
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
