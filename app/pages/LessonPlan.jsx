import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Link} from "react-router";
import {fetchData} from "datawheel-canon";
import {AnchorLink} from "datawheel-canon/src/components/AnchorLink";
import "./LessonPlan.css";

import CodeBlock from "components/CodeBlock";
import IslandLink from "components/IslandLink";

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
    this.state = {
      islands: [],
      currentIsland: {},
      nextIsland: null,
      prevIsland: null
    };
  }

  componentDidMount() {

  }

  render() {

    const {lid} = this.props.params;
    const {islands} = this.props.data;
    const {t} = this.props;
    // let {nextIsland, prevIsland} = this.state;

    const currentIsland = islands.find(i => i.id === lid);

    // next/prev links
    /* NOTE: This technically works, but cause the console to yell about setting state in render
       when using them. Also, the page slows down considerably. React is hard.

       currentIsland ? nextIsland = islands.find(i => i.ordering === currentIsland.ordering + 1) : null;
       currentIsland ? prevIsland = islands.find(i => i.ordering === currentIsland.ordering - 1) : null; */

    const s = (a, b) => a.ordering - b.ordering;

    // list of island links
    const islandList = islands.sort(s).map(island =>
      <IslandLink key={island.id} island={island} linkContext="lessonplan" />
    );

    let levelSections = [];
    let levelTOC = [];

    // loop through levels
    if (lid) {

      // generate level sections
      levelSections = currentIsland.levels.sort(s).map(l =>
        <section id={l.id} className="lessonplan-section anchor" key={l.id}>

          <h2 className="lessonplan-section-heading" key={l.id}>
            {`${ t("Level") } ${l.ordering + 1}: ${l.name}`}
          </h2>

          {/* slides */}
          {l.slides.sort(s).map(s => {
            const SlideComponent = compLookup[s.type];
            return <section key={s.id}>
              <SlideComponent {...s}
                readOnly={true}
                island={currentIsland.theme}/>
            </section>;
          })}

        </section>
      );

      // generate table of contents for islands
      levelTOC = currentIsland.levels.sort(s).map(l =>
        <li className="lessonplan-toc-item" key={l.id}>
          <AnchorLink className="lessonplan-toc-link link" to={l.id}>{l.name}</AnchorLink>
        </li>
      );

      // level view
      return (
        <div className="lessonplan content u-padding-top-off">

          {/* header */}
          <header className="header lessonplan-header">
            <div className="header-inner">

              {/* island title & description */}
              <div className="header-text">
                <h1 className="lessonplan-section-title font-xxl u-margin-top-off u-margin-bottom-off">
                  {currentIsland.name} {t("lesson plan")}
                </h1>
                <p className="lessonplan-section-description font-md u-margin-bottom-off">
                  {currentIsland.description}
                </p>
              </div>

              {/* table of contents */}
              <div className="header-sidebar contest-toc">
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
                      {t("Codeblock")}
                    </AnchorLink>
                  </li>

                </ol>
              </div>
            </div>
          </header>

          {/* nav */}
          <nav className="lessonplan-nav">

            {/* previous island */}
            {/* hiding for now
            {prevIsland
              // island exists; link to it
              ? <Link className="lessonplan-nav-link link" to={`/lessonplan/${prevIsland.id}`}>
                <span className="link-icon pt-icon pt-icon-arrow-left" />
                <span className="link-text">{prevIsland.name}</span>
              </Link>
              // island doesn't exist; show nothing
              : null
            } */}

            {/* island index */}
            <Link className="lessonplan-nav-link link" to="/lessonplan">
              {/* NOTE: replace arrow-left icon with map icon if next/prev links are added */}
              <span className="link-icon pt-icon pt-icon-arrow-left" />
              <span className="link-text">{t("Lessonplan.IslandIndex")}</span>
            </Link>

          </nav>


          {/* main content */}
          <div className="fullwidth-container">
            <div className="content">

              {/* overview / cheatsheet */}
              <section className="lessonplan-section anchor" id="overview" >
                <h2 className="lessonplan-subhead">{t("Lessonplan.Overview")}</h2>
                <div dangerouslySetInnerHTML={{__html: currentIsland.cheatsheet}} />
              </section>

              {/* levels */}
              {levelSections}

              {/* codeblock */}
              <section className="lessonplan-section anchor" id="codeblock">
                <h2 className="lessonplan-subhead">{t("Codeblock")}</h2>
                <CodeBlock
                  island={currentIsland}
                  readOnly={true} />
              </section>
            </div>
          </div>
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
              <h1 className="lessonplan-heading u-margin-bottom-off">
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
        </div>
      );
    }
  }
}

// whut

LessonPlan.need = [
  fetchData("islands", "/api/islands/nested?lang=<i18n.locale>")
];

const mapStateToProps = state => ({
  auth: state.auth,
  data: state.data
});

LessonPlan = connect(mapStateToProps)(LessonPlan);
export default translate()(LessonPlan);
