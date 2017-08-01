import React, {Component} from "react";
import himalaya from "himalaya";

import AceWrapper from "components/AceWrapper";
import Loading from "components/Loading";

import "./CodeEditor.css";

class CodeEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      changesMade: false,
      titleText: ""
    };
  }

  componentDidMount() {
    let init = "";
    if (this.props.initialValue) init = this.props.initialValue;
    const titleText = this.getTitleText(init);
    this.setState({mounted: true, currentText: init, titleText}, this.renderText.bind(this));
    if (this.props.onChangeText) this.props.onChangeText(this.props.initialValue);
  }

  getEditor() {
    if (this.editor) return this.editor.editor.editor;
    return undefined;
  }

  getTitleText(theText) {
    const content = himalaya.parse(theText);
    let head, html, title = null;
    let titleText = "";
    if (content) html = content.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) title = head.children.find(e => e.tagName === "title");
    if (title && title.children[0]) titleText = title.children[0].content;
    return titleText;
  }

  renderText() {
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.state.currentText);
      doc.close();
    }
  }

  onChangeText(theText) {
    const titleText = this.getTitleText(theText);
    this.setState({currentText: theText, changesMade: true, titleText}, this.renderText.bind(this));
    if (this.props.onChangeText) this.props.onChangeText(theText);
  }

  /* External Functions for Parent Component to Call */

  setEntireContents(theText) {
    this.setState({currentText: theText, changesMade: false}, this.renderText.bind(this));
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
    this.setState({currentText: this.getEditor().getValue(), changesMade: true}, this.renderText.bind(this));
  }

  getEntireContents() {
    return this.state.currentText;
  }

  changesMade() {
    return this.state.changesMade;
  }

  setChangeStatus(changesMade) {
    this.setState({changesMade});
  }

  /* End of external functions */

  render() {

    const {island} = this.props;
    const {titleText, currentText} = this.state;

    if (!this.state.mounted) return <Loading />;

    return (
      <div id="codeEditor">
        <div className="code">
          <div className="title"><span className="favicon pt-icon-standard pt-icon-code-block"></span>Code</div>
            { !this.props.preventSelection
              ? <AceWrapper
                className="editor"
                ref={ comp => this.editor = comp }
                onChange={this.onChangeText.bind(this)}
                value={currentText}
                {...this.props}
              />
            : <pre className="editor blurry-text">{currentText}</pre> }
        </div>
        <div className="render">
          <div className="title"><img className="favicon" src={ `/islands/${island}-small.png` } />{ titleText || "Webpage" }</div>
          <iframe className="iframe" ref="rc" />
        </div>
      </div>
    );
  }
}

CodeEditor.defaultProps = {
  island: "island-1"
};

export default CodeEditor;
