import React, {Component} from "react";
import {translate} from "react-i18next";

import CodeEditor from "components/CodeEditor/CodeEditor";

class RenderCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      execState: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  setExecState(execState) {
    this.setState({execState});
  }

  executeCode() {
    if (this.editor) {
      this.editor.getWrappedInstance().getWrappedInstance().executeCode();
    }
  }

  render() {

    const {lax, htmlcontent1, htmlcontent2, island, t} = this.props;
    const {execState} = this.state;

    return (
      <div id="slide-content" className="slide-content renderCode flex-column">
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <CodeEditor suppressJS={this.props.suppressJS} island={island} setExecState={this.setExecState.bind(this)} initialValue={htmlcontent2} lax={lax} className="slide-editor panel-content" ref={c => this.editor = c} readOnly={true} /> : <div className="slide-editor panel-content"></div> }
        </div>
        <div className="centered-buttons validation">
          { execState ? <button className="pt-button pt-intent-warning" onClick={this.executeCode.bind(this)}>{t("Execute")}</button> : null }
        </div>
      </div>
    );
  }
}

RenderCode = translate()(RenderCode);
export default RenderCode;
