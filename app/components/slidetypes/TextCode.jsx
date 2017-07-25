import React, {Component} from "react";
import {translate} from "react-i18next";
import AceWrapper from "components/AceWrapper";
import "./TextCode.css";

export default class TextCode extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      mounted: false, 
      currentText: ""
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }
  
  render() {
    
    const {t, htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="tc_container">
        { /* <div id="tc_text-container" dangerouslySetInnerHTML={{__html: htmlcontent1}} /> */ }
        <div id="tc_text-container">{htmlcontent1}</div>
        <div id="tc_code-container">{ this.state.mounted ? <AceWrapper ref={ comp => this.editor = comp } mode="html" showGutter={false} readOnly={true} value={htmlcontent2} setOptions={{behavioursEnabled: false}}/> : null }</div>
        <div className="clear" />
      </div>
    );
  }
}
