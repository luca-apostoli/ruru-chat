import React from "react"
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import TransitionGroup from 'react-addons-transition-group'
import {Socket, Presence} from "phoenix"
import {Starter} from "./starter"

import {MessageForm} from "operator_message_form"
import {MessageBox} from "operator_message_box"
import {UsersList} from "operator_users_list"

let Remarkable = require('remarkable')
let $ = require("jquery")
let _ = require("lodash")

let userSocket
let userChannel
let messageSocket
let messageChannel
let presences

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

  userChannel.on("opt_owned", payload => {
      var users = this.state.users
      if(!_.isEmpty(users)) {
        users = _.forEach(users, (user) => {
          if (user.chat === Number(payload.chat)) {
            user.operator = payload.operator;
          }
        })
        this.setState({users: this.sortUsers(users)});
      }      
    })

  },
  preloadUsersFromServer: function() {    
    var token = window.operatorToken;
    var myId = window.operatorID;
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
                if (operator_id === myId) {
                  this.activateUserChannel(user);
                }     
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
    userSocket = new Socket("/answersocket", {params: {role: "operator", token: window.operatorToken}})
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
          if(payload.role === 'operator' && Number(payload.guest) === Number(window.operatorID)) {
            mine = true;
          }
          var comment = {id: payload.id, text: payload.body, author: payload.author, mine: mine}
          var newComments = comments.concat([comment])
          oldchats[chat_id].messages = newComments;          
          this.setState({chats: oldchats});
        }
      })
      // listener per utente che abbandona
      messageChannel.on("presence_diff", (diff) => {
        // in old presence devo avere la lista precedente 
//       presences = Presence.syncDiff(oldpresences, diff)
        console.log(diff);
        var update = false;
        var oldchats = this.state.chats;
        var users = this.state.users;
        // LEAVES
        if(!_.isEmpty(oldchats) && !_.isEmpty(diff.leaves)) {
          for(var key in oldchats){
            if(!_.isEmpty(oldchats[key])) {
              var item = oldchats[key];
              if(_.has(diff.leaves, item.user ) && item.status === "active" ) {
                item.status = "disabled";
                oldchats[key] = item;
                update = true;
              }
            }    
          }
          for(var key in users){
            if(!_.isEmpty(users[key])) {
              var user = users[key];
              if(_.has(diff.leaves, user.id ) && user.status !== "disabled" ) {
                user.status = "disabled";
                users[key] = user;
                update = true;
              }
            }    
          }          
        }
        // END LEAVES
        // JOINS
        if(!_.isEmpty(oldchats) && !_.isEmpty(diff.joins)) {
          for(var key in oldchats){
            if(!_.isEmpty(oldchats[key])) {
              var item = oldchats[key];
              if(_.has(diff.joins, item.user ) && item.status !== "active" ) {
                item.status = "active";
                oldchats[key] = item;
                update = true;
              }
            }    
          }
          for(var key in users){
            if(!_.isEmpty(users[key])) {
              var user = users[key];
              if(_.has(diff.joins, user.id ) && user.status === "disabled" ) {
                user.status = "active";
                users[key] = user;
                update = true;
              }
            }    
          }          
        }
        // END JOINS
        if(update) {
          this.setState({chats: oldchats, users: users});
        }
     })

      oldchats[chat_id].channel = messageChannel;
      this.setState({chats: oldchats});
    }       
  },
  handleClickOnUser: function(user) {
    this.setState({selected: user}, () => {
      this.activateUserChannel(user);
      this.forceUpdate();  
    });
  },
  activateUserChannel: function(user) {
    var found = false;
      var oldchats = this.state.chats;
      for(var key in oldchats){
        if(!_.isEmpty(oldchats[key])) {
          var item = oldchats[key];
          if(Number(key) === user.chat && item.chat === user.chat){
            found = true;
            oldchats[key].status = 'active';    
          } else {          
            oldchats[key].status = '';
          }
        }
      }
      if(!found) {
        var chat = {chat: user.chat, user: user.id, status: "active", messages: [], channel: null, preloaded: false};
        oldchats[user.chat] = chat;
        this.setState({chats: oldchats}, () => {
          // subscription to channel          
          this.loadMessageChannel(user.chat, user.name)          
          this.preloadCommentsFromServer(user.chat);
        });        
      } else {
        this.setState({chats: oldchats}, () => {
          this.preloadCommentsFromServer(user.chat);
        });
      }      
  },
  preloadCommentsFromServer: function(chat) {
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

Starter(<AnswerBootstrap/>,'answer');

//export default AnswerBootstrap
