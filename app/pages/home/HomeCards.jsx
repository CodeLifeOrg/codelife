import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import LoadingSpinner from "components/LoadingSpinner";
import CodeBlockCard from "components/CodeBlockCard";
import ProjectCard from "components/ProjectCard";
import "./HomeCards.css";

class HomeCards extends Component {

  render() {
    const {codeBlocks, islands, projects, t} = this.props;

    return (
      <div className="content-section">

        {/* keep this a paragraph so that project and codeblock cards have the right heading level */}
        <p className="heading font-xl">{t("Home.MadeOnCodelife")}</p>

        {/* projects */}
        <div className="project-section u-clearfix">
          <h2 className="projects-heading">{ t("Projects") }</h2>
          <p className="u-visually-hidden">{ t("ProjectExplainer")}</p>
          <div className="card-list project-list">
            { !projects ? <LoadingSpinner /> : projects.map(p => <ProjectCard key={p.id} project={p} />) }
          </div>
        </div>

        {/* codeblocks */}
        <div className="codeblock-section u-clearfix">
          <h2 className="codeblocks-heading">{ t("CodeBlocks") }</h2>
          <p className="u-visually-hidden">{ t("CodeblockExplainer")}</p>
          <div className="card-list codeblock-list">
            { !codeBlocks ? <LoadingSpinner /> : codeBlocks.map(c => {
              const {theme, icon} = islands.find(i => i.id === c.lid);
              return <CodeBlockCard key={c.id} codeBlock={c} theme={theme} icon={icon}/>;
            }) }
          </div>
        </div>
      </div>
    );
  }
}

export default translate()(HomeCards);
