import React, {Component} from "react";
import AceWrapper from "components/AceWrapper";

export default class RenderCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: ""
    };
  }

  getEditor() {
    return this.editor.editor.editor;
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

  render() {

    const {htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="slide-container" className="renderCode flex-column">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div className="flex-row">
          { this.state.mounted ? <AceWrapper className="slide-editor" ref={ comp => this.editor = comp } mode="html" readOnly={true} showGutter={false} value={htmlcontent2} setOptions={{behavioursEnabled: false}}/> : <div className="slide-editor"></div> }
          <iframe className="slide-render" ref="rf" />
        </div>
      </div>
    );
  }
}
