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
    const rules = JSON.parse(this.props.rules);
    for (let i = 0; i < rules.length; i++) {
      rules[i].id = i;
    }
    this.setState({rules});   
  }

  changeType(e) {
    const {rules} = this.state;
    rules[e.target.id].type = e.target.value;
    // TODO: again, i'm storing state in a js object that doesn't cause a state change
    // so I'm forced to refresh. ask dave if there's a better way to accomplish this
    this.forceUpdate();
  }

  changeValue(e) {
    const {rules} = this.state;
    rules[e.target.id].needle = e.target.value;
    this.forceUpdate();
  }

  changeError(e) {
    const {rules} = this.state;
    rules[e.target.id].error_msg = e.target.value;
    this.forceUpdate();
  }

  render() {

    const {rules} = this.state;

    if (!rules) return <Loading />;

    const ruleTypes = [
      <option value="CONTAINS">Contains Tag</option>,
      <option value="CSS_CONTAINS">Contains CSS</option>,
      <option value="CONTAINS_SELF_CLOSE">Contains Void Element</option>
    ];

    const ruleItems = rules.map(r => 
      <div className="rule-section">
        <div className="pt-select rule-select">
          <select value={r.type} id={r.id} onChange={this.changeType.bind(this)}>{ruleTypes}</select>
        </div>
        <input className="pt-input rule-needle" id={r.id} onChange={this.changeValue.bind(this)} type="text" placeholder="Tag to Match" dir="auto" value={r.needle} /> 
        <input className="pt-input rule-error" id={r.id} onChange={this.changeError.bind(this)} type="text" placeholder="Error" dir="auto" value={r.error_msg} /> 
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
