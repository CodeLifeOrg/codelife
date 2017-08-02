import React, {Component} from "react";

import CodeEditor from "components/CodeEditor";

export default class RenderCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  componentDidUpdate() {
    let content = "";
    if (this.props.htmlcontent2) content = this.props.htmlcontent2;
    if (this.editor.getEntireContents() !== content) {
      this.editor.setEntireContents(content);
    }
  }

  render() {

    const {htmlcontent1, htmlcontent2, island} = this.props;

    return (
      <div id="slide-container" className="renderCode flex-column">
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <CodeEditor island={island} initialValue={htmlcontent2} className="slide-editor" ref={c => this.editor = c} readOnly={true} /> : <div className="slide-editor"></div> }
        </div>
      </div>
    );
  }
}
