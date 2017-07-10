import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextCode.css";

class Editor extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/html");
      require("brace/theme/monokai");
      return <Ace ref={editor => this.editor = editor} {...this.props}/>;
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
      <div className="tc_container">
        <div className="tc_textcontainer" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div className="tc_codecontainer">{ this.state.mounted ? <Editor ref={ comp => this.editor = comp } mode="html" theme="monokai" showGutter={false} readOnly={true} value={htmlcontent2} setOptions={{behavioursEnabled: false}}/> : null }</div>
        <div className="clear" />
      </div>
    );
  }
}
