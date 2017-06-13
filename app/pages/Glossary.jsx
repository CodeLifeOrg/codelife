import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";

class Glossary extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>Glossary</h1>
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