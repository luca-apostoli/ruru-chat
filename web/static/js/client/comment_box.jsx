import React from "react"
import ReactDOM from "react-dom"
import TransitionGroup from 'react-addons-transition-group'

import {CommentList} from 'client_comment_list'
import {CommentForm} from 'client_comment_form'

import {Socket} from "phoenix"

let $ = require("jquery")
let _ = require("lodash")

let socket;
let channel;


export class CommentBox extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {data: [], user: this.props.user};
    this.preloadCommentsFromServer = this.preloadCommentsFromServer.bind(this)
    this.loadCommentsFromServer = this.loadCommentsFromServer.bind(this)
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this)
  }

  preloadCommentsFromServer() {
    var chat = this.props.chat;
    var token = this.props.token;
    $.ajax("/api/user/messages/preload", {
      method: "GET",
      data: {token: token, chat: chat}, 
      success: resp => {
        if(!_.isEmpty(resp)) {
          var comments = this.state.data
          var newComments = comments
          _.forEach(resp, (item) => {
            var comment = {};
            if(_.findIndex(newComments, ['id', item.id]) < 0) {
              if (!_.isEmpty(item.user)) { 
                comment = {id: item.id, text: item.text, author: item.user.name, mine: true}
              } else {
                comment = {id: item.id, text: item.text, author: item.operator.name, mine: false}
              }            
              newComments = newComments.concat([comment])
            }
          })
          if(!_.isEmpty(newComments)) {
            this.setState({data: newComments});
          }
        }
      }
    })
  }

  loadCommentsFromServer() {    
    channel.on("new_msg", payload => {
      var comments = this.state.data
      if(_.findIndex(comments, ['id', payload.id]) < 0) {
        var mine = false;
        if(payload.role === 'user') {
          mine = true;
        }
        var comment = {id: payload.id, text: payload.body, author: payload.author, mine: mine}
        var newComments = comments.concat([comment])
        this.setState({data: newComments});
      }
    })    
  }

  handleCommentSubmit(comment) {
    var comments = this.state.data
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now()
    var newComments = comments.concat([comment])
//    this.setState({data: newComments});
    channel.push("new_msg", {body: comment.text, author: comment.author, token: comment.token, guest: this.props.user, role: "user"})    
  }

  channelClose(msg) {
    channel.push("usr_leave", {role: "user"})
      .receive("ok", resp => { console.log("Left successfully " + msg, resp) })
      .receive("error", resp => { console.log("Unable to leave "+ msg, resp) })

  }

  componentWillUnmount() {
    this.channelClose("user is closing the window")
  }

  componentWillMount() {
    socket = new Socket("/socket", {params: {token: this.props.token}})
    socket.connect()
    // Now that you are connected, you can join channels with a topic:
    channel = socket.channel("room:" + this.props.chat, {role: "user", guest: this.props.name})
    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    this.loadCommentsFromServer();
  }

  componentDidMount() {
    this.preloadCommentsFromServer();
  }

  render() {
    return (
      <div className="commentBox">
        <h4 className="ui top attached block header">
          <div className="ui animated fade button" tabIndex="0" onClick={this.props.closeChat}>
            <div className="visible content">Comments</div>
            <div className="hidden content">Close this chat</div>
          </div>
        </h4>        
        <CommentList data={this.state.data} />
        <CommentForm token={this.props.token} name={this.props.name} onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
}
