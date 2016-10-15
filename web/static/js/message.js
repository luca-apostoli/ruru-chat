import React from "react"
import ReactDOM from "react-dom"
import TransitionGroup from 'react-addons-transition-group'

import {Starter} from "./starter"

import {CommentBox} from './client/comment_box'
import {SimpleLogin} from './client/simple_login'


let $ = require("jquery")
let _ = require("lodash")

var Bootstrap = React.createClass({
  getInitialState: function() {
    return {login: false, token: "", name: "", chat: "", user: ""};
  },
  handleLogin: function(data) {
    this.setState({login: true, token: data.token, name: data.name, chat: data.chat, user: data.user});
  },
  closeChat: function(){
    this.setState({login: false})
  },
  render: function() {
    return (
      <section>
      {(() => {
        if (this.state.login) {
          return <CommentBox 
                  closeChat={this.closeChat}
                  token={this.state.token} 
                  name={this.state.name} 
                  chat={this.state.chat} 
                  user={this.state.user}
                  />;
        } else {
          return <SimpleLogin login={this.state.login} handleLogin={this.handleLogin}/>;
        }
      })()}
      </section>
    );
  }
});

/*
creare nuovo componente alternativo che si mostra quando utente nn loggato
passare il suo sato=token + email come props dell altro comp
inizializzare comp dei commenti con il socket + token
*/
Starter(<Bootstrap/>,'content')
