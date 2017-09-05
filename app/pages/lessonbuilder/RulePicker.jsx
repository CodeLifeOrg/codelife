import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

import "./RulePicker.css";

class RulePicker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rules: null,
      parentID: null
    };
  }

  componentDidMount() {
    const rules = this.extractRules(this.props.rules);
    const {parentID} = this.props;
    this.setState({rules, parentID});
  }

  componentDidUpdate() {
    if (this.props.parentID !== this.state.parentID) {
      const rules = this.extractRules(this.props.rules);
      const {parentID} = this.props;
      this.setState({rules, parentID});
    }
  }

  extractRules(rulejson) {
    let rules = [];
    if (rulejson) { 
      rules = JSON.parse(rulejson);
      for (let i = 0; i < rules.length; i++) {
        rules[i].id = i;
      }
    }
    return rules;
  }

  compileJSON() {
    const {rules} = this.state;
    const json = [];
    for (const r of rules) {
      json.push({
        type: r.type,
        needle: r.needle,
        error_msg: r.error_msg
      });
    }
    return json;
  }

  changeType(e) {
    const {rules} = this.state;
    rules[e.target.id].type = e.target.value;
    this.setState({rules});
  }

  changeValue(e) {
    const {rules} = this.state;
    rules[e.target.id].needle = e.target.value;
    this.setState({rules});
  }

  changeError(e) {
    const {rules} = this.state;
    rules[e.target.id].error_msg = e.target.value;
    this.setState({rules});
  }

  addRule() {
    const {rules} = this.state;
    const nextID = rules.length;
    rules.push({
      id: nextID,
      type: "CONTAINS",
      needle: "tag",
      error_msg: "Error Message"
    });
    this.setState({rules});
  }

  removeRule(e) {
    const {rules} = this.state;
    const newRules = [];
    let i = 0;
    for (const r of rules) {
      if (r.id !== Number(e.target.id)) {
        r.id = i;
        newRules[i] = r;
        i++;
      }
    }
    this.setState({rules: newRules});
  }

  render() {

    const {rules} = this.state;

    if (this.props.onChangeRules) this.props.onChangeRules(this.compileJSON());

    const ruleTypes = [
      <option value="CONTAINS">Contains Tag</option>,
      <option value="CSS_CONTAINS">Contains CSS</option>,
      <option value="CONTAINS_SELF_CLOSE">Contains Void Element</option>
    ];

    let ruleItems = [];
    if (rules) {
      ruleItems = rules.map(r => 
        <div className="rule-section">
          <div className="pt-select rule-select">
            <select value={r.type} id={r.id} onChange={this.changeType.bind(this)}>{ruleTypes}</select>
          </div>
          <input className="pt-input rule-needle" id={r.id} onChange={this.changeValue.bind(this)} type="text" placeholder="Tag to Match" dir="auto" value={r.needle} /> 
          <input className="pt-input rule-error" id={r.id} onChange={this.changeError.bind(this)} type="text" placeholder="Error" dir="auto" value={r.error_msg} /> 
          <button className="pt-button pt-intent-danger pt-icon-delete" type="button" id={r.id} onClick={this.removeRule.bind(this)}>Remove</button>
        </div>
      );
    }
    
    return (
      <div id="rule-picker">
        <label className="pt-label">
          Passing Rules<br/>
          {ruleItems}
          <button className="pt-button pt-intent-success pt-icon-add" type="button" onClick={this.addRule.bind(this)}>Add Rule</button>
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
