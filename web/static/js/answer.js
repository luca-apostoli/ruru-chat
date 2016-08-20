import React from "react"
import ReactDOM from "react-dom"
import {Socket} from "phoenix"
import {Starter} from "./starter"

let Remarkable = require('remarkable')
let $ = require("jquery")
let _ = require("lodash")

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

    var oldchats = this.state.chats;
    if(_.has(oldchats, chat_id)) {
      // spostare in una funzione esterna
      messageChannel.on("new_msg", payload => {
        var oldchats = this.state.chats;
        if(_.has(oldchats, chat_id)) {
          var comments = oldchats[chat_id].messages
          var comment = {id: Date.now(), text: payload.body, author: payload.author}
          var newComments = comments.concat([comment])
          oldchats[chat_id].messages = newComments;          
          this.setState({chats: oldchats});
        }
      })
      oldchats[chat_id].channel = messageChannel;
      this.setState({chats: oldchats});
    }       
  },
  handleClickOnUser: function(user) {
    this.setState({selected: user}, () => {    
      var found = false;
      var oldchats = this.state.chats;
      var chats = oldchats;
      _.forEach(oldchats, function (item, key) {
        if(key === user.chat && oldchats[key].chat === user.chat){
          found = true;
          oldchats[key].status = 'active';    
        } else {
          if(!_.isEmpty(oldchats[key])) {
            oldchats[key].status = '';
          }
        }
      })
      if(!found) {
        var chat = {chat: user.chat, user: user.id, status: "active", messages: [], channel: null};
        chats[user.chat] = chat;
        this.setState({chats: chats}, () => {
          // subscription to channel          
          this.loadMessageChannel(user.chat, user.name)
        });        
      } else {
        this.setState({chats: chats});      
      }
    });
  },
  submitMessage: function(message) {
    var oldchats = this.state.chats;
    if(_.has(oldchats, this.state.selected.chat)) {
      oldchats[this.state.selected.chat].channel.push("new_msg", {body: message.text, author: message.author, guest: message.guest, role: "operator"})      
    }
  },
  render: function() {
    var selected = this.state.selected
    var chatsNodes = null;
    if(!_.isEmpty(this.state.chats)) {
      chatsNodes = this.state.chats.map((chat) => {
        return (
          <MessageBox key={chat.chat} chat={chat} messages={chat.messages} active={chat.status} selected={selected}/>
          );
      });
    }
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
      <div className="usersList ui vertical secondary menu">
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
