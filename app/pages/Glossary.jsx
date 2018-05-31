import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {fetchData} from "datawheel-canon";
import "./Glossary.css";

// Glossary Page
//  - make sure all examples use HTML entities to escape reserve characters
//  - like '<' or '>'
//  - use this site for help: https://mothereff.in/html-entities

class Glossary extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {t} = this.props;
    const words = this.props.data.glossary;

    const wordList = words.map(w => 
      <div key={w.id} id={w.word}>
        <h2>{w.word}</h2>
        <div dangerouslySetInnerHTML={{__html: w.definition}}></div>
      </div>
    );

    return (

      <div id="about-container">
        <h1>{ t("glossary.title") }</h1>
        {wordList}
      </div>

    );
  }
}

Glossary.need = [
  fetchData("glossary", "/api/glossary/all?lang=<i18n.locale>")
];

const mapStateToProps = state => ({
  data: state.data
});

Glossary = connect(mapStateToProps)(Glossary);
export default translate()(Glossary);
