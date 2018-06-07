import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Link} from "react-router";
import {fetchData} from "datawheel-canon";
import {AnchorLink} from "datawheel-canon/src/components/AnchorLink";
import "./LessonPlan.css";

import CodeEditor from "components/CodeEditor/CodeEditor";
import IslandLink from "components/IslandLink";
import CTA from "components/CTA";

import ImageText from "components/slidetypes/ImageText";
import InputCode from "components/slidetypes/InputCode";
import Quiz from "components/slidetypes/Quiz";
import TextCode from "components/slidetypes/TextCode";
import TextImage from "components/slidetypes/TextImage";
import TextText from "components/slidetypes/TextText";
import RenderCode from "components/slidetypes/RenderCode";
import CheatSheet from "components/slidetypes/CheatSheet";

const compLookup = {TextImage, ImageText, TextText, TextCode, InputCode, RenderCode, Quiz, CheatSheet};

class LessonPlan extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {lid} = this.props.params;
    const {islands} = this.props.data;
    const {auth, t} = this.props;

    const currentIsland = islands.find(i => i.id === lid);
    const nextIsland = currentIsland ? islands.find(i => i.ordering === currentIsland.ordering + 1) : null;
    const prevIsland = currentIsland ? islands.find(i => i.ordering === currentIsland.ordering - 1) : null;

    // list of island links
    const islandList = islands.map(island =>
      <IslandLink key={island.id} island={island} linkContext="lessonplan" />
    );

    let levelSections = [];
    let levelTOC = [];



    // loop through levels
    if (lid) {

      // generate level sections
      levelSections = currentIsland.levels.map(l =>
        <section id={l.id} className="lessonplan-section anchor" key={l.id}>

          <h2 className="lessonplan-section-heading font-xl" key={l.id}>
            {`${ t("Level") } ${l.ordering + 1}: ${l.name}`}
          </h2>

          {/* loop through slides */}
          {l.slides.map(s => {
            const SlideComponent = compLookup[s.type];
            return <section className={`lessonplan-slide ${s.type}-lessonplan-slide`} key={s.id}>
              <SlideComponent {...s}
                readOnly={true}
                suppressJS={true}
                island={currentIsland.theme} />
            </section>;
          })}

        </section>
      );

      // generate table of contents for islands
      levelTOC = currentIsland.levels.map(l =>
        <li className="lessonplan-toc-item" key={l.id}>
          <AnchorLink className="lessonplan-toc-link link" to={l.id}>{l.name}</AnchorLink>
        </li>
      );

      // level view
      return (
        <div className={`lessonplan content u-padding-top-off ${currentIsland.theme}`}>

          {/* header */}
          <header id="header" className="header lessonplan-header">
            <div className="header-inner">

              {/* island title & description */}
              <div className="header-text">
                <div className="lessonplan-header-image-container">
                  <div className="lessonplan-header-image" />
                </div>
                <h1 className="lessonplan-section-title font-xxl u-margin-top-off u-margin-bottom-off">
                  {currentIsland.name} {t("lesson plan")}
                </h1>
                <p className="lessonplan-section-description font-md u-margin-bottom-off">
                  {currentIsland.description}
                </p>
              </div>

              {/* table of contents */}
              <div className="header-sidebar lessonplan-toc">
                <h2 className="lessonplan-toc-heading font-md u-margin-top-off">{t("Table of contents")}</h2>

                {/* table of contents numbered list */}
                <ol className="lessonplan-toc-list">

                  {/* overview */}
                  <li className="lessonplan-toc-item">
                    <AnchorLink className="lessonplan-toc-link link" to="overview">
                      {t("Lessonplan.Overview")}
                    </AnchorLink>
                  </li>

                  {/* levels */}
                  { levelTOC }

                  {/* codeblock */}
                  <li className="lessonplan-toc-item">
                    <AnchorLink className="lessonplan-toc-link link" to="codeblock">
                      {t("Lessonplan.Codeblock")}
                    </AnchorLink>
                  </li>

                </ol>
              </div>
            </div>
          </header>

          {/* header nav */}
          <nav className="lessonplan-nav header-lessonplan-nav">

            {/* previous island */}
            {prevIsland &&
              <Link className="lessonplan-nav-link link" to={`/lessonplan/${prevIsland.id}`}>
                <span className="link-icon pt-icon pt-icon-arrow-left" />
                <span className="link-text">{prevIsland.name}</span>
              </Link>
            }

            {/* island index */}
            <Link className="lessonplan-nav-link link" to="/lessonplan">
              {/* NOTE: replace arrow-left icon with map icon if next/prev links are added */}
              <span className="link-icon pt-icon pt-icon-map" />
              <span className="link-text">{t("Lessonplan.IslandIndex")}</span>
            </Link>

            {/* next island */}
            {nextIsland &&
              <Link className="lessonplan-nav-link link" to={`/lessonplan/${nextIsland.id}`}>
                <span className="link-text">{nextIsland.name}</span>
                <span className="link-icon pt-icon pt-icon-arrow-right" />
              </Link>
            }

          </nav>


          {/* main content */}
          <div className="fullwidth-container">
            <div className="content">

              {/* overview / cheatsheet */}
              <section className="overview-lessonplan-section lessonplan-section anchor" id="overview" >
                <h2 className="lessonplan-section-heading font-xl">{t("Lessonplan.Overview")}</h2>
                <div dangerouslySetInnerHTML={{__html: currentIsland.cheatsheet}} />
              </section>

              {/* levels */}
              {levelSections}

              {/* codeblock */}
              <section className="codeblock-lessonplan-section lessonplan-section anchor" id="codeblock" >
                <h2 className="lessonplan-section-heading font-xl">{t("Lessonplan.Codeblock")}</h2>
                <div dangerouslySetInnerHTML={{__html: currentIsland.prompt}} />
                <CodeEditor
                  initialValue={currentIsland.initialcontent}
                  readOnly={true}
                />
              </section>
            </div>
          </div>


          {/* footer nav */}
          <nav className="lessonplan-nav footer-lessonplan-nav">

            {/* previous island */}
            {prevIsland &&
              <Link className="lessonplan-nav-link link" to={`/lessonplan/${prevIsland.id}`}>
                <span className="link-icon pt-icon pt-icon-arrow-left" />
                <span className="link-text">{prevIsland.name}</span>
              </Link>
            }

            {/* back to top */}
            <AnchorLink className="lessonplan-nav-link link" to="header">
              <span className="link-icon pt-icon pt-icon-arrow-up" />
              <span className="link-text">{t("Back to top")}</span>
            </AnchorLink>

            {/* island index */}
            <Link className="lessonplan-nav-link link" to="/lessonplan">
              {/* NOTE: replace arrow-left icon with map icon if next/prev links are added */}
              <span className="link-icon pt-icon pt-icon-map" />
              <span className="link-text">{t("Lessonplan.IslandIndex")}</span>
            </Link>

            {/* next island */}
            {nextIsland &&
              <Link className="lessonplan-nav-link link" to={`/lessonplan/${nextIsland.id}`}>
                <span className="link-text">{nextIsland.name}</span>
                <span className="link-icon pt-icon pt-icon-arrow-right" />
              </Link>
            }

          </nav>

          {/* display CTA if logged out */}
          { !auth.user ? <CTA context="lessonplan" /> : null }
        </div>
      );
    }

    // map view
    else {
      return (
        <div className="lessonplan content">
          <div className="map u-text-center">
            {/* heading */}
            <div className="map-heading content-section">
              <h1 className="lessonplan-heading font-xxl u-margin-bottom-off">
                {t("Lessonplan.Headline")}
              </h1>
              <h2 className="font-md u-margin-bottom-off">
                {t("IslandMap.SelectIsland")}
              </h2>
            </div>
            {/* list of islands */}
            <div className="map-list content-section">
              { islandList }
            </div>
          </div>

          {/* display CTA if logged out */}
          { !auth.user ? <CTA context="lessonplan" /> : null }
        </div>
      );
    }
  }
}

LessonPlan.need = [
  fetchData("islands", "/api/islands/nested?lang=<i18n.locale>")
];

const mapStateToProps = state => ({
  auth: state.auth,
  data: state.data
});

LessonPlan = connect(mapStateToProps)(LessonPlan);
export default translate()(LessonPlan);
