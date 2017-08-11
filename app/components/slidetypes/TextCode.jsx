import React, {Component} from "react";
import AceWrapper from "components/AceWrapper";

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
    const {updateGems} = this.props;
    updateGems(1);
  }

  render() {

    const {htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="slide-container" className="textCode flex-row">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        { this.state.mounted ? <AceWrapper className="slide-editor" ref={ comp => this.editor = comp } mode="html" showGutter={false} readOnly={true} value={ htmlcontent2 } setOptions={{behavioursEnabled: false}}/> : <div className="slide-editor"></div> }
      </div>
    );
  }
}
