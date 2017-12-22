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
      firstInput: false,
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

    document.addEventListener("keypress", this.handleKey.bind(this));
  }

  changeField(field, e) {
    const {words, firstInput} = this.state;
    const word = words.find(w => w.id.toString() === e.target.id);
    if (word && firstInput) {
      word[field] = e.target.value;
      word.touched = true;
    }
    this.setState({words});
  }

  handleEditor(id, field, t) {
    const {words, firstInput} = this.state;
    const word = words.find(w => w.id.toString() === id);
    if (word && firstInput) {
      word[field] = t;
      word.touched = true;
    }
    this.setState({words});
  }

  handleKey() {
    if (!this.state.firstInput) {
      this.setState({firstInput: true});
    }
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

  render() {

    const {words} = this.state;

    if (!words) return <Loading />;

    const wordItems = words.map(w => <div key={w.id} className={`word ${w.touched ? "touched" : ""}`}>
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
        <button id={w.id} className="pt-button pt-intent-danger glossary-button" onClick={this.deleteWord.bind(this)}>Delete</button>
      </div>
    </div>);


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