import axios from "axios";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Tab2, Tabs2, Toaster} from "@blueprintjs/core";
import himalaya from "himalaya";

import AceWrapper from "components/AceWrapper";
import AllSnippets from "components/AllSnippets";
import Snippets from "components/Snippets";
import Projects from "components/Projects";

import "./Studio.css";

class Studio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTabId: "projects",
      mounted: false,
      currentProject: null,
      currentText: "",
      changesMade: false,
      titleText: ""
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  onCreateProject(project) {
    this.setState({currentProject: project, currentText: ""}, this.renderText.bind(this));
    browserHistory.push(`/studio/${this.props.auth.user.username}/${project.name}`);
  }

  onDeleteProject(newproject) {
    let currentText = newproject.studentcontent;
    // this means we deleted a DIFFERENT project and can therefore keep our current currentText
    if (newproject.id === this.state.currentProject.id) currentText = this.state.currentText;
    this.setState({currentProject: newproject, currentText}, this.renderText.bind(this));
    browserHistory.push(`/studio/${this.props.user.username}/${newproject.name}`);
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
    this.setState({currentText: this.getEditor().getValue()}, this.renderText.bind(this));
  }

  setTitleText() {
    const content = himalaya.parse(this.state.currentText);
    let head, title = null;
    let titleText = "";
    const html = content.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) title = head.children.find(e => e.tagName === "title");
    if (title) titleText = title.children[0].content;
    this.setState({titleText});
  }

  renderText() {
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.getEditor().getValue());
      doc.close();
    }
    this.setTitleText();
  }

  onChangeText(theText) {
    this.setState({currentText: theText, changesMade: true}, this.renderText.bind(this));
  }

  onClickSnippet(snippet) {
    if (this.state.currentProject) this.insertTextAtCursor(snippet.studentcontent);
  }

  openProject(pid) {
    axios.get(`/api/projects/byid?id=${pid}`).then(resp => {
      this.setState({currentText: resp.data[0].studentcontent, currentProject: resp.data[0], changesMade: false}, this.renderText.bind(this));
      browserHistory.push(`/studio/${this.props.auth.user.username}/${resp.data[0].name}`);
    });
  }

  // todo: i'm loading studentcontent twice.  once when we instantiate projects, and then again
  // when you click a project.  I did this so that clicks would respect new writes, but i should
  // find a way to only ever ask for studentcontent once, on-demand only.
  onClickProject(project) {
    if (this.state.currentProject) {
      if (this.state.changesMade) {
        if (confirm("Discard changes and open a new file?")) {
          this.openProject(project.id);
          return true;
        }
        else {
          return false;
        }
      }
      else {
        this.openProject(project.id);
        return true;
      }
    }
    else {
      this.openProject(project.id);
      return true;
    }
  }

  saveCodeToDB() {
    const {id: uid} = this.props.user;
    const {currentText: studentcontent, currentProject} = this.state;

    if (currentProject) {
      const id = currentProject.id;
      const name = currentProject.name;
      axios.post("/api/projects/update", {id, name, uid, studentcontent}).then (resp => {
        if (resp.status === 200) {
          const t = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
          t.show({message: "Saved!", intent: Intent.SUCCESS});
          this.setState({changesMade: false});
        }
      });
    }
    else {
      alert("open a new file first");
    }
  }

  handleTabChange(activeTabId) {
    this.setState({activeTabId});
  }

  render() {

    const {auth, t} = this.props;
    const {activeTabId, currentProject, titleText} = this.state;
    const {id} = this.props.params;

    if (!auth.user) browserHistory.push("/login");

    const snippetRef = <Snippets onClickSnippet={this.onClickSnippet.bind(this)}/>;
    const allSnippetRef = <AllSnippets onClickSnippet={this.onClickSnippet.bind(this)}/>;
    const projectRef = <Projects  projectToLoad={id}
                                  onCreateProject={this.onCreateProject.bind(this)}
                                  onDeleteProject={this.onDeleteProject.bind(this)}
                                  openProject={this.openProject.bind(this)}
                                  onClickProject={this.onClickProject.bind(this)}/>;

    return (
      <div id="studio">
        <div id="head">
          <h1 className="title">{ t("Studio") }</h1>
          <div className="title-tab">{titleText}</div>
          <div className="buttons">
            { currentProject ? <a className="pt-button" target="_blank" href={ `/share/project/${currentProject.id}` }>{ t("Share") }</a> : null }
            <button className="pt-button pt-intent-success" onClick={this.saveCodeToDB.bind(this)}>{ t("Save") }</button>
          </div>
        </div>
        <div id="body">
          <Tabs2 className="studio-panel" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
            <Tab2 id="projects" title="Projects" panel={ projectRef } />
            <Tab2 id="my-blocks" title="Code Blocks" panel={ snippetRef } />
            <Tab2 id="other-blocks" title="Other Blocks" panel={ allSnippetRef } />
          </Tabs2>
          { this.state.mounted ? <AceWrapper className="studio-editor" ref={ comp => this.editor = comp } mode="html" onChange={this.onChangeText.bind(this)} showGutter={false} readOnly={!currentProject} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : <div className="studio-editor"></div> }
          <iframe className="studio-render" ref="rc" />
        </div>
      </div>
    );
  }
}

Studio = connect(state => ({
  auth: state.auth
}))(Studio);
Studio = translate()(Studio);
export default Studio;
