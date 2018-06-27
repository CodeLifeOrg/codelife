import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import CodeBlockCard from "components/CodeBlockCard";
import ProjectCard from "components/ProjectCard";
import {Collapse, Tabs2, Tab2} from "@blueprintjs/core";
import LoadingSpinner from "components/LoadingSpinner";

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

    const {islands, t} = this.props;
    const {codeBlocks, projects, isCodeBlocksOpen, isProjectsOpen} = this.state;
    const slice = 12;

    const featuredCodeBlocks = codeBlocks
      .filter(cb => cb.featured)
      .map(cb => {
        const {theme, icon} = islands.find(i => i.id === cb.lid);
        return <CodeBlockCard
          key={cb.id}
          codeBlock={cb}
          theme={theme}
          icon={icon}
          onToggleFeature={this.onToggleFeature.bind(this)} />;
      });

    const codeBlocksHead = codeBlocks
      .filter(cb => !cb.featured)
      .slice(0, slice)
      .map(cb => {
        const {theme, icon} = islands.find(i => i.id === cb.lid);
        return <CodeBlockCard
          key={cb.id}
          codeBlock={cb}
          theme={theme}
          icon={icon}
          onToggleFeature={this.onToggleFeature.bind(this)} />;
      });

    const codeBlocksRest = codeBlocks
      .filter(cb => !cb.featured)
      .slice(slice + 1)
      .map(cb => {
        const {theme, icon} = islands.find(i => i.id === cb.lid);
        return <CodeBlockCard
          key={cb.id}
          codeBlock={cb}
          theme={theme}
          icon={icon}
          onToggleFeature={this.onToggleFeature.bind(this)} />;
      });


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
      .slice(0, slice)
      .map(p =>
        <ProjectCard
          key={p.id}
          project={p}
          onToggleFeature={this.onToggleFeature.bind(this)}
        />
      );

    const projectsRest = projects
      .filter(p => !p.featured)
      .slice(slice + 1)
      .map(p =>
        <ProjectCard
          key={p.id}
          project={p}
          onToggleFeature={this.onToggleFeature.bind(this)}
        />
      );


    // Codeblocks panel content
    const codeblocksPanel =
    <div className="featured-codeblocks u-margin-top-lg u-text-left">
      {/* featured Codeblocks */}
      <h2>{t("ShownOnHomepage")}</h2>
      <div className="featured-list card-list">
        { featuredCodeBlocks.length ? featuredCodeBlocks : <LoadingSpinner label={false} /> }
      </div>

      {/* not featured Codeblocks */}
      <h2>{t("AddToHomepage")}</h2>
      <div className="browse-list card-list">
        { codeBlocksHead }
      </div>

      <Collapse className="browse-list" isOpen={isCodeBlocksOpen}>
        { codeBlocksRest }
      </Collapse>

      {/* show / hide all Codeblocks button */}
      <button className="button font-md u-fullwidth u-margin-bottom-off" onClick={() => this.setState({isCodeBlocksOpen: !isCodeBlocksOpen})}>{isCodeBlocksOpen ? t("Hide") : t("Show More")} {t("Codeblocks")}</button>
    </div>;


    // Projects panel content
    const projectsPanel =
    <div className="featured-projects u-margin-top-lg u-text-left">
      {/* featured projects */}
      <h2>{t("ShownOnHomepage")}</h2>
      <div className="featured-list card-list">
        { featuredProjects.length ? featuredProjects : <LoadingSpinner label={false} /> }
      </div>

      {/* not featured projects */}
      <h2>{t("AddToHomepage")}</h2>
      <div className="browse-list card-list">
        { projectsHead }
      </div>
      <Collapse className="browse-list" isOpen={isProjectsOpen}>
        { projectsRest }
      </Collapse>

      {/* show / hide all projects button */}
      <button className="button font-md u-fullwidth u-margin-bottom-off" onClick={() => this.setState({isProjectsOpen: !isProjectsOpen})}>{isProjectsOpen ? t("Hide") : t("Show More")} {t("Projects")}</button>
    </div>;


    return (
      <div className="featured-admin">

        <h1 className="u-text-center u-margin-bottom-off">{t("FeaturedTitle")}</h1>

        <div className="admin-sub-tabs-container">
          <Tabs2 className="admin-sub-tabs" defaultSelectedTabId="featured-codeblocks">
            <Tab2 id="featured-codeblocks" className="admin-sub-tab" title={t("Codeblocks")} panel={codeblocksPanel} />
            <Tab2 id="featured-projects" className="admin-sub-tab" title={t("Projects")} panel={projectsPanel} />
          </Tabs2>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  islands: state.islands
});

Featured = connect(mapStateToProps)(Featured);
Featured = connect(state => ({
  auth: state.auth
}))(Featured);
Featured = translate()(Featured);
export default Featured;
