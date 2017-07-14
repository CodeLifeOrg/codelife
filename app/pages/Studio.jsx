import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import Nav from "components/Nav";
import Snippets from "components/Snippets";
import Projects from "components/Projects";
import axios from "axios";
import "./Studio.css";

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
      currentProject: null,
      currentText: ""
    };
  }

  componentDidUpdate() {
    if (this.props.user && !this.state.gotUserFromDB) {
      this.setState({gotUserFromDB: true});
      axios.get(`api/projects/?uid=${this.props.user.id}`).then(resp => {
        // todo: catch when htmlcontent is null
        let currentText = "";
        if (resp.data.length > 0) currentText = resp.data[0].htmlcontent;
        this.setState({currentText}, this.renderText.bind(this));
      });
    }
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  handleCreateProject(project) {
    // todo: save first, or ask user if they want to save before clearing
    this.setState({currentProject: project, currentText: ""}, this.renderText.bind(this));
  }

  handleDeleteProject() {
    this.setState({currentProject: null, currentText: ""}, this.renderText.bind(this));
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
    this.setState({currentText: this.getEditor().getValue()}, this.renderText.bind(this));
  }

  renderText() {
    const doc = this.refs.rc.contentWindow.document;
    doc.open();
    doc.write(this.getEditor().getValue());
    doc.close();
  }

  onChangeText(theText) {
    this.setState({currentText: theText}, this.renderText.bind(this));
  }

  onClickSnippet(snippet) {
    this.insertTextAtCursor(snippet.studentcontent);
  }

  onClickProject(project) {
    this.setState({currentText: project.studentcontent, currentProject: project}, this.renderText.bind(this));
  }

  saveCodeToDB() {
    const {id: uid} = this.props.user;
    const {currentText: studentcontent, currentProject} = this.state;

    if (currentProject) {
      const id = currentProject.id;
      const name = currentProject.name;
      axios.post("api/projects/update", {id, name, uid, studentcontent}).then (resp => {
        resp.status === 200 ? alert("Saved to DB") : alert("Error");
      });
    } 
    else {
      alert("open a new file first");
    }
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
        <Snippets onChoose={this.onClickSnippet.bind(this)}/>
        <Projects onCreateProject={this.handleCreateProject.bind(this)} onDeleteProject={this.handleDeleteProject.bind(this)} onChoose={this.onClickProject.bind(this)}/>
        <div id="container">
          <div id="acecontainer">
          { this.state.mounted ? <AceWrapper ref={ comp => this.editor = comp } mode="html" theme="monokai" onChange={this.onChangeText.bind(this)} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : null }
          <button className="button" onClick={this.saveCodeToDB.bind(this)}>SAVE</button>
          <button className="button" onClick={this.validateHTML.bind(this)}>VALIDATE</button>
          </div>
          <iframe id="rendercontainer" ref="rc" />
        </div>
        <div className="clear">
          <br/>
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
