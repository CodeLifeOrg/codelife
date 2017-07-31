import React, {Component} from "react";
import AceWrapper from "components/AceWrapper";
import himalaya from "himalaya";

export default class RenderCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      titleText: ""
    };
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  setTitleText() {
    const content = himalaya.parse(this.state.currentText);
    let head, html, title = null;
    let titleText = "";
    if (content) html = content.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) title = head.children.find(e => e.tagName === "title");
    if (title && title.children[0]) titleText = title.children[0].content;
    this.setState({titleText});
  }

  renderText() {
    if (this.refs.rf) {
      const doc = this.refs.rf.contentWindow.document;
      doc.open();
      doc.write(this.props.htmlcontent2);
      doc.close();
    }
  }

  componentDidMount() {
    this.setState({mounted: true, currentText: this.props.htmlcontent2}, this.renderText.bind(this));
  }

  componentDidUpdate() {
    if (this.state.currentText !== this.props.htmlcontent2) {
      this.setState({mounted: true, currentText: this.props.htmlcontent2}, this.renderText.bind(this));
    }
  }

  render() {

    const {htmlcontent1, htmlcontent2} = this.props;
    const {titleText} = this.state;

    return (
      <div id="slide-container" className="renderCode flex-column">
        <div className="title-tab">{titleText}</div>
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <AceWrapper className="slide-editor" ref={ comp => this.editor = comp } mode="html" readOnly={true} showGutter={false} value={htmlcontent2} setOptions={{behavioursEnabled: false}}/> : <div className="slide-editor"></div> }
          <iframe className="slide-render" ref="rf" />
        </div>
      </div>
    );
  }
}
