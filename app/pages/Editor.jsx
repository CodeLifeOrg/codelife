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
      currentText: "",
      lesson: null,
      snippet: null
    };
  }

  componentDidUpdate() {
    if (this.props.user && !this.state.gotUserFromDB) {
      const {id} = this.props.user;
      const {lid} = this.props.params;
      this.setState({gotUserFromDB: true});
      axios.get(`/api/snippets/?uid=${id}&lid=${lid}`).then(resp => {
        if (resp.data.length > 0) {
          this.setState({snippet: resp.data[0], currentText: resp.data[0].studentcontent}, this.renderText.bind(this));
        } 
        else {
          this.setState({currentText: this.state.lesson.initialcontent}, this.renderText.bind(this));
        }
      });
    }
  }

  componentDidMount() {
    axios.get(`/api/lessons?id=${this.props.params.lid}`).then(resp => {
      this.setState({mounted: true, lesson: resp.data[0]});
    });
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
    const {lesson} = this.state;
    if (lesson) this.setState({currentText: lesson.initialcontent}, this.renderText.bind(this));
  }

  saveCodeToDB() {
    const {id: uid} = this.props.user;
    const {currentText: studentcontent, snippet} = this.state;
    const {lid} = this.props.params;
    const name = `My ${this.state.lesson.name} Snippet`;

    let endpoint = "/api/snippets/";
    snippet ? endpoint += "update" : endpoint += "new";
    axios.post(endpoint, {uid, lid, name, studentcontent}).then(resp => {
      if (resp.status === 200) { 
        if (!snippet) this.setState({snippet: resp.data});
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
    const {lesson, snippet} = this.state;

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
          { snippet ? <Link className="share-link" to={`/share/snippet/${snippet.id}`}>Share this Snippet</Link> : null }
          <br/><br/>
          <Link className="lesson-link" to={`/lesson/${lid}`}>Back to {lesson.name}</Link>
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
