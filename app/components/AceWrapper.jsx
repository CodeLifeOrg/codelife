import React, {Component} from "react";

export default class AceWrapper extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/html");
      require("brace/theme/kuroir");
      return <Ace ref={editor => this.editor = editor} wrapEnabled={true} theme="kuroir" editorProps={{$blockScrolling: Infinity}} {...this.props}/>;
    }
    return null;
  }
}
