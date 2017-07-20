import React, {Component} from "react";
import {translate} from "react-i18next";

// Glossary Page
// Currently a placeholder for what will be a glossary of CS terms

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
      </div>
    );
  }
}

export default translate()(Glossary);
