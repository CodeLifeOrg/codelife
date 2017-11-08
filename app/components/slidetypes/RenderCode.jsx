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
  }

  executeCode() {
    if (this.editor) {
      this.editor.getWrappedInstance().getWrappedInstance().executeCode();
    }
  }

  render() {

    const {lax, htmlcontent1, htmlcontent2, island, t} = this.props;

    return (
      <div id="slide-container" className="renderCode flex-column">
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <CodeEditor island={island} initialValue={htmlcontent2} lax={lax} className="slide-editor" ref={c => this.editor = c} readOnly={true} /> : <div className="slide-editor"></div> }
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
