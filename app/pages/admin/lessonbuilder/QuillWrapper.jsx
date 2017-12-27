import React, {Component} from "react";
import classnames from "classnames";
import {Suggest} from "@blueprintjs/labs";
import {MenuItem, Classes} from "@blueprintjs/core";

import "./QuillWrapper.css";

export default class QuillWrapper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      words: [
        {
          word: "aword1",
          definition: "def1"
        },
        {
          word: "bword2",
          definition: "def2"
        },
        {
          word: "cword3",
          definition: "def3"
        }
      ],
      currentWord: null,
      currentRange: 0
    };
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
        label={`${item.definition}...`}
        key={item.id}
        onClick={handleClick}
        text={item.word}
      />
    );
  }

  filterWords(query, film, index) {
    return `${index + 1}. ${film.word.toLowerCase()} ${film.definition}`.indexOf(query.toLowerCase()) >= 0;
  }

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
