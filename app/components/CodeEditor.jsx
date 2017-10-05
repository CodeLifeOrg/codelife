import axios from "axios";
import React, {Component} from "react";
import himalaya from "himalaya";
import {toHTML} from "himalaya/translate";
import {translate} from "react-i18next";
import {Intent, Position, Popover, ProgressBar, PopoverInteractionKind} from "@blueprintjs/core";
import safeEval from "safe-eval";

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
      goodRatio: 0,
      intent: null,
      embeddedConsole: [],
      currentJS: "",
      jsRules: [],
      titleText: "",
      openRules: false,
      openConsole: false
    };
    if (window) {
      window.myCatch = this.myCatch.bind(this);
      window.myLog = this.myLog.bind(this);
      window.myRule = this.myRule.bind(this);
    }
  }

  componentDidMount() {
    axios.get("/api/rules").then(resp => {
      const ruleErrors = resp.data;
      const currentText = this.props.initialValue ? this.props.initialValue : "";
      const rulejson = this.props.rulejson ? this.props.rulejson : [];
      const titleText = this.getTitleText(currentText);
      const baseRules = this.getBaseRules();
      this.setState({mounted: true, currentText, baseRules, rulejson, ruleErrors, titleText}, this.renderText.bind(this));
      if (this.props.onChangeText) this.props.onChangeText(this.props.initialValue);
    });
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
      {type: "NESTS", needle: "title", outer: "head"}
      // {type: "NESTS", needle: "style", outer: "head"}
    ];
    return baseRules;
  }

  getEditor() {
    if (this.editor) return this.editor.editor.editor;
    return undefined;
  }

  /*
  injectConsole(msg) {
    let {embeddedConsole} = this.state;
    embeddedConsole = `${embeddedConsole}\n${msg}`;
    this.setState({embeddedConsole});
  }
  */

  getValidationBox() {
    const {rulejson, baseRules} = this.state;
    const iconList = [];
    iconList.CONTAINS = <span className="pt-icon-standard pt-icon-code"></span>;
    iconList.CSS_CONTAINS = <span className="pt-icon-standard pt-icon-highlight"></span>;
    iconList.CONTAINS_SELF_CLOSE = <span className="pt-icon-standard pt-icon-code"></span>;
    iconList.CONTAINS_ONE = <span className="pt-icon-standard pt-icon-hand-up"></span>;
    iconList.NESTS = <span className="pt-icon-standard pt-icon-property"></span>;
    iconList.JS_VAR_EQUALS = <span className="pt-icon-standard pt-icon-function"></span>;
    const nameList = [];
    nameList.CONTAINS = "exists";
    nameList.CSS_CONTAINS = "css";
    nameList.CONTAINS_ONE = "unique";
    nameList.CONTAINS_SELF_CLOSE = "exists";
    nameList.NESTS = "nests";
    nameList.JS_VAR_EQUALS = "equals";

    const allRules = baseRules.concat(rulejson);

    const organizedRules = [];

    for (const ar of allRules) {
      const or = organizedRules.find(obj => obj.needle === ar.needle);
      if (!or) {
        organizedRules.push({needle: ar.needle, ruleArray: [ar]});
      }
      else {
        or.ruleArray.push(ar);
      }
    }

    const vList = [];

    for (const or of organizedRules) {

      vList.push(<div className="rules">
        <div className="group-name">{or.needle}</div>
        { or.ruleArray.map((rule, i) => <Popover key={i}
          interactionKind={PopoverInteractionKind.HOVER}
          popoverClassName="pt-popover-content-sizing user-popover"
          position={Position.TOP_LEFT}
        >
          <span className={`rule ${rule.passing ? "complete" : ""}`}>
            {iconList[rule.type]}
            <span className="rule-name">{nameList[rule.type]}</span>
          </span>
          <div>
            { !rule.passing ? <div><br/><div style={{color: "red"}}>{this.getErrorForRule(rule)}</div></div> : "Good job!" }
          </div>
        </Popover>)}
      </div>);
    }
    return <div className="contents">{vList}</div>;
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
      else {
        if (n.children && n.children[0] && n.children[0].content) this.setState({currentJS: n.children[0].content});
      }
    }
    return arr;
  }

  cvEquals(r) {
    // For javascript rules, we test their correctness elsewhere (namely, myRule)
    // As such, they are already aware of their passing state, and we can just no-op
    return r.passing;
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
    cv.JS_VAR_EQUALS = this.cvEquals.bind(this);
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

    const allRules = rulejson.length + baseRules.length;
    const goodRatio = (allRules - errors) / allRules;
    const isPassing = errors === 0;
    let intent = this.state.intent;
    if (goodRatio < 0.5) intent = Intent.DANGER;
    else if (goodRatio < 1) intent = Intent.WARNING;
    else intent = Intent.SUCCESS;

    this.setState({isPassing, goodRatio, intent});
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
    const thisRule = this.state.ruleErrors.find(r => r.type === rule.type);
    if (thisRule && thisRule.error_msg) {
      if (thisRule.type === "NESTS") {
        return thisRule.error_msg.replace("{{p1}}", `<${rule.needle}>`).replace("{{p2}}", `<${rule.outer}>`);
      }
      else if (thisRule.type === "JS_VAR_EQUALS") {
        return thisRule.error_msg.replace("{{p1}}", `${rule.needle}`).replace("{{p2}}", `${rule.value}`);
      }
      else {
        return thisRule.error_msg.replace("{{p1}}", `<${rule.needle}>`);
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

  myCatch(e) {
    const {embeddedConsole} = this.state;
    embeddedConsole.push([e]);
    this.setState({embeddedConsole});
  }

  myLog() {
    const {embeddedConsole} = this.state;
    embeddedConsole.push(Array.from(arguments));
    this.setState({embeddedConsole});
  }

  evalType(value) {
    let t = typeof value;
    if (t === "object") {
      if (["Array"].includes(value.constructor.name)) t = "array";
      else if (["Error", "EvalError", "ReferenceError", "SyntaxError"].includes(value.constructor.name)) t = "error";
    }
    return t;
  }

  myRule(needle, value) {
    const {rulejson} = this.state;
    for (const r of rulejson) {
      if (r.needle === needle) {
        // If we have been given type and value, check for both
        if (r.varType && r.value) {
          r.passing = typeof value === r.varType && value == r.value;
        }
        // If we have been given type only, check only for that
        else if (r.varType && !r.value) {
          r.passing = typeof value === r.varType;
        }
        // Otherwise, we are checking only for existence
        else {
          r.passing = value !== undefined;
        }
      }
    }
    this.setState({rulejson});
  }

  wrapJS(theText) {
    let resp = theText.replace("<script>", "<script> try {");
    resp = resp.replace("</script>", "} catch(e) { parent.myCatch(e); } </script>");
    resp = resp.split("console.log").join("parent.myLog");
    return resp;
  }

  jsRender() {
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.wrapJS(this.state.currentText));
      doc.close();
    }
  }

  internalRender() {

    // TODO: Establish a reliable way to determine if we should show the execute button
    if (this.state.currentJS) {

      let js = this.state.currentJS.split("console.log").join("parent.myLog");

      for (const r of this.state.rulejson) {
        if (r.type === "JS_VAR_EQUALS") {
          js = `${r.needle}=undefined;\n${js}`;
          js += `parent.myRule('${r.needle}', ${r.needle});\n`;
        }
      }

      const finaljs = `
        var js=${JSON.stringify(js.replace(/(?:\r\n|\r|\n)/g, ""))};
        try {
          eval(js);
        }
        catch (e) {
          parent.myCatch(e);
        }
      `;

      const theText = this.state.currentText.replace(this.state.currentJS, finaljs);

      if (this.refs.rc) {
        const doc = this.refs.rc.contentWindow.document;
        doc.open();
        doc.write(theText);
        doc.close();
      }

      this.checkForErrors(theText);
    }
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
    let {embeddedConsole} = this.state;
    embeddedConsole = [];
    this.setState({embeddedConsole}, this.internalRender.bind(this));
  }

  toggleDrawer(drawer) {
    this.setState({[drawer]: !this.state[drawer]});
  }

  /* End of external functions */

  render() {
    const {codeTitle, island, t} = this.props;
    const {titleText, currentText, embeddedConsole, goodRatio, intent, openConsole, openRules} = this.state;

    const consoleText = embeddedConsole.map((args, i) => {
      const t1 = this.evalType(args[0]);
      return <div className={`log ${t1}`} key={i}>
        { args.length === 1 && t1 === "error"
        ? <span className="pt-icon-standard pt-icon-delete"></span>
        : <span className="pt-icon-standard pt-icon-double-chevron-right"></span> }
        {args.map((arg, x) => {
          const t = this.evalType(arg);
          let v = arg;
          if (t === "string") v = `"${v}"`;
          else if (t === "object") v = JSON.stringify(v);
          else if (t === "error") v = `Error: ${v.message}`;
          else if (v.toString) v = v.toString();
          return <span className={`arg ${t}`} key={x}>{v}</span>;
        })}
      </div>;
    });

    if (!this.state.mounted) return <Loading />;

    return (
      <div id="codeEditor">
        { this.props.showEditor
          ? <div className="code">
              <div className="panel-title"><span className="favicon pt-icon-standard pt-icon-code"></span>{ codeTitle || "Code" }</div>
              { !this.props.blurred
                ? <AceWrapper
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
              <div className={ `drawer ${openRules ? "open" : ""}` }>
                <div className="title" onClick={ this.toggleDrawer.bind(this, "openRules") }>
                  <ProgressBar className="pt-no-stripes" intent={intent} value={goodRatio}/>
                  <div className="completion">{ Math.round(goodRatio * 100) }% { t("Complete") }</div>
                </div>
                { this.getValidationBox() }
              </div>
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
          <iframe className="iframe" id="iframe" ref="rc" />
          <div className={ `drawer ${openConsole ? "open" : ""}` }>
            <div className="title" onClick={ this.toggleDrawer.bind(this, "openConsole") }><span className="pt-icon-standard pt-icon-application"></span>{ t("Javascript Console") }</div>
            <div className="contents">{consoleText}</div>
          </div>
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
