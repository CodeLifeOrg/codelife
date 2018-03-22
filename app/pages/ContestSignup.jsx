import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import "./ContestSignup.css";

class ContestSignup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  render() {
    // const {t} = this.props;

    return (
      <div id="signup-container">
        <div>
        Signup here
        </div>
        <ul>
          <li>rules</li>
          <li>rules</li>
          <li>rules</li>
        </ul>
        <ul>
          <li><Link to="/contest">see the rules</Link></li>
          <li><Link to="/contest/submit">submit a project</Link></li>
        </ul>
      </div>
    );
  }
}

export default translate()(ContestSignup);
