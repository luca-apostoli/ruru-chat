import React from "react"
import ReactDOM from "react-dom"

export class CommentForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this)
    this.handleTextChange  = this.handleTextChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {author: '', text: '', token: ''};
  }

  componentDidMount() {
    this.setState({author: this.props.name, text: '', token: this.props.token});
  }

  handleTextChange(e) {
    this.setState({text: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    var token = this.state.token.trim();
    if (!text || !author || !token) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text, token: token});
    this.setState({author: author, text: '', token: token});
  }

  render() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <div className="ui action input large">
        <input
          type="hidden"
          value={this.state.token}
        />
        <input
          type="hidden"
          value={this.state.author}
        />
        <input
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Post" className="ui teal button large"/>
        </div>
      </form>
    );
  }
}
