import React, {Component} from "react";
import himalaya from "himalaya";
import {toHTML} from "himalaya/translate";
import {translate} from "react-i18next";

import AceWrapper from "components/AceWrapper";
import Loading from "components/Loading";

import {cvNests, cvContainsOne, cvContainsTag, cvContainsStyle, cvContainsSelfClosingTag} from "utils/codeValidation.js";

import "./CodeEditor.css";

class CodeEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      changesMade: false,
      baseRules: null,
      isPassing: false,
      rulejson: [],
      ruleErrors: [],
      embeddedConsole: "",
      titleText: "",
      isOpen: false
    };
  }

  componentDidMount() {
    const currentText = this.props.initialValue ? this.props.initialValue : "";
    const rulejson = this.props.rulejson ? this.props.rulejson : [];
    const ruleErrors = this.props.ruleErrors ? this.props.ruleErrors : [];
    const titleText = this.getTitleText(currentText);
    const baseRules = this.getBaseRules();
    this.setState({mounted: true, currentText, baseRules, rulejson, ruleErrors, titleText}, this.renderText.bind(this));
    if (this.props.onChangeText) this.props.onChangeText(this.props.initialValue);

    console["log"] = this.injectConsole.bind(this);

  }

  getBaseRules() {
    const baseRules = [
      {type: "CONTAINS", needle: "html"},
      {type: "CONTAINS", needle: "head"},
      {type: "CONTAINS", needle: "title"},
      {type: "CONTAINS", needle: "body"},
      {type: "CONTAINS_ONE", needle: "html"},
      {type: "CONTAINS_ONE", needle: "head"},
      {type: "CONTAINS_ONE", needle: "title"},
      {type: "CONTAINS_ONE", needle: "body"},
      {type: "NESTS", needle: "head", outer: "html"},
      {type: "NESTS", needle: "body", outer: "html"},
      {type: "NESTS", needle: "head", outer: "html"},
      {type: "NESTS", needle: "title", outer: "head"},
      {type: "NESTS", needle: "style", outer: "head"}
    ];
    return baseRules;
  }

  getEditor() {
    if (this.editor) return this.editor.editor.editor;
    return undefined;
  }

  injectConsole(msg) {
    let {embeddedConsole} = this.state;
    embeddedConsole += msg;
    this.setState({embeddedConsole});
  }

  getTitleText(theText) {
    const {t} = this.props;
    const content = himalaya.parse(theText);
    let head, html, title = null;
    let titleText = "";
    if (content) html = content.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) title = head.children.find(e => e.tagName === "title");
    if (title && title.children[0]) titleText = title.children[0].content;
    return titleText || t("Webpage");
  }

  stripJS(json) {
    const arr = [];
    if (json.length === 0) return arr;
    for (const n of json) {
      if (n.tagName !== "script") {
        const newObj = {};
        // clone the object
        for (const prop in n) {
          if (n.hasOwnProperty(prop)) {
            newObj[prop] = n[prop];
          }
        }
        // this is a hack for a himalaya bug
        if (!newObj.tagName) newObj.tagName = "";
        // if the old object had children, set the new object's children
        // to nothing because we need to make it ourselves
        if (n.children) newObj.children = [];
        // if the old object had children
        if (n.children && n.children.length > 0) {
          // then construct a new array recursively
          newObj.children = this.stripJS(n.children);
        }
        arr.push(newObj);
      }
    }
    return arr;
  }

  checkForErrors(theText) {
    const jsonArray = himalaya.parse(theText);
    const {baseRules, rulejson} = this.state;
    let errors = 0;
    const cv = [];
    cv.CONTAINS = cvContainsTag;
    cv.CONTAINS_ONE = cvContainsOne;
    cv.CSS_CONTAINS = cvContainsStyle;
    cv.CONTAINS_SELF_CLOSE = cvContainsSelfClosingTag;
    cv.NESTS = cvNests;
    for (const r of baseRules) {
      const payload = r.type === "CSS_CONTAINS" ? jsonArray : theText;
      if (cv[r.type]) r.passing = cv[r.type](r, payload);
      if (!r.passing) errors++;
    }
    for (const r of rulejson) {
      const payload = r.type === "CSS_CONTAINS" ? jsonArray : theText;
      if (cv[r.type]) r.passing = cv[r.type](r, payload);
      if (!r.passing) errors++;
    }
    console.log("---------------------------");
    console.log("BASE RULES");
    console.log("---------------------------");
    for (const r of baseRules) {
      console.log(r.type, r.needle, r.outer ? r.outer : "", r.passing);
    }
    for (const r of baseRules) {
      if (!r.passing) console.log(this.getErrorForRule(r));
    }
    console.log("---------------------------");
    console.log("CUSTOM RULES");
    console.log("---------------------------");
    for (const r of rulejson) {
      console.log(r.type, r.needle, r.outer ? r.outer : "", r.passing);
    }
    for (const r of rulejson) {
      if (!r.passing) console.log(this.getErrorForRule(r));
    }

    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    this.setState({isPassing: errors === 0});
  }

  renderText() {
    if (this.refs.rc) {
      let theText = this.state.currentText;
      this.checkForErrors(theText);
      if (theText.includes("script")) {
        const oldJSON = himalaya.parse(this.state.currentText);
        const newJSON = this.stripJS(oldJSON);
        theText = toHTML(newJSON);
      }
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(theText);
      doc.close();
    }
  }

  getErrorForRule(rule) {
    const myrule = this.state.ruleErrors.find(r => r.type === rule.type);
    if (myrule && myrule.error_msg) {
      if (myrule.type === "NESTS") {
        return myrule.error_msg.replace("{{tag1}}", `<${rule.needle}>`).replace("{{tag2}}", `<${rule.outer}>`);
      }
      else {
        return myrule.error_msg.replace("{{tag1}}", `<${rule.needle}>`);
      }
    }
    else {
      return "";
    }
  }

  onChangeText(theText) {
    const titleText = this.getTitleText(theText);
    this.setState({currentText: theText, changesMade: true, titleText}, this.renderText.bind(this));
    if (this.props.onChangeText) this.props.onChangeText(theText);
  }

  showContextMenu(selectionObject) {
    const text = selectionObject.toString();
    // If you want to insert the selected text here, it's available
  }

  /* External Functions for Parent Component to Call */

  setEntireContents(theText) {
    const titleText = this.getTitleText(theText);
    this.setState({currentText: theText, changesMade: false, titleText}, this.renderText.bind(this));
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
    this.setState({currentText: this.getEditor().getValue(), changesMade: true}, this.renderText.bind(this));
  }

  getEntireContents() {
    return this.state.currentText;
  }

  isPassing() {
    return this.state.isPassing;
  }

  changesMade() {
    return this.state.changesMade;
  }

  setChangeStatus(changesMade) {
    this.setState({changesMade});
  }

  executeCode() {
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.state.currentText);
      doc.close();
    }
  }

  /* End of external functions */

  render() {
    const {codeTitle, island, t} = this.props;
    const {titleText, currentText} = this.state;

    if (!this.state.mounted) return <Loading />;

    return (
      <div id="codeEditor">
        { this.props.showEditor
          ? <div className="code">
              <div className="panel-title"><span className="favicon pt-icon-standard pt-icon-code"></span>{ codeTitle || "Code" }</div>
              { !this.props.blurred
                ? 
                  <AceWrapper
                    className="editor"
                    ref={ comp => this.editor = comp }
                    onChange={this.onChangeText.bind(this)}
                    value={currentText}
                    {...this.props}
                  />
                : <pre className="editor blurry-text">{currentText}</pre>
              }
              { this.props.blurred ? <div className={ `codeBlockTooltip pt-popover pt-tooltip ${ island ? island : "" }` }>
                  <div className="pt-popover-content">
                    { t("Codeblock's code will be shown after you complete the last level of this island.") }
                  </div>
                </div> : null }
            </div>
          : null
        }
        <div className="render">
          <div className="panel-title">
            { island
            ? <img className="favicon" src={ `/islands/${island}-small.png` } />
            : <span className="favicon pt-icon-standard pt-icon-globe"></span> }
            { titleText }
          </div>
          <iframe className="iframe" ref="rc" />
        </div>
      </div>
    );
  }
}

CodeEditor.defaultProps = {
  island: false,
  readOnly: false,
  blurred: false,
  showEditor: true
};


CodeEditor = translate(undefined, {withRef: true})(CodeEditor);
export default CodeEditor;
