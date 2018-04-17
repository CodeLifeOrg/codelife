import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Link} from "react-router";
import {fetchData} from "datawheel-canon";
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
      currentIsland: {}
    };
  }

  componentDidMount() {

  }

  render() {

    const {lid} = this.props.params;
    const {islands} = this.props.data;
    const {t} = this.props;

    const currentIsland = islands.find(i => i.id === lid);

    const s = (a, b) => a.ordering - b.ordering;

    // list of island links
    const islandList = islands.sort(s).map(island =>
      <IslandLink key={island.id} island={island} linkContext="lessonplan" />
    );

    let levelList = [];

    if (lid) {
      levelList = currentIsland.levels.sort(s).map(l =>
        <li key={l.id}>
          <h3 key={l.id}>{`Level ${l.ordering + 1}: ${l.name}`}</h3>
          <ul>
            {l.slides.sort(s).map(s => {
              const SlideComponent = compLookup[s.type];
              return <li key={s.id} style={{backgroundColor: "white"}}><SlideComponent {...s} readOnly={true} island={currentIsland.theme}/></li>;
            })}
          </ul>
        </li>
      );
    }

    return (
      <div id="lesson-plan" className="content">
        {!lid

          // map view
          ? <div className="map u-text-center">
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

          // island view
          : <div className="content-section">
            <Link to="/lessonplan">{`<== ${t("Back to Island List")}`}</Link>
            <h1>{currentIsland.name}</h1>
            <div id="island-title">{currentIsland.description}</div>
            <h3>Content Overview:</h3>
            <div id="cheat-sheet" style={{backgroundColor: "white"}} dangerouslySetInnerHTML={{__html: currentIsland.cheatsheet}} />
            <div id="all-levels">
              <ul>
                {levelList}
              </ul>
            </div>
            <h3>Final Codeblock:</h3>
            <div id="codeblock-stub" style={{backgroundColor: "white"}}>
              <CodeBlock
                island={currentIsland}
                readOnly={true}
              />
            </div>
          </div>
        }
      </div>
    );
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
