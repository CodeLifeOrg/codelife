import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

import "./RulePicker.css";

class RulePicker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      rules: null,
      ruleTypes: null,
      parentID: null
    };
  }

  componentDidMount() {
    axios.get("/api/rules/all").then(resp => {
      const {data, parentID} = this.props;
      const rules = this.extractRules(data.rulejson);
      const ruleTypes = resp.data;
      this.setState({data, rules, ruleTypes, parentID});
    });
  }

  componentDidUpdate() {
    if (this.props.parentID !== this.state.parentID) {
      const {data, parentID} = this.props;
      const rules = this.extractRules(data.rulejson);
      this.setState({data, rules, parentID});
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

  updateJSON() {
    const {data, rules} = this.state;
    const json = [];
    if (rules) {
      for (const r of rules) {
        json.push({
          type: r.type,
          needle: r.needle
        });
      }
    }
    data.rulejson = JSON.stringify(json);
    this.setState({data});
  }

  changeType(e) {
    const {rules} = this.state;
    rules[e.target.id].type = e.target.value;
    this.setState({rules}, this.updateJSON.bind(this));
  }

  changeValue(e) {
    const {rules} = this.state;
    rules[e.target.id].needle = e.target.value;
    this.setState({rules}, this.updateJSON.bind(this));
  }

  addRule() {
    const {rules} = this.state;
    const nextID = rules.length;
    rules.push({
      id: nextID,
      type: "CONTAINS",
      needle: "tag"
    });
    this.setState({rules}, this.updateJSON.bind(this));
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
    this.setState({rules: newRules}, this.updateJSON.bind(this));
  }

  render() {

    const {rules, ruleTypes} = this.state;

    if (!rules || !ruleTypes) return null;

    const ruleTypeList = ruleTypes.map(r => <option key={r.type} value={r.type}>{r.type}</option>);

    let ruleItems = [];
    if (rules) {
      ruleItems = rules.map(r => 
        <div className="rule-section">
          <div className="pt-select rule-select" style={{width: "210px"}}>
            <select value={r.type} id={r.id} onChange={this.changeType.bind(this)}>{ruleTypeList}</select>
          </div>
          <input className="pt-input rule-needle" id={r.id} onChange={this.changeValue.bind(this)} type="text" placeholder="Tag to Match" dir="auto" value={r.needle} />
          <button style={{marginTop: "3px"}} className="pt-button pt-intent-danger pt-icon-delete" type="button" id={r.id} onClick={this.removeRule.bind(this)}></button>          
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
