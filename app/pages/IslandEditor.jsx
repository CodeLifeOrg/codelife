import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tree} from "@blueprintjs/core";
import Loading from "components/Loading";

import "./IslandEditor.css";

class IslandEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});   
  }

  render() {

    const {data} = this.props;

    if (!data) return <Loading />;
    
    return (
      <div id="island-editor">
        <label className="pt-label">
          id
          <span className="pt-text-muted"> (required, unique)</span>
          <input className="pt-input" type="text" placeholder="id" dir="auto" value={data.id} />
        </label>
        <label className="pt-label">
          Name
          <span className="pt-text-muted"> (required)</span>
          <input className="pt-input" type="text" placeholder="name" dir="auto" value={data.name}/>
        </label>
        <label className="pt-label">
          Description
          <span className="pt-text-muted"> (required)</span>
          <textarea className="pt-input pt-fill" type="text" placeholder="desc" dir="auto" value={data.description} />
        </label>
        <label className="pt-label">
          Final Puzzle Prompt
          <span className="pt-text-muted"> (required)</span>
          <textarea className="pt-input pt-fill" type="text" placeholder="prompt" dir="auto" value={data.prompt} />
        </label>
        <label className="pt-label">
          Victory Text
          <span className="pt-text-muted"> (required)</span>
          <textarea className="pt-input pt-fill" type="text" placeholder="victory" dir="auto" value={data.victory} />
        </label> 
      </div>
    );
  }
}

IslandEditor = connect(state => ({
  auth: state.auth
}))(IslandEditor);
IslandEditor = translate()(IslandEditor);
export default IslandEditor;
