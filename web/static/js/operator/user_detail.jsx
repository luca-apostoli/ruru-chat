import React from "react"
import ReactDOM from "react-dom"

export class UserDetail extends React.Component {
  
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.getStyleClass = this.getStyleClass.bind(this);
    this.getHiddenContent = this.getHiddenContent.bind(this);
  }

  handleClick(){
    if(this.props.status !== "disabled") {
      this.props.handleClick(this.props.user);
    }
  }

  getStyleClass() {
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
    if(this.props.status === "disabled") {
      className += ' disabled'; 
    }
    return className;
  }

  getHiddenContent() {
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
  }

  render() {
    return (
      <div className="userDetails item" data-tab={this.props.chat} onClick={this.handleClick}>
        <div className={this.getStyleClass()}>
          <div className="hidden content">{this.getHiddenContent()}</div>
          <div className="visible content">{this.props.name}</div>          
        </div>
      </div>
    );
  }
}
