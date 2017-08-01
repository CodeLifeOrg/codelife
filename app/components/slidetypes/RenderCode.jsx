import React, {Component} from "react";

import CodeEditor from "components/CodeEditor";
import Loading from "components/Loading";

export default class RenderCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      titleText: ""
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  componentDidUpdate() {
    if (this.editor.getEntireContents() !== this.props.htmlcontent2) {
      console.log("updated");
      this.editor.setEntireContents(this.props.htmlcontent2);
    }
  }

  render() {

    const {htmlcontent1} = this.props;
    const {titleText} = this.state;

    if (!this.state.mounted) return <Loading />;

    return (
      <div id="slide-container" className="renderCode flex-column">
        <div className="title-tab">{titleText}</div>
        <div className="flex-row">
          <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          { this.state.mounted ? <CodeEditor className="slide-editor" ref={c => this.editor = c} readOnly={true} /> : <div className="slide-editor"></div> }
        </div>
      </div>
    );
  }
}
