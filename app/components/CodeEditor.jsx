import axios from "axios";
import React, {Component} from "react";
import himalaya from "himalaya";
import {toHTML} from "himalaya/translate";
import {translate} from "react-i18next";
import {Intent, Position, Popover, ProgressBar, PopoverInteractionKind} from "@blueprintjs/core";

import AceWrapper from "components/AceWrapper";
import Loading from "components/Loading";

import {cvNests, cvContainsOne, cvContainsTag, cvContainsStyle, cvContainsSelfClosingTag} from "utils/codeValidation.js";

import "./CodeEditor.css";

function receiveMessage(event) {
  if (event.origin !== "https://sandbox.codelife.com") return;
  this.myPost(...event.data);
}

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
      window.addEventListener("message", receiveMessage.bind(this), false);
    }
  }

  componentDidMount() {
    axios.get("/api/rules").then(resp => {
      const ruleErrors = resp.data;
      const currentText = this.props.initialValue ? this.props.initialValue : "";
      const rulejson = this.props.rulejson ? this.props.rulejson : [];
      const titleText = this.getTitleText(currentText);
      const baseRules = this.props.lax ? [] : this.getBaseRules();
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
    ];
    return baseRules;
  }

  getEditor() {
    if (this.editor) return this.editor.editor.editor;
    return undefined;
  }

  getValidationBox() {
    const {rulejson, baseRules} = this.state;
    const iconList = [];
    iconList.CONTAINS = <span className="pt-icon-standard pt-icon-code"></span>;
    iconList.CSS_CONTAINS = <span className="pt-icon-standard pt-icon-highlight"></span>;
    iconList.CONTAINS_SELF_CLOSE = <span className="pt-icon-standard pt-icon-code"></span>;
    iconList.CONTAINS_ONE = <span className="pt-icon-standard pt-icon-hand-up"></span>;
    iconList.NESTS = <span className="pt-icon-standard pt-icon-property"></span>;
    iconList.JS_VAR_EQUALS = <span className="pt-icon-standard pt-icon-variable"></span>;
    iconList.JS_FUNC_EQUALS = <span className="pt-icon-standard pt-icon-function"></span>;
    iconList.JS_MATCHES = <span className="pt-icon-standard pt-icon-search-text"></span>;
    iconList.JS_USES = <span className="pt-icon-standard pt-icon-derive-column"></span>;

    const nameList = [];
    nameList.CONTAINS = "exists";
    nameList.CSS_CONTAINS = "css";
    nameList.CONTAINS_ONE = "unique";
    nameList.CONTAINS_SELF_CLOSE = "exists";
    nameList.NESTS = "nests";
    nameList.JS_VAR_EQUALS = "equals";
    nameList.JS_FUNC_EQUALS = "invokes";
    nameList.JS_MATCHES = "contains";
    nameList.JS_USES = "implements";

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
        if (n.children && n.children[0] && n.children[0].content) this.setState({currentJS: n.children[0].content}, this.checkForErrors.bind(this));
      }
    }
    return arr;
  }

  cvEquals(r) {
    // For javascript rules, we test their correctness elsewhere (namely, checkVarEquals)
    // As such, they are already aware of their passing state, and we can just no-op
    return r.passing;
  }

  cvFunc(r) {
    return r.passing;
  }

  cvMatch(rule, haystack) {
    return haystack.search(new RegExp(rule.regex)) >= 0;
  }

  cvUses(rule, haystack) {
    const res = [];
    res.while = new RegExp("while\\s*\\([^\\)]*\\)\\s*{[^}]*}", "g");
    res.for = new RegExp("for\\s*\\([^\\)]*;[^\\)]*;[^\\)]*\\)\\s*{[^}]*}", "g");
    res.if = new RegExp("if\\s*\\([^\\)]*\\)\\s*{[^}]*}[\\n\\s]*else\\s*{[^}]*}", "g");
    return res[rule.needle] && haystack.search(res[rule.needle]) >= 0;
  }

  checkForErrors() {
    const theText = this.state.currentText;
    const theJS = this.state.currentJS;
    const theJSON = himalaya.parse(theText);
    const {baseRules, rulejson} = this.state;
    let errors = 0;
    const cv = [];
    cv.CONTAINS = cvContainsTag;
    cv.CONTAINS_ONE = cvContainsOne;
    cv.CSS_CONTAINS = cvContainsStyle;
    cv.CONTAINS_SELF_CLOSE = cvContainsSelfClosingTag;
    cv.NESTS = cvNests;
    cv.JS_VAR_EQUALS = this.cvEquals.bind(this);
    cv.JS_FUNC_EQUALS = this.cvFunc.bind(this);
    cv.JS_MATCHES = this.cvMatch.bind(this);
    cv.JS_USES = this.cvUses.bind(this);
    let payload = theText;
    for (const r of baseRules) {
      if (r.type === "CSS_CONTAINS") payload = theJSON;
      if (r.type === "JS_MATCHES" || r.type === "JS_USES") payload = theJS;
      if (cv[r.type]) r.passing = cv[r.type](r, payload);
      if (!r.passing) errors++;
    }
    for (const r of rulejson) {
      if (r.type === "CSS_CONTAINS") payload = theJSON;
      if (r.type === "JS_MATCHES" || r.type === "JS_USES") payload = theJS;
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

  writeToIFrame(theText) {
    /*if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(theText);
      doc.close();
    }*/
    if (this.refs.rc) {
      this.refs.rc.contentWindow.postMessage(theText, "https://sandbox.codelife.com");
    }
  }

  renderText() {
    if (this.refs.rc) {
      let theText = this.state.currentText;
      if (theText.includes("script")) {
        const oldJSON = himalaya.parse(this.state.currentText);
        const newJSON = this.stripJS(oldJSON);
        theText = toHTML(newJSON);
      }
      this.checkForErrors();
      this.writeToIFrame(theText);
    }
  }

  getErrorForRule(rule) {
    const thisRule = this.state.ruleErrors.find(r => r.type === rule.type);
    if (thisRule && thisRule.error_msg) {
      const param1 = rule.needle;
      let param2 = null;
      if (rule.property !== undefined) param2 = rule.property;
      if (rule.outer !== undefined) param2 = rule.outer;
      if (rule.argType !== undefined) param2 = rule.argType;
      if (rule.varType !== undefined) param2 = rule.varType;
      const param3 = rule.value;
      if (param3) return thisRule.error_msg_3.replace("{{p1}}", param1).replace("{{p2}}", param2).replace("{{p3}}", param3);
      if (param2) return thisRule.error_msg_2.replace("{{p1}}", param1).replace("{{p2}}", param2);
      return thisRule.error_msg.replace("{{p1}}", param1);
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

  myPost() {
    const type = arguments[0];
    if (type === "console") {
      this.myLog(arguments[1]);
    }
    else if (type === "catch") {
      this.myCatch(arguments[1]);
    }
    else if (type === "rule") {
      this.checkJVMState(arguments[1], arguments[2]);
    }
    this.checkForErrors();
  }

  checkJVMState(needle, value) {
    const {rulejson} = this.state;
    for (const r of rulejson) {
      if (r.needle === needle) {
        let rType = null;
        if (r.type === "JS_FUNC_EQUALS") rType = r.argType;
        if (r.type === "JS_VAR_EQUALS") rType = r.varType;
        const rVal = r.value;
        if (rType && rVal) {
          r.passing = typeof value === rType && value == rVal;
        }
        else if (rType && !rVal) {
          r.passing = typeof value === rType;
        }
        else if (!rType && !rVal && r.type === "JS_VAR_EQUALS") {
          r.passing = typeof value !== undefined;
        }
      }
    }
  }

  reverse(s) { 
    return s.split("").reverse().join("");
  }

  internalRender() {

    if (this.state.currentJS) {

      let js = this.state.currentJS.split("console.log(").join("parent.myPost(\"console\",");

      const handled = [];

      for (const r of this.state.rulejson) {
        if (r.type === "JS_VAR_EQUALS") {
          r.passing = false;
          if (!handled.includes(r.needle)) {
            js = `${r.needle}=undefined;\n${js}`;
            js += `parent.myPost('rule', '${r.needle}', ${r.needle});\n`;
            handled.push(r.needle);
          }
        }
        else if (r.type === "JS_FUNC_EQUALS") {
          const re = new RegExp(`\\)\\s*([^(]*?)\\s*\\(${this.reverse(r.needle)}(?!\\s*noitcnuf)`, "g");
          let result = re.exec(this.reverse(js));
          if (result) result = result.map(this.reverse);
          r.passing = result !== null;
          const arg = result ? result[1] : null;
          js += `parent.myPost('rule', '${r.needle}', ${arg});\n`; 
        }
      }

      const finaljs = `
        var js=${JSON.stringify(js.replace(/(?:\r\n|\r|\n)/g, ""))};
        try {
          eval(js);
        }
        catch (e) {
          parent.myPost("catch", e);
        }
      `;

      const theText = this.state.currentText.replace(this.state.currentJS, finaljs);

      this.writeToIFrame(theText);
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
        { 
          this.props.showEditor
            ? <div className="code">
              <div className="panel-title"><span className="favicon pt-icon-standard pt-icon-code"></span>{ codeTitle || "Code" }</div>
              { 
                !this.props.blurred
                  ? <AceWrapper
                    className="editor"
                    ref={ comp => this.editor = comp }
                    onChange={this.onChangeText.bind(this)}
                    value={currentText}
                    {...this.props}
                  />
                  : <pre className="editor blurry-text">{currentText}</pre>
              }
              { 
                this.props.blurred 
                  ? <div className={ `codeBlockTooltip pt-popover pt-tooltip ${ island ? island : "" }` }>
                    <div className="pt-popover-content">
                      { t("Codeblock's code will be shown after you complete the last level of this island.") }
                    </div>
                  </div> 
                  : null 
              }
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
          <iframe className="iframe" id="iframe" ref="rc" src="https://sandbox.codelife.com/page_local.html"/>
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
