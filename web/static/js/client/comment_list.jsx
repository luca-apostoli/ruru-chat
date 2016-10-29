import React from "react"
import ReactDOM from "react-dom"
import TransitionGroup from 'react-addons-transition-group'

import {Comment} from 'client_comment'

export class CommentList extends React.Component {
  
  render() {
    var commentNodes = this.props.data.map((comment) => {
      return (        
        <Comment 
            author={comment.author} 
            key={comment.id} 
            mine={comment.mine}
            total={this.props.data.length}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="messageList ui list">
        <TransitionGroup>
          {commentNodes}
        </TransitionGroup>
      </div>
    );
  }
}
