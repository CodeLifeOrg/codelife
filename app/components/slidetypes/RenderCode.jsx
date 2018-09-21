import React, {Component} from "react";
import {translate} from "react-i18next";

import CodeEditor from "components/CodeEditor/CodeEditor";

/**
 * RenderCode is similar to InputCode, but the CodeEditor is in readonly mode
 * For showing code examples with explanations.
 */

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

  /** 
   * Callback for CodeEditor, when it reports that the student is using javascript,
   * show an exec button on this slide.
   */
  setExecState(execState) {
    this.setState({execState});
  }

  /** 
   * When the execute button is clicked, pass the command down to the public method in CodeEditor
   */
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
