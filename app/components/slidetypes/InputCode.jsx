import React, {Component} from "react";
import himalaya from "himalaya";

import AceWrapper from "components/AceWrapper";

export default class InputCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      checkerResult: false,
      titleText: ""
    };
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  submitAnswer() {
    const jsonArray = himalaya.parse(this.getEditor().getValue());
    let checkerText = "";
    const rulejson = JSON.parse(this.props.rulejson);
    for (const r of rulejson) {
      if (r.type === "CONTAINS") {
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

  resetAnswer() {
    let initText = "";
    if (this.props.htmlcontent2) initText = this.props.htmlcontent2;
    this.setState({currentText: initText}, this.renderText.bind(this));
  }

  setTitleText() {
    const content = himalaya.parse(this.state.currentText);
    let head, title = null;
    let titleText = "";
    const html = content.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) title = head.children.find(e => e.tagName === "title");
    if (title) titleText = title.children[0].content;
    this.setState({titleText});
  }

  renderText() {
    if (this.refs.rf) {
      const doc = this.refs.rf.contentWindow.document;
      doc.open();
      doc.write(this.state.currentText);
      doc.close();
    }
    this.setTitleText();
  }

  onChangeText(theText) {
    this.setState({currentText: theText}, this.renderText.bind(this));
  }

  componentDidMount() {
    let initText = "";
    if (this.props.htmlcontent2) initText = this.props.htmlcontent2;
    this.setState({mounted: true, currentText: initText}, this.renderText.bind(this));
  }

  render() {

    const {htmlcontent1} = this.props;
    const {checkerResult, titleText} = this.state;

    return (
      <div id="slide-container" className="renderCode flex-column">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div className="title-tab">{titleText}</div>
        <div className="flex-row">
          { this.state.mounted ? <AceWrapper className="slide-editor" ref={ comp => this.editor = comp } onChange={this.onChangeText.bind(this)} mode="html" showGutter={false} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : <div className="slide-editor"></div> }
          <iframe className="slide-render" ref="rf" />
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
