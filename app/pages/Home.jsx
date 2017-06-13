import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import { Link } from 'react-router';

class Home extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>Codelife</h1>
        <ul>
        	<li><Link className="link" to="/lesson">{ t("Lessons") }</Link></li>
        	<li><Link className="link" to="/glossary">{ t("Glossary") }</Link></li>
        	<li><Link className="link" to="/profile">{ t("Profile") }</Link></li>
        </ul>
      </div>
    );
  }
}

export default translate()(Home);