import React, {Component} from "react";
import {translate} from "react-i18next";

import CodeEditor from "components/CodeEditor";

class RenderCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
    if (this.props.updateGems) this.props.updateGems(1);
  }

  componentDidUpdate() {
    let content = "";
    if (this.props.htmlcontent2) content = this.props.htmlcontent2;
    if (this.editor.getWrappedInstance().getWrappedInstance().getEntireContents() !== content) {
      this.editor.getWrappedInstance().getWrappedInstance().setEntireContents(content);
    }
  }

  executeCode() {
    if (this.editor) {
      this.editor.getWrappedInstance().getWrappedInstance().executeCode();
    }
  }

  render() {

    const {htmlcontent1, htmlcontent2, island, t} = this.props;

    return (
      <div id="slide-container" className="renderCode flex-column">
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <CodeEditor island={island} initialValue={htmlcontent2} className="slide-editor" ref={c => this.editor = c} readOnly={true} /> : <div className="slide-editor"></div> }
        </div>
        <div className="validation">
          <button className="pt-button pt-intent-warning" onClick={this.executeCode.bind(this)}>{t("Execute")}</button>
        </div>
      </div>
    );
  }
}

RenderCode = translate()(RenderCode);
export default RenderCode;
