import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Link} from "react-router";
import Loading from "components/Loading";
import {fetchData} from "datawheel-canon";
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

    console.log(islands);

    const islandList = islands.map(i => 
      <li key={i.id}><Link to={`/lessonplan/${i.id}`}>{i.name}</Link></li>
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
            i am island {lid}
          </div>
        }
      </div>
    );
  }
}

LessonPlan.need = [
  fetchData("islands", "/api/islands/nested")
];

const mapStateToProps = state => ({
  auth: state.auth,
  data: state.data
});

LessonPlan = connect(mapStateToProps)(LessonPlan);
export default translate()(LessonPlan);
