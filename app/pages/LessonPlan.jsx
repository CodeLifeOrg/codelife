import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Link} from "react-router";
import Loading from "components/Loading";
import {fetchData} from "datawheel-canon";
import Slide from "pages/Slide.jsx";
import "./LessonPlan.css";

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

    const currentIsland = islands.find(i => i.id === lid);

    if (lid && !currentIsland) return <Loading />;

    const islandList = islands.map(i => 
      <li key={i.id}><Link to={`/lessonplan/${i.id}`}>{i.name}</Link></li>
    );

    console.log(currentIsland);

    const levelList = currentIsland.levels.map(l => 
      <li key={l.id}>
        <h3 key={l.id}>{`Level ${l.ordering + 1}: ${l.name}`}</h3>
        <ul>
          {l.slides.map(s => 
            <li key={s.id}>{s.title}</li>
          )}
        </ul>
      </li>
    );

    return (
      <div id="lesson-plan" className="content">
        {!lid 
          ? <div id="island-list"> 
            <h3>Choose an Island</h3>
            <ul>
              {islandList}
            </ul>
          </div>
          : <div id="island-view">
            <h1>{currentIsland.name}</h1>
            <div id="island-title">{currentIsland.description}</div>
            <h3>Content Overview:</h3>
            <div id="cheat-sheet" style={{backgroundColor: "white"}} dangerouslySetInnerHTML={{__html: currentIsland.cheatsheet}} />
            <div id="all-levels">
              <ul>
                {levelList}
              </ul>
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
