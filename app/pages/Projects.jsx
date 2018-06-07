import axios from "axios";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Alert, Dialog, EditableText, Intent, Position, Toaster} from "@blueprintjs/core";
import {Link} from "react-router";
import LoadingSpinner from "components/LoadingSpinner";

import CodeBlockList from "components/CodeBlockList";
import CodeEditor from "components/CodeEditor/CodeEditor";
import CollabList from "components/CollabList";
import CollabSearch from "components/CollabSearch";
import ShareDirectLink from "components/ShareDirectLink";
import ShareFacebookLink from "components/ShareFacebookLink";

import "components/Studio.css";
import "./Projects.css";

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      deleteAlert: false,
      leaveAlert: false,
      activeTabId: "projects-tab",
      projectName: "",
      mounted: false,
      execState: false,
      currentProject: null,
      currentPreview: null,
      collabProject: null,
      originalTitle: "",
      currentTitle: "",
      canEditTitle: true,
      optout: false,
      projects: [],
      collabs: [],
      showCodeblocks: false,
      canPostToFacebook: true,
      isManageCollabsOpen: false,
      isViewCollabsOpen: false
    };
    this.handleKey = this.handleKey.bind(this); // keep this here to scope shortcuts to this page
  }

  componentDidMount() {
    const pget = axios.get("/api/projects/mine");
    const cget = axios.get("/api/projects/collabs");
    const {t} = this.props;

    Promise.all([pget, cget]).then(resp => {
      const projects = resp[0].data;
      const collabs = resp[1].data;

      let {currentProject} = this.state;
      const {filename} = this.props.params;
      if (filename) {
        currentProject = projects.find(p => p.slug === filename);
        if (!currentProject) currentProject = projects.find(p => p.name === filename);
        if (!currentProject) currentProject = projects[0];
        this.setState({currentProject, projects, collabs}, this.openProject.bind(this, currentProject.id));
      }
      else {
        if (projects.length === 0) {
          this.createNewProject.bind(this)(t("My Project"));
        }
        else {
          let latestIndex = 0;
          let latestDate = projects[0].datemodified;
          for (let i = 0; i < projects.length; i++) {
            const p = projects[i];
            if (p.datemodified && Date.parse(p.datemodified) > Date.parse(latestDate)) {
              latestIndex = i;
              latestDate = p.datemodified;
            }
          }
          const currentProject = projects[latestIndex];
          this.setState({currentProject, projects, collabs}, this.openProject.bind(this, currentProject.id));
        }
      }
    });

    // start listening for keypress when entering the page
    document.addEventListener("keypress", this.handleKey);
  }

  // stop listening for keypress when leaving the page
  componentWillUnmount() {
    document.removeEventListener("keypress", this.handleKey);
    clearTimeout(this.timeout);
  }

  openProject(pid) {
    const {browserHistory} = this.context;
    axios.get(`/api/projects/byid?id=${pid}`).then(resp => {
      if (resp.data) {
        this.setState({currentProject: resp.data, currentTitle: resp.data.name, originalTitle: resp.data.name});
        if (resp.data.slug) {
          browserHistory.push(`/projects/${this.props.auth.user.username}/${resp.data.slug}/edit`);
        }
        else {
          browserHistory.push(`/projects/${this.props.auth.user.username}/${resp.data.name}/edit`);
        }
      }
    });
  }

  setExecState(execState) {
    this.setState({execState});
  }

  createNewProject(projectName) {
    const {browserHistory} = this.context;
    // Trim leading and trailing whitespace and remove URL-breakers from the project title
    projectName = projectName.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");
    // const slug = slugify(projectName, this.slugOptions);
    if (this.state.projects.find(p => p.name === projectName) === undefined && projectName !== "") {
      axios.post("/api/projects/new", {name: projectName, studentcontent: ""}).then(resp => {
        if (resp.status === 200) {
          const projects = resp.data.projects;
          const newid = resp.data.id;
          const currentProject = projects.find(p => p.id === newid);
          this.setState({currentTitle: currentProject.name, originalTitle: currentProject.name, projectName: "", currentProject, projects, isNewOpen: false});
          if (currentProject.slug) {
            browserHistory.push(`/projects/${this.props.auth.user.username}/${currentProject.slug}/edit`);
          }
          else {
            browserHistory.push(`/projects/${this.props.auth.user.username}/${currentProject.name}/edit`);
          }

        }
        else {
          alert("Error");
        }
      });
    }
    else {
      alert("File cannot be in use or blank");
    }
  }

  clickNewProject() {
    const {t} = this.props;
    if (this.editor && !this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
      this.setState({isNewOpen: true});
    }
    else {
      const toast = Toaster.create({className: "shareToast", position: Position.TOP_CENTER});
      toast.show({message: t("Save your webpage before starting a new one!"), timeout: 1500, intent: Intent.WARNING});
    }
  }

  shareProject() {
    const {t} = this.props;
    const {username} = this.props.auth.user;
    const {browserHistory} = this.context;
    if (this.editor && !this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
      // browserHistory.push(`/projects/${username}/${this.state.currentProject.name}`);

    }
    else {
      const toast = Toaster.create({className: "shareToast", position: Position.TOP_CENTER});
      toast.show({message: t("Save your webpage before sharing!"), timeout: 1500, intent: Intent.WARNING});
    }
  }

  showLeaveAlert(collab) {
    const {t} = this.props;
    const leaveAlert = {
      collab,
      text: `${t("Are you sure you want to leave")} “${collab.name}”?`
    };
    this.setState({leaveAlert});
  }

  leaveCollab() {
    const {collab} = this.state.leaveAlert;
    const {projects} = this.state;
    if (collab && collab.id) {
      const pid = collab.id;
      axios.post("/api/projects/leavecollab", {pid}).then(resp => {
        if (resp.status === 200) {
          const collabs = this.state.collabs.filter(c => c.id !== collab.id);
          if (collab.id === this.state.currentProject.id) {
            const currentProject = projects[0];
            this.setState({leaveAlert: false, currentProject, collabs}, this.openProject.bind(this, currentProject.id));
          }
          else {
            this.setState({leaveAlert: false, collabs});
          }
        }
        else {
          console.log("error");
        }
      });
    }
  }

  handleCheckbox() {
    this.setState({optout: !this.state.optout});
  }

  deleteProject(project) {
    const {t} = this.props;
    const {browserHistory} = this.context;

    if (project === true) {
      const {deleteAlert} = this.state;
      axios.delete("/api/projects/delete", {params: {id: deleteAlert.project.id}}).then(resp => {
        if (resp.status === 200) {
          const projects = resp.data;
          let newProject = null;
          // if the project i'm trying to delete is the one i'm currently on, pick a new project
          // to open (in this case, the first one in the list)
          if (deleteAlert.project.id === this.state.currentProject.id) {
            if (projects.length > 0) newProject = projects[0];
          }
          // if the project i'm trying to delete is a different project, it's fine to stay on
          // my current project.
          else {
            newProject = this.state.currentProject;
          }
          this.setState({deleteAlert: false, projectName: "", currentProject: newProject, currentTitle: newProject.name, originalTitle: newProject.name, projects});
          if (newProject.slug) {
            browserHistory.push(`/projects/${this.props.auth.user.username}/${newProject.slug}/edit`);
          }
          else {
            browserHistory.push(`/projects/${this.props.auth.user.username}/${newProject.name}/edit`);
          }

        }
        else {
          console.log("Error");
        }
      });
    }
    else {
      this.setState({deleteAlert: {
        project,
        // text: `Are you sure you want to delete "${ project.name }"? This action cannot be undone.`
        text: t("deleteAlert", {projectName: project.name})
      }});
    }

  }

  // TODO: i'm loading studentcontent twice.  once when we instantiate projects, and then again
  // when you click a project.  I did this so that clicks would respect new writes, but i should
  // find a way to only ever ask for studentcontent once, on-demand only.

  // Also, the return value here is because Projects.jsx needs to know if I clicked confirm or not.

  onClickProject(project) {
    const {t} = this.props;
    const toast = Toaster.create({className: "blockToast", position: Position.TOP_CENTER});
    if (this.state.currentProject) {
      if (this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
        toast.show({message: t("saveWarning"), timeout: 1500, intent: Intent.WARNING});
      }
      else {
        this.openProject(project.id);
      }
    }
    else {
      this.openProject(project.id);
    }
  }

  saveCodeToDB() {
    const {t} = this.props;
    const {currentProject} = this.state;


    if (currentProject) {
      const id = currentProject.id;
      const name = currentProject.name;
      // const slug = slugify(name, this.slugOptions);
      const studentcontent = this.editor.getWrappedInstance().getWrappedInstance().getEntireContents();
      const username = this.props.auth.user.username;
      let isFirstSaveShareOpen = !currentProject.prompted;
      if (this.state.optout || currentProject.userprofile.prompted) isFirstSaveShareOpen = false;
      const canPostToFacebook = false;
      currentProject.prompted = true;
      axios.post("/api/projects/update", {id, username, name, studentcontent, prompted: true}).then (resp => {
        if (resp.status === 200) {
          const updatedProject = resp.data;
          // Slugs can only be generated by the DB. Update the current project when the payload comes back.
          if (currentProject.id === updatedProject.id) currentProject.slug = updatedProject.slug;
          const {browserHistory} = this.context;
          const {username} = this.props.auth.user;
          const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
          toast.show({message: t("Saved!"), timeout: 1500, intent: Intent.SUCCESS});
          this.editor.getWrappedInstance().getWrappedInstance().setChangeStatus(false);
          this.setState({canEditTitle: true, isFirstSaveShareOpen, canPostToFacebook, currentProject});
          // Screenshots take time to generate and FB caches aggressively - Add time so it appears out the first time
          this.timeout = setTimeout(() => this.setState({canPostToFacebook: true}), 6000);
          if (updatedProject.slug) {
            browserHistory.push(`/projects/${username}/${updatedProject.slug}/edit`);
          }
          else {
            browserHistory.push(`/projects/${username}/${updatedProject.name}/edit`);
          }
        }
      });
    }
    else {
      alert("Open a new file first");
    }
  }

  closeFirstTimeShare() {
    if (this.state.optout) {
      axios.post("/api/profile/update", {prompted: true}).then(resp => {
        resp.status === 200 ? console.log("success") : console.log("error");
      });
    }
    this.setState({isFirstSaveShareOpen: false});
  }

  executeCode() {
    this.editor.getWrappedInstance().getWrappedInstance().executeCode();
  }

  handleFork(newid, projects) {
    this.setState({projects}, this.openProject.bind(this, newid));
  }

  toggleCodeblocks() {
    this.setState({showCodeblocks: !this.state.showCodeblocks});
  }

  changeProjectName(newName) {
    const {currentProject, projects} = this.state;
    const canEditTitle = false;
    newName = newName.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");
    currentProject.name = newName;
    const cp = projects.find(p => p.id === currentProject.id);
    if (cp) {
      cp.name = newName;
    }
    const currentTitle = newName;
    const originalTitle = newName;
    this.setState({currentProject, projects, canEditTitle, currentTitle, originalTitle});
    this.saveCodeToDB.bind(this)();
  }

  handleKey(e) {
    const {currentProject} = this.state;
    const isMine = currentProject && currentProject.uid === this.props.auth.user.id;

    // cmd+s = save
    // if (e.key === "s" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
    if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
      this.saveCodeToDB();
    }
    // else if (e.key === "e" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) { // should work, but doesn't override browser URL bar focus
    else if (e.key === "e" && e.ctrlKey) {
      e.preventDefault();
      this.executeCode(); // NOTE: doesn't work when editor has focus
    }
    // else if (e.key === "r" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) { // should work, but doesn't override browser refresh
    else if (e.key === "r" && e.ctrlKey) {
      e.preventDefault();
      this.attemptReset();
    }
    // else if (e.key === "d" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && isMine) { // should work, but doesn't override browser bookmark
    else if (e.key === "d" && e.ctrlKey && isMine) {
      e.preventDefault();
      this.deleteProject(this.state.currentProject); // NOTE: doesn't work when editor has focus
    }
    // else if (e.key === "l" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && !isMine) { // should work, but doesn't override browser refresh
    else if (e.key === "l" && e.ctrlKey && !isMine) {
      e.preventDefault();
      this.showLeaveAlert(this.state.currentProject); // NOTE: doesn't work when editor has focus
    }
    // else if (e.key === "o" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) { // should work, but doesn't override browser open
    else if (e.key === "o" && e.ctrlKey) {
      e.preventDefault();

      // NOTE: doesn't work when editor has focus
      if (isMine) {
        this.setState({isManageCollabsOpen: true});
      }
      else {
        this.setState({isViewCollabsOpen: true});
      }
    }
    // else if (e.key === "n" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) { // should work, but doesn't override browser new window
    else if (e.key === "n" && e.ctrlKey) { // NOTE: doesn't work when editor has focus
      e.preventDefault();
      this.clickNewProject();
    }
  }


  render() {

    const {auth, t} = this.props;
    const {currentProject, canEditTitle, originalTitle, currentTitle, deleteAlert, leaveAlert, execState, showCodeblocks, canPostToFacebook} = this.state;
    const {browserHistory} = this.context;

    if (!auth.user) browserHistory.push("/");

    if (!currentProject) return <LoadingSpinner />;

    const isMine = currentProject && currentProject.uid === this.props.auth.user.id;
    const hasCollabs = currentProject && currentProject.collaborators.length;

    const showDeleteButton = this.state.projects.length > 1;

    const {origin} = this.props.location;
    const name = currentProject ? currentProject.name : "";
    const slug = currentProject ? currentProject.slug : "";

    const shareLink = slug ? encodeURIComponent(`${origin}/projects/${currentProject.user.username}/${slug}`) : encodeURIComponent(`${origin}/projects/${currentProject.user.username}/${name}`);

    const projectItems = this.state.projects.map(project =>
      <li className="project-switcher-item" key={project.id}>
        <Link
          onClick={() => this.onClickProject.bind(this)(project)}
          className="project-switcher-link link">
          <span className="project-switcher-link-thumb">
            <img className="project-switcher-link-thumb-img" src={`/pj_images/${project.user.username}/${project.id}.png?v=${new Date().getTime()}`} alt=""/>
          </span>
          <span className="project-switcher-link-text">
            { project.name }
          </span>
        </Link>
      </li>
    );

    const collabItems = this.state.collabs.map(collab =>
      <li to={collab.id} className="project-switcher-item" key={collab.id}>
        <Link
          onClick={() => this.onClickProject.bind(this)(collab)}
          className="project-switcher-link link">
          <span className="project-switcher-link-thumb">
            <img className="project-switcher-link-thumb-img" src={`/pj_images/${collab.user.username}/${collab.id}.png?v=${new Date().getTime()}`} alt=""/>
          </span>
          <span className="project-switcher-link-text">
            { collab.name }
          </span>
        </Link>
        {/* <Tooltip position={Position.RIGHT} content={`${t("Project Owner - ")}${collab.user.username}`}>
        </Tooltip> */}
      </li>
    );


    return (
      <div className="studio projects-studio">

        <div className="studio-inner">

          {/* hidden h1 for accessibility */}
          <h1 className="u-visually-hidden">{ t("Projects") }</h1>

          {/* body */}
          <div className="studio-body">

            {/* controls */}
            <div className="studio-controls">

              {/* current file */}
              <h2 className="studio-title font-lg">
                <span className="u-visually-hidden">{ t("Current project") }: </span>
                <EditableText
                  value={currentTitle}
                  selectAllOnFocus={true}
                  onChange={t => this.setState({currentTitle: t})}
                  onCancel={() => this.setState({currentTitle: originalTitle})}
                  onConfirm={this.changeProjectName.bind(this)}
                  multiline={true}
                  disabled={!canEditTitle}
                  confirmOnEnterKey={true}
                />
              </h2>

              {/* actions title */}
              <h3 className="studio-subtitle font-xs u-margin-bottom-off">{t("Actions")}</h3>

              {/* list of actions */}
              <ul className="studio-action-list font-xs u-list-reset">

                {/* save project */}
                <li className="studio-action-item">
                  <button className="studio-action-button u-unbutton link" onClick={this.saveCodeToDB.bind(this)}>
                    <span className="studio-action-button-icon pt-icon pt-icon-floppy-disk" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ t("Project.Save") }</span>
                  </button>
                </li>

                {/* execute code */}
                <li className="studio-action-item">
                  <button
                    className={ `studio-action-button u-unbutton link ${!execState && " is-disabled"}` }
                    onClick={this.executeCode.bind(this)}
                    tabIndex={!execState && "-1"}>
                    <span className="studio-action-button-icon pt-icon pt-icon-refresh" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ t("Project.Execute") }</span>
                  </button>
                </li>

                {/* add / manage collaborators */}
                { isMine ? <li className="studio-action-item">
                  {/* my project */}
                  <button className="studio-action-button u-unbutton link" onClick={() => this.setState({isManageCollabsOpen: true})}>
                    <span className="studio-action-button-icon pt-icon pt-icon-people" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ !hasCollabs ? t("Project.AddCollaborators") : t("Project.ManageCollaborators") }</span>
                  </button>
                  {/* joined project */}
                </li> : <li className="studio-action-item">
                  <button className="studio-action-button u-unbutton link" onClick={() => this.setState({isViewCollabsOpen: true})}>
                    <span className="studio-action-button-icon pt-icon pt-icon-people" />
                    <span className="studio-action-button-text u-hide-below-xxs">
                      {/* X collaborators */}
                      {hasCollabs} { t(" collaborators")}
                    </span>
                  </button>
                </li> }

                {/* share project */}
                {<li className="studio-action-item">
                  <button className="studio-action-button link u-unbutton" onClick={() => this.setState({isShareOpen: true})}>
                    <span className="studio-action-button-icon pt-icon pt-icon-share" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ t("Project.Share") }</span>
                  </button>
                </li>}

                {/* delete / leave project */}
                { currentProject ? <li className="studio-action-item">
                  {
                    isMine
                      ? showDeleteButton
                        // delete button
                        ? <button className="studio-action-button u-unbutton link danger-text" onClick={this.deleteProject.bind(this, currentProject)}>
                          <span className="studio-action-button-icon pt-icon pt-icon-trash" />
                          <span className="studio-action-button-text u-hide-below-xxs">{t("Project.Delete")}</span>
                        </button>
                        // disabled delete button
                        : <button className="studio-action-button u-unbutton is-disabled link" tabIndex="-1">
                          <span className="studio-action-button-icon pt-icon pt-icon-trash" />
                          <span className="studio-action-button-text u-hide-below-xxs">{t("Project.Delete")}</span>
                        </button>
                      // leave project button
                      : <button className="studio-action-button u-unbutton link danger-text" onClick={this.showLeaveAlert.bind(this, currentProject)}>
                        <span className="studio-action-button-icon pt-icon pt-icon-log-out" />
                        <span className="studio-action-button-text u-hide-below-xxs">{t("Project.Leave") }</span>
                      </button>
                  }
                </li> : null }

              </ul>

              {/* <button onClick={() => this.setState({isFirstSaveShareOpen: true})}>TEST SHARE</button> */}

              {/* project switcher */}
              <div className="project-switcher font-xs">

                {/* Switch to project heading */}
                <h2 className="project-switcher-heading font-md">{ t("Project.SwitcherHeading") }</h2>

                {/* created by user */}
                <div className="my-project-switcher">
                  <h3 className="project-switcher-subhead font-xs u-margin-bottom-sm">{ t("Project.MyProjects") }</h3>
                  <ul className="project-switcher-list u-list-reset">
                    {projectItems}
                  </ul>
                </div>

                {/* joined by user */}
                { collabItems.length > 0
                  ? <div className="collab-project-switcher">

                    <h3 className="project-switcher-subhead font-xs u-margin-bottom-sm">{ t("Project.JoinedProjects") }</h3>

                    <ul className="project-switcher-list u-list-reset">
                      {collabItems}
                    </ul>
                  </div>
                  : null
                }

                {/* new project */}
                <button className="new-project-button pt-button pt-intent-primary" onClick={this.clickNewProject.bind(this)}>
                  <span className="pt-icon pt-icon-application" />
                  { t("create new project") }
                </button>

              </div>
            </div>


            {/* editor */}
            <div className="studio-editor">
              <CodeEditor
                codeTitle={ currentProject ? currentProject.name : "" } setExecState={this.setExecState.bind(this)}
                initialValue={currentProject ? currentProject.studentcontent : ""}
                ref={c => this.editor = c} />
            </div>
          </div>
        </div>


        {/* show / hide codeblocks */}
        { !showCodeblocks
          // show the button
          ? <div className="cta u-text-center u-margin-top-lg u-margin-bottom-off">

            <h2 className="cta-heading u-margin-top-off u-margin-bottom-off font-lg">
              { t("Need inspiration?") }
            </h2>

            {/* login | signup button */}
            <button className="cta-button pt-button pt-intent-primary font-md u-margin-top-md" onClick={this.toggleCodeblocks.bind(this)}>
              { t("Browse Codeblocks") }
            </button>
          </div>
          // show the codeblocks
          : <div className="codeblock-browser content u-padding-bottom-off">
            <div className="content-section">
              <h2 className="codeblock-browser-heading u-margin-top-off">{ t("Browse Codeblocks") }
                <button
                  className="codeblock-browser-hide-button u-unbutton u-margin-top-off u-margin-bottom-off"
                  onClick={this.toggleCodeblocks.bind(this)}>
                  <span className="pt-icon pt-icon-eye-off" />
                  <span className="u-visually-hidden">{ t("Hide Codeblocks") }</span>
                </button>
              </h2>
              <CodeBlockList blockFork={this.editor && this.editor.getWrappedInstance().getWrappedInstance().changesMade()} handleFork={this.handleFork.bind(this)} />
            </div>
          </div>
        }

        {/* first time share */}
        <Dialog
          isOpen={this.state.isFirstSaveShareOpen}
          onClose={this.closeFirstTimeShare.bind(this)}
          title={t("Share your Project")}
          className="share-dialog form-container u-text-center"
        >

          <h2 className="share-heading font-lg">
            {t("Project.ShareHeadingOnFirstSave")}
          </h2>

          <p className="share-body font-md">
            {t("Project.ShareBodyTextOnFirstSave")}
          </p>

          {/* direct link */}
          <div className="field-container share-direct-link-field-container">
            <ShareDirectLink link={shareLink} />
          </div>

          {/* facebook */}
          <div className="field-container">
            <ShareFacebookLink context="project" shareLink={shareLink} screenshotReady={canPostToFacebook} />
          </div>

          {/* stop bothering me */}
          <div className="field-container switch-field-container centered-switch-field-container font-sm u-margin-top-md">
            <label className="pt-control pt-switch">
              <input type="checkbox"
                checked={this.state.optout}
                onChange={this.handleCheckbox.bind(this)}
              />
              <span className="pt-control-indicator" />
              {t("Project.ShareOptOut")}
            </label>
          </div>
        </Dialog>


        {/* share dialog triggered by share button */}
        <Dialog
          isOpen={this.state.isShareOpen}
          onClose={() => this.setState({isShareOpen: false})}
          title={t("Share your Project")}
          className="share-dialog form-container u-text-center"
        >

          <h2 className="share-heading font-lg u-margin-bottom-off">
            {t("ShareDirectLink.Label")}:
          </h2>

          {/* direct link */}
          <div className="field-container share-direct-link-field-container u-margin-top-off u-margin-bottom-sm">
            <ShareDirectLink link={shareLink} fontSize="font-md" linkLabel={false} />
          </div>

          {/* facebook */}
          <div className="field-container u-margin-top-off">
            <ShareFacebookLink context="project" shareLink={shareLink} screenshotReady={canPostToFacebook} />
          </div>
        </Dialog>


        {/* collab search */}
        <Dialog
          isOpen={this.state.isManageCollabsOpen}
          onClose={() => this.setState({isManageCollabsOpen: !this.state.isManageCollabsOpen})}
          title=""
          className="form-container collab-form-container" >
          <CollabSearch currentProject={currentProject}/>
        </Dialog>

        {/* collab list */}
        <Dialog
          isOpen={this.state.isViewCollabsOpen}
          onClose={() => this.setState({isViewCollabsOpen: !this.state.isViewCollabsOpen})}
          title=""
          className="form-container collab-list-container" >
          <CollabList currentProject={currentProject} />
        </Dialog>

        {/* create new project */}
        <Dialog
          isOpen={this.state.isNewOpen}
          onClose={() => this.setState({isNewOpen: !this.state.isNewOpen})}
          title={t("Create New Project")}
          className="form-container new-project-form-container" >

          {/* input */}
          <div className="field-container">
            <label
              className="heading font-md"
              htmlFor="new-project-title">
              {t("Project name")}
            </label>
            <input
              id="new-project-title"
              className="font-md"
              value={this.state.projectName}
              onChange={e => this.setState({projectName: e.target.value})}
              autoFocus />
          </div>

          {/* submit */}
          <div className="field-container">
            <button
              className="pt-button pt-intent-primary font-md"
              onClick={this.createNewProject.bind(this, this.state.projectName)}>
              <span className="pt-icon pt-icon-application" />
              { t("create new project") }
            </button>
          </div>
        </Dialog>

        {/* confirm delete project */}
        <Alert
          className="alert-container form-container"
          isOpen={ deleteAlert ? true : false }
          cancelButtonText={ t("Cancel") }
          confirmButtonText={ t("Delete") }
          intent={ Intent.DANGER }
          onCancel={ () => this.setState({deleteAlert: false}) }
          onConfirm={ () => this.deleteProject(true) }>
          <p className="font-lg u-margin-top-off u-margin-bottom-md">{ deleteAlert ? deleteAlert.text : "" }</p>
        </Alert>

        {/* confirm leave project */}
        <Alert
          className="alert-container form-container"
          isOpen={ leaveAlert ? true : false }
          cancelButtonText={ t("Cancel") }
          confirmButtonText={ t("Leave") }
          intent={ Intent.DANGER }
          onCancel={ () => this.setState({leaveAlert: false}) }
          onConfirm={this.leaveCollab.bind(this)}>
          <p className="font-lg u-margin-top-off u-margin-bottom-md">{ leaveAlert ? leaveAlert.text : "" }</p>
        </Alert>

      </div>
    );
  }
}

Projects.contextTypes = {
  browserHistory: PropTypes.object
};

Projects = connect(state => ({
  auth: state.auth,
  location: state.location
}))(Projects);
Projects = translate()(Projects);
export default Projects;
