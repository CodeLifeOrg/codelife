import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import CodeBlockCard from "components/CodeBlockCard";
import ProjectCard from "components/ProjectCard";
import {Collapse} from "@blueprintjs/core";

import "./Featured.css";

class Featured extends Component {

  constructor(props) {
    super(props);
    this.state = {
      codeBlocks: [],
      projects: [],
      featuredCodeBlocks: [],
      featuredProjects: []
    };
  }

  componentDidMount() {
    const cbget = axios.get("/api/codeBlocks/all");
    const pget = axios.get("/api/projects/all");
    Promise.all([cbget, pget]).then(resp => {
      const codeBlocks = resp[0].data;
      const projects = resp[1].data;
      this.setState({codeBlocks, projects});
    });
  }

  onToggleFeature() {
    this.forceUpdate();
  }

  render() {

    const {t} = this.props;
    const {codeBlocks, projects, isCodeBlocksOpen, isProjectsOpen} = this.state;

    const featuredCodeBlocks = codeBlocks
      .filter(cb => cb.featured)
      .map(cb => 
        <CodeBlockCard 
          key={cb.id} 
          codeBlock={cb} 
          onToggleFeature={this.onToggleFeature.bind(this)}
        />
      );

    const codeBlocksHead = codeBlocks
      .filter(cb => !cb.featured)
      .slice(0, 10)
      .map(cb =>
        <CodeBlockCard 
          key={cb.id} 
          codeBlock={cb} 
          onToggleFeature={this.onToggleFeature.bind(this)}
        />
      );

    const codeBlocksRest = codeBlocks
      .filter(cb => !cb.featured)
      .slice(11)
      .map(cb =>
        <CodeBlockCard 
          key={cb.id} 
          codeBlock={cb} 
          onToggleFeature={this.onToggleFeature.bind(this)}
        />
      );


    const featuredProjects = projects
      .filter(p => p.featured)
      .map(p => 
        <ProjectCard 
          key={p.id} 
          project={p} 
          onToggleFeature={this.onToggleFeature.bind(this)}
        />
      );

    const projectsHead = projects
      .filter(p => !p.featured)
      .slice(0, 10)
      .map(p => 
        <ProjectCard 
          key={p.id} 
          project={p} 
          onToggleFeature={this.onToggleFeature.bind(this)}
        />
      );

    const projectsRest = projects
      .filter(p => !p.featured)
      .slice(11)
      .map(p => 
        <ProjectCard 
          key={p.id} 
          project={p} 
          onToggleFeature={this.onToggleFeature.bind(this)}
        />
      );

    return (
      <div className="featured content">
        <h1>{t("CODEBLOCKS")}</h1>
        <h3>{t("Featured")}</h3>
        <div className="codeblock-browser-list card-list">
          { featuredCodeBlocks }
        </div>
        <h3>{t("All")}</h3>
        <div className="codeblock-browser-list card-list">
          { codeBlocksHead }
          <button onClick={() => this.setState({isCBOpen: !isCodeBlocksOpen})}>{isCodeBlocksOpen ? t("Hide") : t("Show More")}</button>
          <Collapse isOpen={isCodeBlocksOpen}>
            { codeBlocksRest }
          </Collapse>
        </div>
        <h1>{t("PROJECTS")}</h1>
        <h3>{t("Featured")}</h3>
        <div className="codeblock-browser-list card-list">
          { featuredProjects }
        </div>
        <h3>{t("All")}</h3>
        <div className="codeblock-browser-list card-list">
          { projectsHead }
          <button onClick={() => this.setState({isProjectsOpen: !isProjectsOpen})}>{isProjectsOpen ? t("Hide") : t("Show More")}</button>
          <Collapse isOpen={isProjectsOpen}>
            { projectsRest }
          </Collapse>
        </div>
      </div>
    );
  }
}

Featured = connect(state => ({
  auth: state.auth
}))(Featured);
Featured = translate()(Featured);
export default Featured;
