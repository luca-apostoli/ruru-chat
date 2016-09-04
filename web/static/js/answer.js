import React from "react"
import ReactDOM from "react-dom"
import {Socket, Presence} from "phoenix"
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
      if(_.findIndex(users, ['id', payload.id]) < 0) {
        var usr = {id: payload.id, name: payload.name, chat: payload.chat, operator: payload.operator}
        var newUsers = users.concat([usr])
        this.setState({users: this.sortUsers(newUsers)});
      }
    })

    userChannel.on("usr_left", payload => {
      var users = this.state.users
      var selected = this.state.selected
      if(!_.isEmpty(users)) {
        users = _.remove(users, (user) => {
          return (user.chat !== Number(payload.chat_id));
        })
        if(selected && selected.chat === Number(payload.chat_id)) {
          selected = false;
        }
      }
      this.setState({users: this.sortUsers(users), selected: selected});
    })

  },
  preloadUsersFromServer: function() {    
    var token = window.operatorToken;
    $.ajax("/api/operator/users/preload", {
      method: "GET",
      data: {token: token, target: "users"}, 
      success: resp => {
        if(!_.isEmpty(resp)) {
          var newUsers = this.state.users
          _.forEach(resp, (item) => {  
            if(!_.isEmpty(item.user)) {
              if(_.findIndex(newUsers, ['id', item.id]) < 0) {
                var operator_id = 0;
                if(!_.isEmpty(item.operator)) {
                  operator_id = item.operator.id;
                }
                var user = {id: item.user.id, name: item.user.name, chat: item.id, operator: operator_id}
                newUsers = newUsers.concat([user])            
              }
            }
          })
          if(!_.isEmpty(newUsers)) {
            this.setState({users: this.sortUsers(newUsers)});
          }
        }
      }
    })
  },
  sortUsers: function(users) {
    return _.sortBy(users, (user) => {
      if(user.operator > 0 && user.operator === window.operatorID) {
        return -1;
      } else if(user.operator > 0 && user.operator !== window.operatorID) {
        return user.operator;
      } else if(user.operator < 1) {
        return 0;
      }
    });
  },
  componentDidMount: function() {
    userSocket = new Socket("/answersocket")
    userSocket.connect()
    // Now that you are connected, you can join channels with a topic:
    userChannel = userSocket.channel("answer:users", {})
    userChannel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })
    this.preloadUsersFromServer();
    this.loadUsersFromServer();   
  },
  loadMessageChannel: function(chat_id, guest) {
    messageSocket = new Socket("/socket", {params: {role: "operator", token: window.operatorToken}})
    messageSocket.connect()
    // Now that you are connected, you can join channels with a topic:
    messageChannel = messageSocket.channel("room:" + chat_id, {role: "operator", operator: window.operatorID})
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
          var mine = false;
          if(!_.isEmpty(payload.operator) && payload.operator.id === window.operatorID) {
            mine = true;
          }
          var comment = {id: payload.id, text: payload.body, author: payload.author, mine: mine}
          var newComments = comments.concat([comment])
          oldchats[chat_id].messages = newComments;          
          this.setState({chats: oldchats});
        }
      })
      // listener per utente che abbandona
      messageChannel.on("presence_diff", diff => {
       presences = Presence.syncDiff(presences, diff, onJoin, onLeave)
       console.log(presences);
//       this.setState({users: Presence.list(room.presences, listBy)})
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
      _.forEach(oldchats, (item, key) => {
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
        var chat = {chat: user.chat, user: user.id, status: "active", messages: [], channel: null, preloaded: false};
        chats[user.chat] = chat;
        this.setState({chats: chats}, () => {
          // subscription to channel          
          this.loadMessageChannel(user.chat, user.name)          
          this.preloadCommentsFromServer();
        });        
      } else {
        this.setState({chats: chats}, () => {
          this.preloadCommentsFromServer();
        });
      }
    });
  },
  preloadCommentsFromServer: function() {    
    var chat = this.state.selected.chat;
    var token = window.operatorToken;
    var oldchats = this.state.chats;
    if (!oldchats[chat].preloaded) {
      $.ajax("/api/operator/messages/preload", {
        method: "GET",
        data: {token: token, chat: chat, target: "messages"}, 
        success: resp => {          
          oldchats[chat].preloaded = true;
          if(!_.isEmpty(resp) && _.has(oldchats, chat)) {
            var comments = oldchats[chat].messages;
            var newComments = comments
            _.forEach(resp, (item) => {
              var comment = {};
              if (!_.isEmpty(item.user)) { 
                comment = {id: item.id, text: item.text, author: item.user.name, mine: false}
              } else {
                var mine = false;
                if(item.operator.id === window.operatorID) {
                  mine = true;
                }
                comment = {id: item.id, text: item.text, author: item.operator.name, mine: mine}
              }      
              newComments = newComments.concat([comment])            
            })            
            if(!_.isEmpty(newComments)) {
              oldchats[chat].messages = newComments;              
            }
          }
          this.setState({chats: oldchats});
        }
      })
    }
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
        <div className="four wide columns">
          <UsersList users={this.state.users} handleClick={this.handleClickOnUser} selected={this.state.selected}/>
        </div>
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
    var userNodes = this.props.users.map((user) => {
      return (
        <UserDetail key={user.id} chat={user.chat} name={user.name} handleClick={handleClick} user={user} selected={this.props.selected}/>
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
          text={message.text}
          mine={message.mine}
          />
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
  getStyleClass: function() {
    var className = 'fluid ui vertical animated ';
    if(this.props.user.operator > 0 && this.props.user.operator === window.operatorID ) {
      className += ' teal '
      if (this.props.user.id !== this.props.selected.id) {
        className += ' basic ';
      }
      className += ' button';
    } else if(this.props.user.operator > 0 && this.props.user.operator !== window.operatorID ) {
      className += ' red basic button';
    } else {
      className += ' olive basic button';
    }
    return className;
  },
  getHiddenContent: function() {
    var hiddenContent = '';
    if(this.props.user.operator > 0 && this.props.user.operator === window.operatorID ) {
      if (this.props.user.id === this.props.selected.id) {
        hiddenContent += ' <3 ';
      } else {
        hiddenContent += 'Pending ...';
      }
    } else if(this.props.user.operator > 0 && this.props.user.operator !== window.operatorID ) {
      hiddenContent += 'Served by '+this.props.user.operator;
    } else {
      hiddenContent += 'New user, yay!!';
    }
    return hiddenContent;
  },
  render: function() {
    return (
      <div className="userDetails item" data-tab={this.props.chat} onClick={this.handleClick}>
        <div className={this.getStyleClass()}>
          <div className="hidden content">{this.getHiddenContent()}</div>
          <div className="visible content">{this.props.name}</div>          
        </div>
      </div>
    );
  }
});

var Message = React.createClass({
  topOwnerClass: function() {
    var topClass = ' ui '; 
    if (!this.props.mine) {
      topClass += ' right aligned blue ';
    }
    topClass += ' top attached block header';
    return topClass;
  },
  bottomOwnerClass: function() {
    var bottomClass = 'ui ';
    if (!this.props.mine) {
      bottomClass += ' right aligned ';
    }
    bottomClass += ' bottom attached segment';
    return bottomClass;
  },
  render: function() {
    return (
      <div className="comment column">
        <h4 className={this.topOwnerClass()}>{this.props.author}</h4>
        <div className={this.bottomOwnerClass()}>{this.props.text}</div>
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
