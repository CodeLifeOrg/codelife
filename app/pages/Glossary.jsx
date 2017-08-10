import React, {Component} from "react";
import {translate} from "react-i18next";

// Glossary Page
//  - make sure all examples use HTML entities to escape reserve characters
//  - like '<' or '>'
//  - use this site for help: https://mothereff.in/html-entities

class Glossary extends Component {

  render() {

    const {t} = this.props;

    return (
      <div id="about-container">
        <h1>{ t("glossary.title") }</h1>

        <h2 name="html">HTML</h2>
        <p>{ t("glossary.html.def") }</p>
        <p><strong>{ t("glossary.example") }</strong></p>
        <pre>
        &lt;html&gt;
          { t("glossary.html.exampleTxt1") }
        &lt;/html&gt;
        </pre>

        <h2 name="css">CSS</h2>
        <p>{ t("glossary.css.def") }</p>
        <p><strong>{ t("glossary.example") }</strong></p>
        <pre>
        &lt;html&gt;
          { t("glossary.css.exampleTxt1") }
        &lt;/html&gt;
        </pre>
      </div>
    );
  }
}

export default translate()(Glossary);
