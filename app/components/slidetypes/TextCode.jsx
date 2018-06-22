import React, {Component} from "react";
import AceWrapper from "components/AceWrapper";

/**
 * TextCode is text-left, code right. This is different from RenderCode in that 
 * The HTML page itself is not rendered - only the raw code is shown as an example
 */

export default class TextCode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: ""
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  render() {

    const {htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="slide-content" className="slide-content textCode flex-row">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        { this.state.mounted ? <AceWrapper className="slide-editor panel-content" ref={ comp => this.editor = comp } mode="html" showGutter={false} readOnly={true} value={ htmlcontent2 } setOptions={{behavioursEnabled: false}}/> : <div className="slide-editor panel-content"></div> }
      </div>
    );
  }
}
