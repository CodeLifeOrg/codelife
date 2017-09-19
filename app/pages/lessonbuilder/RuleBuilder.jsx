import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";

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
      axios.post("/api/rules/save", {id: r.id, error_msg: r.error_msg, pt_error_msg: r.pt_error_msg}).then(resp =>{
        (resp.status === 200) ? console.log("success") : console.log("error");
      })
    }
  }

  render() {

    const {rules} = this.state;

    if (!rules) return <Loading />;

    const ruleItems = rules.map(r => {
      return (
        <div>
          <input className="pt-input" style={{width: "200px", margin: "5px"}} id={r.id} disabled type="text" placeholder="Rule Type" dir="auto" value={r.type} />
          <input className="pt-input" style={{width: "400px", margin: "5px"}} id={r.id} onChange={this.changeField.bind(this, "error_msg")} type="text" placeholder="Error Message" dir="auto" value={r.error_msg} />
          <input className="pt-input" style={{width: "400px", margin: "5px"}} id={r.id} onChange={this.changeField.bind(this, "pt_error_msg")} type="text" placeholder="Error Message" dir="auto" value={r.pt_error_msg} />
        </div>
      );
    });

    
    return (
      <div id="rule-builder">
        {ruleItems}
        <Button type="button" style={{margin: "10px"}} onClick={this.saveContent.bind(this)} className="pt-button pt-large pt-intent-success">Save</Button>
      </div>
    );
  }
}

RuleBuilder = connect(state => ({
  auth: state.auth
}))(RuleBuilder);
RuleBuilder = translate()(RuleBuilder);
export default RuleBuilder;
