import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";

class Home extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1><img className="image" width="40" height="40" src="icon.svg" />&nbsp;Codelife</h1>
        <Nav />
      </div>
    );
  }
}

export default translate()(Home);
