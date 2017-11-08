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
      rulejson: null,
      resetAlert: false
    };
  }

  componentDidMount() {
    const rulejson = this.props.rulejson ? JSON.parse(this.props.rulejson) : [];
    const baseText = this.props.htmlcontent2 || "";
    this.setState({mounted: true, rulejson, baseText});
  }

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

  // TODO: sanitize htmlcontent to not be null so I don't have to do these tests
  resetAnswer() {
    this.editor.getWrappedInstance().getWrappedInstance().setEntireContents(this.props.htmlcontent2 || "");
    this.setState({resetAlert: false});
  }

  attemptReset() {
    this.setState({resetAlert: true});
  }

  executeCode() {
    this.editor.getWrappedInstance().getWrappedInstance().executeCode();
  }

  render() {
    const {t, htmlcontent1, htmlcontent2, island} = this.props;
    const {titleText, rulejson} = this.state;

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
          { this.state.mounted ? <CodeEditor island={island} rulejson={rulejson} className="slide-editor" ref={c => this.editor = c} initialValue={htmlcontent2} /> : <div className="slide-editor"></div> }
        </div>
        <div className="validation">
          <button className="pt-button" onClick={this.attemptReset.bind(this)}>{t("Reset")}</button>
          <button className="pt-button pt-intent-warning" onClick={this.executeCode.bind(this)}>{t("Execute")}</button>
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
