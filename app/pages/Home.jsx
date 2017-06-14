import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";

class Home extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1><img className="image" width="40" height="40" src="icon.svg" />&nbsp;Codelife</h1>
        <ul>
          <li><Link className="link" to="/track">{ t("Tracks") }</Link></li>
          <li><Link className="link" to="/glossary">{ t("Glossary") }</Link></li>
          <li><Link className="link" to="/profile">{ t("Profile") }</Link></li>
        </ul>
      </div>
    );
  }
}

export default translate()(Home);
