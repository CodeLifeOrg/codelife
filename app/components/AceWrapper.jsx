import React, {Component} from "react";

export default class AceWrapper extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/html");
      require("brace/theme/kuroir");
      return <Ace theme="kuroir" width="auto" height="auto" ref={editor => this.editor = editor} {...this.props}/>;
    }
    return null;
  }
}
