import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {Tooltip2} from "@blueprintjs/labs";
import LoadingSpinner from "components/LoadingSpinner";
import CodeBlockCard from "components/CodeBlockCard";
import ProjectCard from "components/ProjectCard";
import "./HomeCards.css";

class HomeCards extends Component {

  render() {
    const {codeBlocks, islands, projects, t} = this.props;

    return (
      <div className="content-section cards-section">

        {/* keep this a paragraph so that project and codeblock cards have the right heading level */}
        <p className="cards-heading heading font-xl">{t("Home.MadeOnCodelife")}</p>

        {/* projects */}
        <div className="project-section u-clearfix">
          <h2 className="heading projects-heading">
            { t("Projects") }
            <Tooltip2 portalClassName="heading-explainer-tooltip" content={ t("ProjectExplainer")} defaultIsOpen={true} inheritDarkTheme={false}>
              <span className="heading-explainer pt-icon pt-icon-help" />
            </Tooltip2>
          </h2>
          <p className="u-visually-hidden">{ t("ProjectExplainer")}</p>
          <div className="card-list project-list">
            { !projects ? <LoadingSpinner /> : projects.map(p => <ProjectCard key={p.id} project={p} />) }
          </div>
        </div>

        {/* codeblocks */}
        <div className="codeblock-section u-clearfix">
          <h2 className="heading codeblocks-heading">
            { t("CodeBlocks") }
            <Tooltip2 portalClassName="heading-explainer-tooltip" content={ t("CodeblockExplainer")}>
              <span className="heading-explainer pt-icon pt-icon-help" />
            </Tooltip2>
          </h2>
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
