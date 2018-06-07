import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button} from "@blueprintjs/core";
import LoadingSpinner from "components/LoadingSpinner";

import "./RuleBuilder.css";

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
    const {rules} = this.state;
    console.log(field, e.target);
    const rule = rules.find(r => r.id === Number(e.target.id));
    if (rule) rule[field] = e.target.value;
    this.setState({rules});
  }

  saveContent() {
    const {rules} = this.state;
    for (const r of rules) {
      const payload = {
        id: r.id,
        error_msg: r.error_msg,
        pt_error_msg: r.pt_error_msg,
        error_msg_2: r.error_msg_2,
        pt_error_msg_2: r.pt_error_msg_2,
        error_msg_3: r.error_msg_3,
        pt_error_msg_3: r.pt_error_msg_3
      };
      axios.post("/api/rules/save", payload).then(resp => {
        resp.status === 200 ? console.log("success") : console.log("error");
      });
    }
  }

  render() {

    const {rules} = this.state;

    if (!rules) return <LoadingSpinner />;

    const ruleItems = rules.map(r => <div key={r.id} className="rule">
      <h3 className="rule-title font-lg u-margin-top-off u-margin-bottom-xxs">{r.type}</h3>
      <p className="heading font-sm en-rule-subhead rule-subhead translation-title">English rule</p>
      <p className="heading font-sm pt-rule-subhead rule-subhead translation-title">Portuguese translation</p>
      <input className="en-rule-input rule-input pt-input" id={r.id} onChange={this.changeField.bind(this, "error_msg")} type="text" placeholder="Error Message" dir="auto" value={r.error_msg} />
      <input className="pt-rule-input rule-input pt-input translation" id={r.id} onChange={this.changeField.bind(this, "pt_error_msg")} type="text" placeholder="Error Message" dir="auto" value={r.pt_error_msg} />
      <div className="rule-group u-margin-top-sm">
        <input className="en-rule-input rule-input pt-input" id={r.id} onChange={this.changeField.bind(this, "error_msg_2")} type="text" placeholder="Error Message" dir="auto" value={r.error_msg_2} />
        <input className="pt-rule-input rule-input pt-input translation" id={r.id} onChange={this.changeField.bind(this, "pt_error_msg_2")} type="text" placeholder="Error Message" dir="auto" value={r.pt_error_msg_2} />
      </div>
      <div className="rule-group u-margin-top-sm">
        <input className="en-rule-input rule-input pt-input" id={r.id} onChange={this.changeField.bind(this, "error_msg_3")} type="text" placeholder="Error Message" dir="auto" value={r.error_msg_3} />
        <input className="pt-rule-input rule-input pt-input translation" id={r.id} onChange={this.changeField.bind(this, "pt_error_msg_3")} type="text" placeholder="Error Message" dir="auto" value={r.pt_error_msg_3} />
      </div>
    </div>);


    return (
      <div className="rulebuilder">
        {ruleItems}
        <div className="field-container">
          <Button type="button" onClick={this.saveContent.bind(this)} className="pt-button pt-intent-success font-md">Save</Button>
        </div>
      </div>
    );
  }
}

RuleBuilder = connect(state => ({
  auth: state.auth
}))(RuleBuilder);
RuleBuilder = translate()(RuleBuilder);
export default RuleBuilder;
