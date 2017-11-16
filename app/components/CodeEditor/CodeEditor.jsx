import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import himalaya from "himalaya";
import {toHTML} from "himalaya/translate";
import {translate} from "react-i18next";
import {Intent, ProgressBar} from "@blueprintjs/core";

import AceWrapper from "components/AceWrapper";

import {cvMatch, cvUses, cvNests, cvContainsOne, cvContainsTag, cvContainsStyle, cvContainsSelfClosingTag} from "utils/codeValidation.js";

import DrawerValidation from "./DrawerValidation";

import "./CodeEditor.css";

class CodeEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      iFrameLoaded: false,
      currentText: "",
      initialContent: "",
      changesMade: false,
      baseRules: [],
      isPassing: false,
      hasJS: false,
      rulejson: [],
      ruleErrors: [],
      goodRatio: 0,
      intent: null,
      embeddedConsole: [],
      currentJS: "",
      jsRules: [],
      titleText: "",
      remoteReady: false,
      sandbox: {
        root: "https://codelife.tech",
        page: props.location.hostname === "localhost" ? `page_local.html?v=${new Date().getTime()}` : `page.html?v=${new Date().getTime()}`
      },
      openRules: false,
      openConsole: false
    };
    this.recRef = this.receiveMessage.bind(this);
    this.pingRemoteRef = this.pingRemote.bind(this);
  }

  componentWillUnmount() {
    if (window) window.removeEventListener("message", this.recRef, false);
  }

  componentDidMount() {
    if (window) window.addEventListener("message", this.recRef, false);
    this.ping = setInterval(this.pingRemoteRef, 50);
  }

  pingRemote() {
    if (this.refs.rc) this.refs.rc.contentWindow.postMessage("wakeup", this.state.sandbox.root);
  }

  componentDidUpdate(prevProps, prevState) {
    const {iFrameLoaded, initialContent, hasJS} = this.state;
    console.log(this.state.sandbox);
    
    if (this.props.setExecState) {
      if (!prevState.hasJS && hasJS) {
        this.props.setExecState(true);
      }
      else if (prevState.hasJS && !hasJS) {
        this.props.setExecState(false);
      }
    }

    const {initialValue} = this.props;
    if (iFrameLoaded && initialContent !== initialValue) {
      clearTimeout(this.myTimeout);
      this.setState({initialContent: initialValue, currentText: initialValue}, this.renderText.bind(this, true));
    }
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
      {type: "NESTS", needle: "title", outer: "head"}
    ];
    return baseRules;
  }

  getEditor() {
    if (this.editor) return this.editor.editor.editor;
    return undefined;
  }

  receiveMessage(event) {
    if (event.origin !== this.state.sandbox.root) {
      return;
    }
    else {
      if (event.data === "awake") {
        clearInterval(this.ping);
        this.iFrameLoaded.bind(this)();
      }
      else {
        this.handlePost.bind(this)(...event.data);
      }

    }
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
        console.log("in");
        if (n.children && n.children[0] && n.children[0].content) {
          const js = n.children[0].content;
          const stripped = js.replace(/\n/g, "").replace(/\s/g, "");
          if (stripped.length > 0) {
            this.setState({currentJS: js}, this.checkForErrors.bind(this));
          } 
          else {
            this.checkForErrors.bind(this)();
          }
        }
        else {
          this.checkForErrors.bind(this)();
        }
      }
    }
    return arr;
  }

  /* 
    For javascript rules, we test their correctness elsewhere (namely, checkJVMState)
    As such, they are already aware of their passing state, and we can just no-op
  */

  cvEquals(r) {
    return r.passing;
  }

  cvFunc(r) {
    return r.passing;
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
    cv.JS_MATCHES = cvMatch;
    cv.JS_USES = cvUses;
    cv.JS_VAR_EQUALS = this.cvEquals.bind(this);
    cv.JS_FUNC_EQUALS = this.cvFunc.bind(this);
    const payload = {theText, theJS, theJSON};
    for (const r of baseRules) {
      if (cv[r.type]) r.passing = cv[r.type](r, payload);
      if (!r.passing) errors++;
    }
    for (const r of rulejson) {
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
    if (this.state.iFrameLoaded) {
      this.refs.rc.contentWindow.postMessage(theText, this.state.sandbox.root);
    }
  }

  hasJS(theText) {
    const re = new RegExp(`<script[^>]*>`, "g");
    const open = theText.search(re);
    const close = theText.indexOf("</script>");
    return open !== -1 && close !== -1 && open < close;
  }

  renderText(executeJS) {
    if (this.refs.rc) {
      let theText = this.state.currentText;
      if (this.hasJS(theText)) {
        this.setState({hasJS: true});
        const oldJSON = himalaya.parse(this.state.currentText);
        const newJSON = this.stripJS.bind(this)(oldJSON);
        theText = toHTML(newJSON);
      }
      else {
        this.setState({currentJS: "", hasJS: false});
        this.checkForErrors.bind(this)();
      }
      this.writeToIFrame.bind(this)(theText);

      if (executeJS) {
        this.myTimeout = setTimeout(this.executeCode.bind(this), 1000);
      }
    }
  }

  iFrameLoaded() {
    if (!this.state.iFrameLoaded) {

      axios.get("/api/rules").then(resp => {
        const ruleErrors = resp.data;
        const currentText = this.props.initialValue || "";
        const rulejson = this.props.rulejson || [];
        const titleText = this.getTitleText(currentText);
        const baseRules = this.props.lax ? [] : this.getBaseRules();
        this.setState({mounted: true, iFrameLoaded: true, currentText, baseRules, rulejson, ruleErrors, titleText});
        if (this.props.onChangeText) this.props.onChangeText(this.props.initialValue);
      });
    }
  }

  onChangeText(theText) {
    const titleText = this.getTitleText(theText);
    this.setState({currentText: theText, changesMade: true, titleText}, this.renderText.bind(this));
    if (this.props.onChangeText) this.props.onChangeText(theText);
  }

  /*
  This function may be used later - it grabs the contents of your current cursor selection
  
  showContextMenu(selectionObject) {
    const text = selectionObject.toString();
  }
  */

  myCatch(e) {
    const {embeddedConsole} = this.state;
    embeddedConsole.push([e]);
    this.setState({openConsole: true});
  }

  myLog() {
    const {embeddedConsole} = this.state;
    embeddedConsole.push(Array.from(arguments));
    this.setState({openConsole: true});
  }

  evalType(value) {
    let t = typeof value;
    if (t === "object") {
      if (["Array"].includes(value.constructor.name)) t = "array";
      else if (["Error", "EvalError", "ReferenceError", "SyntaxError"].includes(value.constructor.name)) t = "error";
    }
    return t;
  }

  handlePost() {
    const type = arguments[0];
    if (type === "console") {
      this.myLog.bind(this)(arguments[1]);
    }
    else if (type === "catch") {
      this.myCatch.bind(this)(arguments[1]);
    }
    else if (type === "rule") {
      this.checkJVMState.bind(this)(arguments[1], arguments[2]);
    }
    else if (type === "completed") {
      this.checkForErrors.bind(this)();
    }
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
            let init = r.needle;
            if (init.includes(".")) init = init.split(".")[0];
            js = `${init}=undefined;\n${js}`;
            js += `parent.myPost('rule', '${r.needle}', ${r.needle});\n`;
            handled.push(r.needle);
          }
        }
        else if (r.type === "JS_FUNC_EQUALS") {
          let result;

          /* To make the console report out to the parent, I've replaced all console.logs with parent.myPost (see above)
          Therefore, a rule search for console.log will fail (because I've removed them).  We therefore have to add the
          following exception to check for my special myPost as opposed to the console.log provided by the rule */
          if (r.needle === "console.log") {
            const re = new RegExp("parent\\.myPost\\(\"console\"\\,\\s*([^)]*)", "g");
            result = re.exec(js);
          }
          else {
            const re = new RegExp(`\\)\\s*([^(]*?)\\s*\\(${this.reverse(r.needle)}(?!\\s*noitcnuf)`, "g");
            result = re.exec(this.reverse(js));
            if (result) result = result.map(this.reverse);
          }
          r.passing = result !== null;
          const arg = result ? result[1] : null;
          js += `parent.myPost('rule', '${r.needle}', ${arg});\n`;
        }
      }

      js += "parent.myPost('completed');\n";

      const finaljs = `
        var js=${JSON.stringify(js)};
        var protected = parent.loopProtect(js);
        try {
          eval(protected);
        }
        catch (e) {
          parent.myPost("catch", e);
          parent.myPost("completed");
        }
      `;

      const theText = this.state.currentText.replace(this.state.currentJS, finaljs);

      this.writeToIFrame.bind(this)(theText);
    }
  }

  /* External Functions for Parent Component to Call */

  /* Additional Note on calling these external functions:
    - CodeEditor is wrapped in two classes, connect (redux) and translate (i18n).  See bottom of file.
    - This wrapping has the side effect of hiding public methods, such as the ones below.
    - The solution to this is to provide the withRef:true flag, which exposes the component via getWrappedInstance()
    - Because we are wrapping it twice, we have to call the wrap method twice to access these public methods.
    - This is why you see this.editor.getWrappedInstance().getWrappedInstance().method() in several other files.
  */

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
    const {codeTitle, island, readOnly, t} = this.props;
    const {baseRules, titleText, currentText, embeddedConsole, goodRatio, intent, openConsole, openRules, rulejson, ruleErrors, sandbox} = this.state;

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

    return (
      <div id="codeEditor">
        {
          this.props.showEditor
            ? <div className={ `code ${readOnly ? "readOnly" : ""}` }>
              <div className="panel-title"><span className="favicon pt-icon-standard pt-icon-code"></span>{ codeTitle || (readOnly ? t("Code Example") : t("Code Editor")) }</div>
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
              { !readOnly
                ? <div className={ `drawer ${openRules ? "open" : ""}` }>
                  <div className="title" onClick={ this.toggleDrawer.bind(this, "openRules") }>
                    <ProgressBar className="pt-no-stripes" intent={intent} value={goodRatio}/>
                    <div className="completion" style={{width: `${ Math.round(goodRatio * 100) }%`}}>{ Math.round(goodRatio * 100) }%</div>
                  </div>
                  <DrawerValidation rules={ baseRules.concat(rulejson) } errors={ ruleErrors } />
                </div>
                : null }
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
          <iframe className="iframe" id="iframe" ref="rc" src={`${sandbox.root}/${sandbox.page}`} />
          <div className={ `drawer ${openConsole ? "open" : ""}` }>
            <div className="title" onClick={ this.toggleDrawer.bind(this, "openConsole") }><span className="pt-icon-standard pt-icon-application"></span>{ t("JavaScript Console") }</div>
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


CodeEditor = connect(state => ({
  location: state.location
}), null, null, {withRef: true})(CodeEditor);
CodeEditor = translate(undefined, {withRef: true})(CodeEditor);
export default CodeEditor;
