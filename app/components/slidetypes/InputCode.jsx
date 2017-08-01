import React, {Component} from "react";
import himalaya from "himalaya";

import CodeEditor from "components/CodeEditor";

export default class InputCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      checkerResult: false,
      titleText: "",
      baseText: ""
    };
  }

  componentDidMount() {
    this.setState({mounted: true, baseText: this.props.htmlcontent2 ? this.props.htmlcontent2 : ""});
  }

  componentDidUpdate() {
    const newText = this.props.htmlcontent2 ? this.props.htmlcontent2 : "";
    if (this.state.baseText !== newText) {
      this.setState({baseText: newText, checkerResult: false});
      this.editor.setEntireContents(newText);
    }
  }

  submitAnswer() {
    const contents = this.editor.getEntireContents();
    const jsonArray = himalaya.parse(contents);
    let checkerText = "";
    const rulejson = JSON.parse(this.props.rulejson);
    for (const r of rulejson) {
      if (r.type === "CONTAINS" && r.needle.substring(0, 1) !== "/") {
        if (!this.containsTag(r.needle, jsonArray)) {
          checkerText += `${r.error_msg}\n`;
        }
      }
    }
    // todo: make this more resilient lol
    if (checkerText === "") {
      checkerText = true;
      this.props.unblock();
    }
    this.setState({checkerResult: checkerText});
  }

  containsTag(needle, haystack) {
    return this.tagCount(needle, haystack) > 0;
  }

  tagCount(needle, haystack) {
    let count = 0;
    for (const h of haystack) {
      if (h.type === "Element") {
        if (h.tagName === needle) {
          count++;
        } if (h.children !== null) {
          count += this.tagCount(needle, h.children);
        }
      }
    }
    return count;
  }

  // TODO: sanitize htmlcontent to not be null so I don't have to do these tests
  resetAnswer() {
    this.editor.setEntireContents(this.props.htmlcontent2 ? this.props.htmlcontent2 : "");
  }

  render() {

    const {htmlcontent1, htmlcontent2} = this.props;
    const {checkerResult, titleText} = this.state;

    const initialContent = htmlcontent2 ? htmlcontent2 : "";

    return (
      <div id="slide-container" className="renderCode flex-column">
        <div className="title-tab">{titleText}</div>
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <CodeEditor className="slide-editor" ref={c => this.editor = c} initialValue={initialContent} /> : <div className="slide-editor"></div> }
        </div>
        <div className="validation">
          { checkerResult === false
          ? <div className="pt-callout">Press Submit to submit your answer</div>
          : checkerResult === true
          ? <div className="pt-callout pt-intent-success">You got it right!</div>
          : <div className="pt-callout pt-intent-warning">{ checkerResult }</div> }
          <button className="pt-button" onClick={this.resetAnswer.bind(this)}>Reset</button>
          <button className="pt-button pt-intent-success" onClick={this.submitAnswer.bind(this)}>Submit</button>
        </div>
      </div>
    );
  }
}
