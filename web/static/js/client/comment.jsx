import React from "react"
import ReactDOM from "react-dom"
import TransitionGroup from 'react-addons-transition-group'

let $ = require("jquery")
let Remarkable = require('remarkable')

export class Comment extends React.Component {
  
  rawMarkup() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  }

  topOwnerClass() {
    var topClass = ' ui '; 
    if (!this.props.mine) {
      topClass += ' right aligned blue ';
    }
    topClass += ' top attached block header';
    return topClass;
  }

  bottomOwnerClass() {
    var bottomClass = 'ui ';
    if (!this.props.mine) {
      bottomClass += ' right aligned ';
    }
    bottomClass += ' bottom attached segment';
    return bottomClass;
  }

  componentWillEnter(callback) {
      const el = $(this._message);
      var totalHeight = this.props.total * $(el).outerHeight(true);
      $(el).parent().parent().scrollTop(totalHeight);
      $(el).css('opacity',0)
      .animate({opacity: 1}, 300, 'linear', callback);
  }

  componentWillAppear(callback) {
      const el = $(this._message);
      var totalHeight = this.props.total * $(el).outerHeight(true);      
      $(el).parent().parent().scrollTop(totalHeight);
      $(el).css('opacity',0)
      .animate({opacity: 1}, 300, 'linear', callback);
  }

  render() {
    return (
      <div className="comment column" ref={(ref) => this._message = ref}>
        <h4 className={this.topOwnerClass()}>{this.props.author}</h4>
        <div className={this.bottomOwnerClass()} dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
}
