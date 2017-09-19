import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tree} from "@blueprintjs/core";
import Loading from "components/Loading";
import IslandEditor from "pages/lessonbuilder/IslandEditor";
import LevelEditor from "pages/lessonbuilder/LevelEditor";
import SlideEditor from "pages/lessonbuilder/SlideEditor";
import CtxMenu from "pages/lessonbuilder/CtxMenu";


class RuleBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      rules: null
    };
  }

  componentDidMount() {
    axios.get("/api/rules/all").then(resp => {
      const mounted = true;
      const rules = resp.data;
      this.setState({mounted, rules});
    });
  }

  changeField(field, e) {
    /*const {data} = this.state;
    data[field] = e.target.value;
    this.setState({data});*/
  }

  render() {

    const {rules} = this.state;

    if (!rules) return <Loading />;

    const ruleItems = rules.map(r => {
      return (
        <div>
          <input className="pt-input" style={{width: "200px", margin: "3px"}} id={r.id} disabled type="text" placeholder="Rule Type" dir="auto" value={r.type} />
          <input className="pt-input" style={{width: "400px", margin: "3px"}} id={r.id} onChange={this.changeField.bind(this, "error_msg")} type="text" placeholder="Error Message" dir="auto" value={r.error_msg} />
          <input className="pt-input" style={{width: "400px", margin: "3px"}} id={r.id} onChange={this.changeField.bind(this, "pt_error_msg")} type="text" placeholder="Error Message" dir="auto" value={r.pt_error_msg} />
        </div>
      );
    });

    
    return (
      <div id="rule-builder">
        {ruleItems}
      </div>
    );
  }
}

RuleBuilder = connect(state => ({
  auth: state.auth
}))(RuleBuilder);
RuleBuilder = translate()(RuleBuilder);
export default RuleBuilder;
