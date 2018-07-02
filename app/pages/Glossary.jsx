import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {fetchData} from "datawheel-canon";
import "./Glossary.css";

/** 
 * The Glossary component retrieves words 
 * It is worth noting that the storage of glossary words is somewhat split-brained. Here in Glossary.jsx, canon's "need" functionality
 * is used to ensure that words are rendered server-side and therefore indexable by search engines. However, glossary words used to live 
 * in the Redux Store (and in QuillWrapper, this is still how they are loaded). Both places use the same API endpoint - but one 
 * uses canon needs, the other puts the data into redux in App.jsx's mount method.
 */

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
