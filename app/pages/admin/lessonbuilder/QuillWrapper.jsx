import React, {Component} from "react";

import "./QuillWrapper.css";

export default class QuillWrapper extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Quill = require("react-quill");
      require("react-quill/dist/quill.snow.css");
      const modules = {
        toolbar: {
          container: [
            [{}],
            ["bold", "italic", "underline", "code", "blockquote", "code-block", "link"],
            [{list: "ordered"}, {list: "bullet"}],
            ["clean"]
          ]/*,
          handlers: {
            custom: () => {
              console.log("hi");
              const range = this.quillRef.editor.getSelection();
              if (range) {
                this.quillRef.editor.insertText(range.index, "Ω");
              }
            }
          }*/
        },
        clipboard: {
          matchVisual: false
        }
      };
      return <div>
        <Quill
          theme="snow"
          modules={modules}
          ref={c => this.quillRef = c}
          {...this.props}
        />
      </div>;
    }
    return null;
  }
}
