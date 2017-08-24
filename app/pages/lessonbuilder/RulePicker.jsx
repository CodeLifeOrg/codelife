import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import CodeEditor from "components/CodeEditor";

import "./RulePicker.css";

class RulePicker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rules: null
    };
  }

  componentDidMount() {
    const {rules} = this.props;
    this.setState({rules});   
  }

  render() {

    const {rules} = this.state;

    if (!rules) return <Loading />;

    const ruleTypes = [
      <option value="CONTAINS">Contains Tag</option>,
      <option value="CSS_CONTAINS">Contains CSS</option>,
      <option value="CONTAINS_SELF_CLOSE">Contains Void Element</option>
    ];

    const ruleItems = JSON.parse(rules).map(r => 
      <div className="rule-section">
        <div className="pt-select rule-select">
          <select value={r.type}>{ruleTypes}</select>
        </div>
        <input className="pt-input rule-needle" type="text" placeholder="Tag to Match" dir="auto" value={r.needle} /> 
        <input className="pt-input rule-error" type="text" placeholder="Error" dir="auto" value={r.error_msg} /> 
      </div>
    );
    
    return (
      <div id="rule-picker">
        <label className="pt-label">
          Passing Rules
          {ruleItems}
        </label>
      </div>
    );
  }
}

RulePicker = connect(state => ({
  auth: state.auth
}))(RulePicker);
RulePicker = translate()(RulePicker);
export default RulePicker;
