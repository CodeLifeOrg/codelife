import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";

import "./GlossaryBuilder.css";

class GlossaryBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      words: []
    };
  }

  componentDidMount() {
    const words = this.props.glossary.map(g => Object.assign({}, g));
    this.setState({words});
  }

  changeField(field, e) {
    /*const {rules} = this.state;
    console.log(field, e.target);
    const rule = rules.find(r => r.id === Number(e.target.id));
    if (rule) rule[field] = e.target.value;
    this.setState({rules});*/
  }

  saveContent() {
    /*const {rules} = this.state;
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
    }*/
  }

  render() {

    const {words} = this.state;

    if (!words) return <Loading />;

    console.log(words);

    const wordItems = words.map(w => <div key={w.id} className="word">
      <input className="pt-input" id={w.id} onChange={this.changeField.bind(this, "word")} type="text" placeholder="Term" dir="auto" value={w.word} />
      <input className="pt-input" id={w.id} onChange={this.changeField.bind(this, "definition")} type="text" placeholder="Definition" dir="auto" value={w.definition} />
      <input className="pt-input" id={w.id} onChange={this.changeField.bind(this, "pt_word")} type="text" placeholder="Palavra" dir="auto" value={w.pt_word} />
      <input className="pt-input" id={w.id} onChange={this.changeField.bind(this, "pt_definition")} type="text" placeholder="Definição" dir="auto" value={w.definition} />
    </div>);


    return (
      <div id="GlossaryBuilder">
        {wordItems}
        <Button type="button" onClick={this.saveContent.bind(this)} className="pt-button pt-fill pt-large pt-intent-success">Save</Button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  glossary: state.glossary
});

GlossaryBuilder = connect(mapStateToProps)(GlossaryBuilder);
export default translate()(GlossaryBuilder);