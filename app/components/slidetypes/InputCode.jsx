import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

import CodeEditor from "components/CodeEditor/CodeEditor";

import {Toaster, Position, Intent, Alert} from "@blueprintjs/core";

/**
 * InputCode is a slide type that requires the student to complete a coding test
 * The CodeEditor component is embedded with a series of rules, and the slide will 
 * not unblock until the student submits a passing code section. It is mostly a wrapper
 * for CodeEditor, with some controls to execute controls or unblock a slide.
 */

class InputCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      titleText: "",
      baseText: "",
      execState: false,
      rulejson: null,
      resetAlert: false
    };
  }

  /**
   * Retrieve the rules and starting code from props and put them into state
   */
  componentDidMount() {
    const rulejson = this.props.rulejson ? JSON.parse(this.props.rulejson) : [];
    const baseText = this.props.htmlcontent2 || "";
    this.setState({mounted: true, rulejson, baseText});
  }

  /**
   * If the user changes slides, update the rules 
   */
  componentDidUpdate(prevProps) {
    if (prevProps.rulejson !== this.props.rulejson) {
      const rulejson = this.props.rulejson ? JSON.parse(this.props.rulejson) : [];
      this.setState({rulejson});
    }
  }

  /**
   * The Embedded CodeEditor itself knows whether the student has written any javascript
   * in the editor window. Dynamically show and hide an "execute" button based on this
   * callback function
   */
  setExecState(execState) {
    this.setState({execState});
  }

  /**
   * Attempt to submit the current code state on click. Requires reaching into the 
   * wrapped CodeEditor instance itself to call a public function, isPassing,
   * which is managed by the CodeEditor. If the student passes, inform the parent 
   * Slide component that this slide is unblocked and the student can continue
   */
  submitAnswer() {
    const {t} = this.props;
    const toast = Toaster.create({className: "submitToast", position: Position.TOP_CENTER});
    if (this.editor.getWrappedInstance().getWrappedInstance().isPassing()) {
      toast.show({message: t("You got it right!"), timeout: 2000, intent: Intent.SUCCESS});
      this.props.unblock();
    }
    else {
      toast.show({message: t("Sorry, try again!"), timeout: 2000, intent: Intent.DANGER});
    }
  }

  /**
   * Reset CodeEditor to original testing state, again by reaching into the CodeEditor 
   * instance itself and setting contents via a public method.
   */
  resetAnswer() {
    this.editor.getWrappedInstance().getWrappedInstance().setEntireContents(this.props.htmlcontent2 || "");
    this.setState({resetAlert: false});
  }

  /**
   * Display Are you sure? Dialog
   */
  attemptReset() {
    this.setState({resetAlert: true});
  }

  /**
   * Reach into the codeEditor and trigger javascript execution.
   */
  executeCode() {
    this.editor.getWrappedInstance().getWrappedInstance().executeCode();
  }

  render() {
    const {lax, t, htmlcontent1, htmlcontent2, island} = this.props;
    const {titleText, rulejson, execState} = this.state;

    return (
      <div id="slide-content" className="slide-content renderCode flex-column">
        {/* Alert Window: Are you sure you want to reset the code state? */}
        <Alert
          isOpen={ this.state.resetAlert }
          cancelButtonText={ t("Cancel") }
          confirmButtonText={ t("buttonReset") }
          intent={ Intent.DANGER }
          onCancel={ () => this.setState({resetAlert: false}) }
          onConfirm={ () => this.resetAnswer() }>
          <p>{t("Are you sure you want to reset the code to its original state?")}</p>
        </Alert>
        { titleText && titleText.length ? <div className="title-tab">{titleText}</div> : null }
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <CodeEditor suppressJS={this.props.suppressJS} readOnly={this.props.readOnly} island={island} setExecState={this.setExecState.bind(this)} rulejson={rulejson} lax={lax} className="slide-editor panel-content" ref={c => this.editor = c} initialValue={htmlcontent2} /> : <div className="slide-editor panel-content"></div> }
        </div>
        <div className={execState ? "centered-buttons validation three-buttons" : "centered-buttons validation"} >
          <button className="pt-button pt-intent-danger" onClick={this.attemptReset.bind(this)}>{t("buttonReset")}</button>
          { execState ? <button className="pt-button pt-intent-primary" onClick={this.executeCode.bind(this)}>{t("Execute")}</button> : null }
          <button className="pt-button pt-intent-success" onClick={this.submitAnswer.bind(this)}>{t("Submit")}</button>
        </div>
      </div>
    );
  }
}

InputCode.defaultProps = {
  htmlcontent2: ""
};

InputCode = connect(state => ({
  user: state.auth.user
}))(InputCode);
InputCode = translate()(InputCode);
export default InputCode;
