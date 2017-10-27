import React, {Component} from "react";

export default class AceWrapper extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/html");
      require("brace/theme/idle_fingers");
      return <Ace theme="idle_fingers" width="auto" height="auto"
        ref={editor => this.editor = editor}
        showGutter={false} 
        wrapEnabled={false}
        tabSize = {2}
        mode="html" 
        setOptions={{behavioursEnabled: false}}
        editorProps={{
          $blockScrolling: Infinity
        }}
        {...this.props} />;
    }
    return null;
  }
}
