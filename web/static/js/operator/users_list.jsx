import React from "react"
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import {UserDetail} from "./user_detail"

export class UsersList extends React.Component{

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(user) {
    this.props.handleClick(user);
  }

  render() {
    var handleClick = this.handleClick;
    var userNodes = this.props.users.map((user) => {
      return (
        <UserDetail 
          key={user.id} 
          chat={user.chat} 
          name={user.name} 
          handleClick={handleClick} 
          user={user} 
          selected={this.props.selected}
          status={user.status}
          />
      );
    });
    return (
      <div className="usersList ui vertical secondary menu">
        <ReactCSSTransitionGroup 
          transitionName="userlist" 
          transitionEnterTimeout={500} 
          transitionLeaveTimeout={300}
          transitionAppear={true} 
          transitionAppearTimeout={500}>
          {userNodes}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
