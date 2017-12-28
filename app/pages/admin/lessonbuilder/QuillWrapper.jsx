import React, {Component} from "react";
import classnames from "classnames";
import {Suggest} from "@blueprintjs/labs";
import {MenuItem, Classes} from "@blueprintjs/core";
import {connect} from "react-redux";

import "./QuillWrapper.css";

class QuillWrapper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      words: null,
      currentWord: null,
      currentRange: 0
    };
  }

  componentDidMount() {
    if (this.props.glossary) this.setState({words: this.props.glossary.map(w => Object.assign({}, w))});
  }

  handleValueChange(currentWord) {
    this.setState({currentWord});
  }

  handleGlossaryClick() {
    const {currentRange, currentWord} = this.state;
    if (currentRange && currentWord) {
      this.quillRef.editor.insertText(currentRange.index, ` {{${currentWord.word}}} `);
    }
  }

  renderWord({handleClick, isActive, item}) {
    const classes = classnames({
      [Classes.ACTIVE]: isActive,
      [Classes.INTENT_PRIMARY]: isActive
    });
    return (
      <MenuItem
        className={classes}
        label={`${item.definition.substring(0, 10)}...`}
        key={item.id}
        onClick={handleClick}
        text={item.word}
      />
    );
  }

  filterWords(query, word, index) {
    return `${index + 1}. ${word.word.toLowerCase()} ${word.definition}`.indexOf(query.toLowerCase()) >= 0;
  }

  render() {
    if (typeof window !== "undefined" && this.state.words) {
      const Quill = require("react-quill");
      require("react-quill/dist/quill.snow.css");
      const modules = {
        toolbar: {
          container: [
            ["bold", "italic", "underline", "code", "blockquote", "code-block", "link"],
            [{list: "ordered"}, {list: "bullet"}],
            ["clean"]
          ]

          /* ,
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
          onChangeSelection={range => range ? this.setState({currentRange: range}) : null}
          ref={c => this.quillRef = c}
          {...this.props}
        />
        <div>
          <Suggest 
            id="search-box"
            inputValueRenderer={word => word.word}
            items={this.state.words}
            itemRenderer={this.renderWord.bind(this)}
            itemPredicate={this.filterWords.bind(this)}
            noResults={<MenuItem disabled={true} text="No results." />}
            onItemSelect={word => this.setState({currentWord: word})}
          />
          <div 
            id="insert-word"
            onClick={this.handleGlossaryClick.bind(this)}
          > 
            Insert Glossary Word <span className="pt-icon pt-icon-circle-arrow-up" />
          </div>
        </div>
      </div>;
    }
    return null;
  }
}


const mapStateToProps = state => ({
  glossary: state.glossary
});

QuillWrapper = connect(mapStateToProps)(QuillWrapper);
export default QuillWrapper;
