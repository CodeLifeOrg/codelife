import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextCode.css";

class Editor extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/html");
      require("brace/theme/monokai");
      return <Ace ref={editor => this.editor = editor} editorProps={{$blockScrolling: Infinity}} {...this.props}/>;
    }
    return null;
  }
}

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
        <div id="tc_code-container">{ this.state.mounted ? <Editor ref={ comp => this.editor = comp } mode="html" theme="monokai" showGutter={false} readOnly={true} value={htmlcontent2} setOptions={{behavioursEnabled: false}}/> : null }</div>
        <div className="clear" />
      </div>
    );
  }
}
