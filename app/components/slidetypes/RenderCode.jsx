import React, {Component} from "react";
import {translate} from "react-i18next";
import AceWrapper from "components/AceWrapper";
import "./RenderCode.css";

export default class RenderCode extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      mounted: false, 
      currentText: "",
    };
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  renderText() {
    if (this.refs.rf) {
      const doc = this.refs.rf.contentWindow.document;
      doc.open();
      doc.write(this.props.htmlcontent2);
      doc.close();
    }
  }

  componentDidMount() {
    this.setState({mounted: true, currentText: this.props.htmlcontent2}, this.renderText.bind(this));
  }
  
  render() {
    
    const {t, htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="rc_container">
        <div id="rc_instructions">{htmlcontent1}</div>
        <div id="rc_code-container">{ this.state.mounted ? <AceWrapper ref={ comp => this.editor = comp } mode="html" readOnly={true} showGutter={false} value={htmlcontent2} setOptions={{behavioursEnabled: false}}/> : null }</div>
        <div id="rc_render-container"><iframe id="render-frame" ref="rf" /></div>
        <div className="clear" />
      </div>
    );
  }
}
