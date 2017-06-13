import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";

class Glossary extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>{ t("Glossary") }</h1>
        <h3>Words</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit.</p>
        <h3>Go</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit.</p>
        <h3>Here</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit.</p>
        <Nav />
      </div>
    );
  }
}

export default translate()(Glossary);
