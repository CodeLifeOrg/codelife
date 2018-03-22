import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";
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
    const word = words.find(w => w.id.toString() === e.target.id);
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
    const word = words.find(w => w.id.toString() === e.target.id);
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
    const id = e.target.id;
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
    let {words} = this.state;
    words = words.map(w => {
      if (w.id.toString() === e.target.id) {
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
    const word = words.find(w => w.id.toString() === e.target.id);
    if (word) {
      word.touched = true;
      // To allow for canceling edits, capture the initial state for potential reset later.
      word.initialState = Object.assign({}, word);
      this.setState({words});  
    }
  }

  render() {

    const {words} = this.state;

    if (!words) return <Loading />;

    console.log(words);

    const wordItems = words.map(w => 
      w.touched 
        ? <div key={w.id} className={`word ${w.touched ? "touched" : ""}`}>
          <div className="word-container">
            <input 
              className="word-box" 
              id={w.id} 
              onChange={this.changeField.bind(this, "word")} 
              type="text" 
              placeholder="Term" 
              value={w.word} 
            />
            <QuillWrapper
              className="definition-box"
              id={w.id.toString()}
              value={w.definition}
              onChange={this.handleEditor.bind(this, w.id.toString(), "definition")} 
            />
          </div>
          <div className="word-container">
            <input 
              className="word-box" 
              id={w.id} 
              onChange={this.changeField.bind(this, "pt_word")} 
              type="text" 
              placeholder="Palavra" 
              value={w.pt_word} 
            />
            <QuillWrapper
              className="definition-box"
              id={w.id.toString()}
              value={w.pt_definition}
              onChange={this.handleEditor.bind(this, w.id.toString(), "pt_definition")} 
            />
          </div>
          <div className="action-box">
            <button id={w.id} className="pt-button pt-intent-success glossary-button" onClick={this.saveWord.bind(this)}>Save</button><br/>
            <button id={w.id} className="pt-button pt-intent-warning glossary-button" onClick={this.cancelWord.bind(this)}>Cancel</button><br/>
            <button id={w.id} className="pt-button pt-intent-danger glossary-button" onClick={this.deleteWord.bind(this)}>Delete</button><br/>
          </div>
        </div>
        : <div key={w.id} className={`word ${w.touched ? "touched" : ""}`}>
          <div className="word-container-readonly">
            <div className="word-box-readonly" id={w.id}>
              {w.word} 
            </div>
            <div 
              className="definition-box-readonly" 
              id={w.id.toString()}
              dangerouslySetInnerHTML={{__html: w.definition}}
            />
          </div>
          <div className="word-container-readonly">
            <div className="word-box-readonly" id={w.id}>
              {w.pt_word} 
            </div>
            <div 
              className="definition-box-readonly" 
              id={w.id.toString()}
              dangerouslySetInnerHTML={{__html: w.pt_definition}}
            />
          </div>
          <div className="action-box">
            <button id={w.id} className="pt-button pt-intent-warning glossary-button" onClick={this.editWord.bind(this)}>Edit</button>
          </div>
        </div>
    );


    return (
      <div id="GlossaryBuilder">
        {wordItems}
        <Button type="pt-button" onClick={this.addWord.bind(this)} className="pt-button pt-fill pt-large pt-intent-success">Add Word</Button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  glossary: state.glossary
});

GlossaryBuilder = connect(mapStateToProps)(GlossaryBuilder);
export default translate()(GlossaryBuilder);
