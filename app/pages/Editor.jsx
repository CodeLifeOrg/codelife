import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import Nav from "components/Nav";
import {Link} from "react-router";
import axios from "axios";
import "./Editor.css";

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

class Editor extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      mounted: false, 
      gotUserFromDB: false, 
      currentText: ""
    };
  }

  componentDidUpdate() {
    if (this.props.user && !this.state.gotUserFromDB) {
      const {id} = this.props.user;
      const {lid} = this.props.params;
      this.setState({gotUserFromDB: true});
      axios.get(`/api/snippets/?uid=${id}&lid=${lid}`).then(resp => {
        this.setState({currentText: resp.data[0].studentcontent}, this.renderText.bind(this));
      });
    }
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  grabContents() {
    return this.state.currentText;
  }

  renderText() {
    const doc = this.refs.rc.contentWindow.document;
    doc.open();
    doc.write(this.state.currentText);
    doc.close();
  }

  onChangeText(theText) {
    this.setState({currentText: theText}, this.renderText.bind(this));
  }

  resetSnippet() {
    console.log("would reset");
  }

  saveCodeToDB() {
    const {id: uid} = this.props.user;
    const {currentText: studentcontent} = this.state;
    const {lid} = this.props.params;

    axios.post("/api/snippets/save", {uid, lid, studentcontent}).then(resp => {
      if (resp.status === 200) {
        // todo fix this, this is not a good way to cause a refresh
        this.setState({gotUserFromDB: false});
        alert("Saved to DB");
      } 
      else {
        alert("Error");
      }
    }); 
  }    

  validateHTML() {
    
    /*
    const annotations = this.getEditor().getSession().getAnnotations();
    const validationText = {};
    validationText.info = "WARNINGS: \n\n";
    validationText.error = "ERRORS: \n\n";
    for (const a of annotations) {
      validationText[a.type] += `${a.text} \n\n`;
    }
    alert(`${validationText.info} ${validationText.error}`);
    */

  }

  render() {
    
    const {t} = this.props;
    const {lid} = this.props.params;

    if (!this.state.mounted) return <h1>Loading...</h1>;

    return (  
      <div>
        <h1>{ "Editor" }</h1>
        <div id="container">
          <div id="acecontainer">
          { this.state.mounted ? <AceWrapper ref={ comp => this.editor = comp } mode="html" theme="monokai" onChange={this.onChangeText.bind(this)} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : null }
          <button className="button" key="save" onClick={this.saveCodeToDB.bind(this)}>SAVE</button>
          <button className="button" key="reset" onClick={this.resetSnippet.bind(this)}>RESET</button>
          <br/><br/>
          <Link className="lesson-link" to={`/lesson/${lid}`}>Back to Lesson</Link>
          </div>
          <iframe id="rendercontainer" ref="rc" />
        </div>
        <div className="clear" />
        <Nav />
      </div>
    );
  }
}

Editor = connect(state => ({
  user: state.auth.user
}))(Editor);
Editor = translate()(Editor);
export default Editor;
