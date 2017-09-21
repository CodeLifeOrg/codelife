import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

import CodeEditor from "components/CodeEditor";

import {Toaster, Position, Intent, Alert} from "@blueprintjs/core";

class InputCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      titleText: "",
      baseText: "",
      ruleErrors: [],
      rulejson: null,
      resetAlert: false,
      gemEarned: false
    };
  }

  componentDidMount() {
    const ruleErrors = this.props.ruleErrors ? this.props.ruleErrors : [];
    const rulejson = this.props.rulejson ? JSON.parse(this.props.rulejson) : [];
    const baseText = this.props.htmlcontent2 ? this.props.htmlcontent2 : "";
    this.setState({mounted: true, ruleErrors, rulejson, baseText});
  }

  componentDidUpdate() {
    const newText = this.props.htmlcontent2 ? this.props.htmlcontent2 : "";
    if (this.state.baseText !== newText) {
      this.setState({baseText: newText, gemEarned: false});
      this.editor.getWrappedInstance().setEntireContents(newText);
    }
  }

  submitAnswer() {
    const {t} = this.props;
    const {gemEarned} = this.state;
    const toast = Toaster.create({className: "submitToast", position: Position.TOP_CENTER});
    if (this.editor.getWrappedInstance().isPassing()) {
      toast.show({message: t("You got it right!"), timeout: 2000, intent: Intent.SUCCESS});
      this.props.unblock();
      if (!gemEarned && this.props.updateGems) this.props.updateGems(1);
    }
    else {
      toast.show({message: t("Sorry, try again!"), timeout: 2000, intent: Intent.DANGER});
      if (!gemEarned && this.props.updateGems) this.props.updateGems(-1);
    }
    this.setState({gemEarned: true});
  }

  // TODO: sanitize htmlcontent to not be null so I don't have to do these tests
  resetAnswer() {
    this.editor.getWrappedInstance().setEntireContents(this.props.htmlcontent2 ? this.props.htmlcontent2 : "");
    this.setState({resetAlert: false});
  }

  attemptReset() {
    this.setState({resetAlert: true});
  }

  executeCode() {
    this.editor.getWrappedInstance().executeCode();
  }

  render() {
    const {t, htmlcontent1, htmlcontent2, island} = this.props;
    const {titleText, ruleErrors, rulejson} = this.state;

    const initialContent = htmlcontent2 ? htmlcontent2 : "";

    return (
      <div id="slide-container" className="renderCode flex-column">
        <Alert
            isOpen={ this.state.resetAlert }
            cancelButtonText={ t("Cancel") }
            confirmButtonText={ t("Reset") }
            intent={ Intent.DANGER }
            onCancel={ () => this.setState({resetAlert: false}) }
            onConfirm={ () => this.resetAnswer() }>
            <p>{t("Are you sure you want to reset the code to its original state?")}</p>
        </Alert>
        <div className="title-tab">{titleText}</div>
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <CodeEditor island={island} ruleErrors={ruleErrors} rulejson={rulejson} className="slide-editor" ref={c => this.editor = c} initialValue={initialContent} /> : <div className="slide-editor"></div> }
        </div>
        <div className="validation">
          <button className="pt-button" onClick={this.attemptReset.bind(this)}>{t("Reset")}</button>
          { this.props.exec ? <button className="pt-button pt-intent-warning" onClick={this.executeCode.bind(this)}>{t("Execute")}</button> : null}
          <button className="pt-button pt-intent-success" onClick={this.submitAnswer.bind(this)}>{t("Submit")}</button>
        </div>
      </div>
    );
  }
}

InputCode = connect(state => ({
  user: state.auth.user
}))(InputCode);
InputCode = translate()(InputCode);
export default InputCode;
