import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button} from "@blueprintjs/core";
import LoadingSpinner from "components/LoadingSpinner";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import "./GlossaryBuilder.css";

class GlossaryBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      words: []
    };
  }

  componentDidMount() {
    axios.get("/api/builder/glossary/all").then(resp => {
      if (resp.status === 200) {
        const words = resp.data;
        this.setState({words});
      }
      else {
        console.log("error");
      }
    });
  }

  changeField(field, e) {
    const {words} = this.state;
    const word = words.find(w => w.id.toString() === e.target.dataset.id);
    if (word) {
      word[field] = e.target.value;
      word.touched = true;
    }
    this.setState({words});
  }

  handleEditor(id, field, t) {
    const {words} = this.state;
    const word = words.find(w => w.id.toString() === id);
    if (word) {
      word[field] = t;
      word.touched = true;
    }
    this.setState({words});
  }

  addWord() {
    const payload = {
      word: "New Term",
      definition: "New Definition",
      pt_word: "Nuevo Palavra",
      pt_definition: "Neuvo Definition"
    };
    axios.post("/api/builder/glossary/new", payload).then(resp => {
      if (resp.status === 200) {
        const newWord = resp.data;
        const words = this.state.words.concat(newWord);
        this.setState({words});
      }
      else {
        console.log("error");
      }
    });
  }

  saveWord(e) {
    const {words} = this.state;
    const word = words.find(w => w.id.toString() === e.target.dataset.id);
    if (word) {
      const payload = {
        id: word.id,
        word: word.word,
        definition: word.definition,
        pt_word: word.pt_word,
        pt_definition: word.pt_definition
      };
      axios.post("/api/builder/glossary/save", payload).then(resp => {
        resp.status === 200 ? console.log("success") : console.log("error");
      });
      word.touched = false;
      this.setState({words});
    }

  }

  deleteWord(e) {
    const id = e.target.dataset.id;
    const payload = {
      params: {id}
    };
    axios.delete("/api/builder/glossary/delete", payload).then(resp => {
      if (resp.status === 200) {
        const words = this.state.words.filter(w => w.id.toString() !== id);
        this.setState({words});
      }
      else {
        console.log("error");
      }
    });
  }

  cancelWord(e) {
    console.log(e.target.dataset.id);
    let {words} = this.state;
    words = words.map(w => {
      if (w.id.toString() === e.target.dataset.id) {
        w = Object.assign({}, w.initialState);
        w.touched = false;
        w.initialState = undefined;
        return w;
      }
      else {
        return w;
      }
    });
    this.setState({words});
  }

  editWord(e) {
    const {words} = this.state;
    const word = words.find(w => w.id.toString() === e.target.dataset.id);
    if (word) {
      word.touched = true;
      // To allow for canceling edits, capture the initial state for potential reset later.
      word.initialState = Object.assign({}, word);
      this.setState({words});
    }
  }

  render() {
    const {t} = this.props;
    const {words} = this.state;

    if (!words) return <LoadingSpinner />;

    const terms = words.map(w =>
      w.touched
        // editing
        ? <div key={w.id} className="term-container is-editing">

          {/* English term & definition */}
          <div className="term-column">
            <h2 className="font-md u-margin-top-off">English term</h2>
            <div className="field-container">
              <input
                className="term-input"
                id={w.id}
                onChange={this.changeField.bind(this, "word")}
                type="text"
                placeholder="Term"
                value={w.word} />
            </div>
            <QuillWrapper
              className="definition-box u-margin-top-sm"
              id={w.id.toString()}
              value={w.definition}
              onChange={this.handleEditor.bind(this, w.id.toString(), "definition")} />
          </div>

          {/* Portuguese term & definition */}
          <div className="term-column">
            <h2 className="font-md u-margin-top-off">Portuguese translation</h2>
            <div className="field-container">
              <input
                className="term-input"
                id={w.id}
                onChange={this.changeField.bind(this, "pt_word")}
                type="text"
                placeholder="Palavra"
                value={w.pt_word} />
            </div>
            <QuillWrapper
              className="definition-box u-margin-top-sm"
              id={w.id.toString()}
              value={w.pt_definition}
              onChange={this.handleEditor.bind(this, w.id.toString(), "pt_definition")}
            />
          </div>

          <div className="actions-container u-text-center u-margin-top-md">
            <button data-id={w.id} className="button danger-button" onClick={this.deleteWord.bind(this)}>
              <span data-id={w.id} className="pt-icon pt-icon-trash" />
              <span data-id={w.id} className="u-hide-below-md">delete word</span>
            </button>
            <button data-id={w.id} className="button success" onClick={this.saveWord.bind(this)}>
              <span data-id={w.id} className="pt-icon pt-icon-tick" />
              <span data-id={w.id} className="u-hide-below-md">save changes</span>
            </button>
          </div>

          <div className="term-mode">
            <button data-id={w.id} className="mode-toggle-button u-unbutton font-lg u-margin-top-xs" onClick={this.cancelWord.bind(this)}>
              <span data-id={w.id} className="u-visually-hidden">{t("Cancel")}</span>
              <span data-id={w.id} className="mode-toggle-icon pt-icon pt-icon-cross" />
            </button>
          </div>
        </div>
        // not editing
        : <div key={w.id} className="term-container">
          <h2 className="term-input font-lg u-margin-top-off u-margin-bottom-xxs" id={w.id.toString()}>
            { w.word === w.pt_word ? w.word : `${w.word} / ${w.pt_word}`}
          </h2>
          <div className="term-column" id={w.id.toString()} dangerouslySetInnerHTML={{__html: w.definition}} />
          <div className="term-column" id={w.id.toString()} dangerouslySetInnerHTML={{__html: w.pt_definition}} />
          <div className="term-mode">
            <button data-id={w.id} className="mode-toggle-button u-unbutton font-lg u-margin-top-xs" onClick={this.editWord.bind(this)}>
              <span data-id={w.id} className="u-visually-hidden">{t("Edit")}</span>
              <span data-id={w.id} className="mode-toggle-icon pt-icon pt-icon-cog" />
            </button>
          </div>
        </div>
    );


    return (
      <div className="admin-glossary">
        <h1 className="u-text-center u-margin-bottom-sm">{t("Glossary Builder")}</h1>
        {terms}
        <button className="button font-md u-fullwidth u-margin-bottom-off" onClick={this.addWord.bind(this)}>Add Word</button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  glossary: state.glossary
});

GlossaryBuilder = connect(mapStateToProps)(GlossaryBuilder);
GlossaryBuilder = translate()(GlossaryBuilder);
export default translate()(GlossaryBuilder);
