import React from "react"
import ReactDOM from "react-dom"

export class SimpleLogin extends React.Component {
  
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.state = {email: ''};
  }

  handleSubmit(e) {
    e.preventDefault();
    let props = this.props;
    //chiamare in remoto per loggare utente
    $.ajax("/api/create/" + this.state.email, {
      method: "GET",
      success: function(data) {
        console.log(data);
        if (!props.login) {
          props.handleLogin(data);
        }
      }
    });    
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }

  render() {
    return (
      <form className="loginForm" onSubmit={this.handleSubmit}>
          <div className="ui action input large">
            <input            
              type="text"
              placeholder="Your Email"
              value={this.state.email}
              onChange={this.handleEmailChange}
            />
            <input type="submit" value="Start" className="ui teal button large primary"/>
          </div>
      </form>
    );
  }

}
