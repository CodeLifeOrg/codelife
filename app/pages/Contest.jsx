import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import "./Contest.css";

class Contest extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  render() {
    // const {t} = this.props;

    return (
      <div id="contest-container">
        <h2>Welcome to the Codelife Contest</h2>
        
        <p>code with your friends and win prizes</p>
        <ul>
          <li>rules</li>
          <li>rules</li>
          <li>rules</li>
        </ul>
        <ul>
          <li><Link to="/contest/signup">sign up</Link></li>
          <li><Link to="/contest/submit">submit a project</Link></li>
        </ul>
      </div>
    );
  }
}

export default translate()(Contest);
