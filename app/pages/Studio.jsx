import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import Nav from "components/Nav";
import Snippets from "components/Snippets";
import axios from "axios";
import "./Studio.css";

// Studio Page
// Test zone for inline code editing

class AceWrapper extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/html");
      require("brace/theme/monokai");
      return <Ace ref={editor => this.editor = editor} {...this.props}/>;
    }
    return null;
  }
}

class Studio extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      mounted: false, 
      gotUserFromDB: false, 
      currentText: "", 
      checkerResult: "", 
      rules: []
    };
  }

  getRules() { 
    axios.get("api/rules"); 
  }

  componentDidUpdate() {
    if (this.props.user && !this.state.gotUserFromDB) {
      this.setState({gotUserFromDB: true});
      axios.get(`api/projects/?user_id=${this.props.user.id}`).then(resp => {
        // todo: catch when htmlcontent is null
        this.setState({currentText: resp.data[0].htmlcontent});
        this.renderText();
      });
    }
  }

  componentDidMount() {
    axios.get("api/rules").then(resp => {
      this.setState({mounted: true, rules: resp.data});
    });
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  grabContents() {
    return this.state.currentText;
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
    this.setState({currentText: this.getEditor().getValue()});
    this.renderText();
  }

  renderText() {
    const doc = this.refs.rc.contentWindow.document;
    doc.open();
    doc.write(this.getEditor().getValue());
    doc.close();
  }

  onChangeText(theText) {
    this.setState({currentText: theText});
    this.renderText();
  }

  onClickItem(snippet) {
    this.insertTextAtCursor(snippet.htmlcontent);
  }

  saveCodeToDB() {
    axios.post("api/projects/save", {user_id: this.props.user.id, htmlcontent: this.state.currentText}).then (resp => {
      if (resp.status === 200) {
        alert("Saved to DB");
      } 
      else {
        alert("Error");
      }
    });
  }

  validateHTML() {
    const annotations = this.getEditor().getSession().getAnnotations();
    const validationText = {};
    validationText.info = "WARNINGS: \n\n";
    validationText.error = "ERRORS: \n\n";
    for (const a of annotations) {
      validationText[a.type] += `${a.text} \n\n`;
    }
    alert(`${validationText.info} ${validationText.error}`);
  }

  render() {
    
    const {t} = this.props;

    return (  
      <div>
        <h1>{ t("Studio") }</h1>
        <Snippets onCreateSnippet={this.grabContents.bind(this)} onChoose={this.onClickItem.bind(this)}/>
        <div id="container">
          <div id="acecontainer">
          {/* todo - the value prop of Editor is where we put code loaded from the database */}
          {/* or, alternatively, with a seeded template, to which the user can reset while editing */}
          { this.state.mounted ? <AceWrapper ref={ comp => this.editor = comp } mode="html" theme="monokai" onChange={this.onChangeText.bind(this)} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : null }
          <button className="button" onClick={this.saveCodeToDB.bind(this)}>SAVE</button>
          <button className="button" onClick={this.validateHTML.bind(this)}>VALIDATE</button>
          </div>
          <iframe id="rendercontainer" ref="rc" />
        </div>
        <div className="clear">
        <br/><br/>
          <Nav />
        </div>
      </div>
    );
  }
}

Studio = connect(state => ({
  user: state.auth.user
}))(Studio);
Studio = translate()(Studio);
export default Studio;
