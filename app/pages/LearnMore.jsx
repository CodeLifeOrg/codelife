import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import "./LearnMore.css";

/**
 * Simple partners page to link to other online coding projects
 */

class LearnMore extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const {locale, t} = this.props;

    return (
      <div id="LearnMore">
        <h1>{ t("Learn More") }</h1>
        <p>{ t("LearnMore.intro") }</p>
        <div className="links">
          <a className="pt-card pt-interactive link" href="https://scratch.mit.edu/" style={{backgroundImage: "url('/partners/scratch.jpg')"}} target="_blank" rel="noopener noreferrer"></a>
          <a className="pt-card pt-interactive link border" href={ locale === "pt" ? "https://pt.khanacademy.org/" : "https://www.khanacademy.org/" } style={{backgroundImage: "url('/partners/khan.jpg')"}} target="_blank" rel="noopener noreferrer"></a>
          <a className="pt-card pt-interactive link border" href={ locale === "pt" ? "https://www.codecademy.com/pt" : "https://www.codecademy.com/" } style={{backgroundImage: "url('/partners/codeacademy.jpg')"}} target="_blank" rel="noopener noreferrer"></a>
          <a className="pt-card pt-interactive link" href="https://www.datacamp.com/" style={{backgroundImage: "url('/partners/datacamp.jpg')"}} target="_blank" rel="noopener noreferrer"></a>
        </div>
      </div>
    );
  }
}

LearnMore = connect(state => ({
  locale: state.i18n.locale
}))(LearnMore);
export default translate()(LearnMore);
