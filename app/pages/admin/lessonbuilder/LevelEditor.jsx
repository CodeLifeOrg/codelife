import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import LoadingSpinner from "components/LoadingSpinner";
import {Button, Toaster, Position, Intent} from "@blueprintjs/core";

import "./LevelEditor.css";

class LevelEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    const {data} = this.props;
    this.setState({data});
  }

  componentDidUpdate() {
    if (this.props.data.id !== this.state.data.id) {
      this.setState({data: this.props.data});
    }
  }

  changeField(field, e) {
    const {data} = this.state;
    data[field] = e.target.value;
    this.setState({data});
  }

  saveContent() {
    const {data} = this.state;
    if (this.props.reportSave) this.props.reportSave(data);
    axios.post("/api/builder/levels/save", data).then(resp => {
      if (resp.status === 200) {
        const toast = Toaster.create({className: "levelSave", position: Position.TOP_CENTER});
        toast.show({message: "Level saved.", intent: Intent.SUCCESS});
      }
      else {
        const toast = Toaster.create({className: "levelFail", position: Position.TOP_CENTER});
        toast.show({message: "Save Error.", intent: Intent.DANGER});
      }
    });
  }

  render() {

    const {data} = this.state;

    if (!data) return <LoadingSpinner />;

    return (
      <div id="level-editor">
        <div className="item-editor-inner">
          <Button type="button" onClick={this.saveContent.bind(this)} className="pt-button pt-intent-success">Save</Button>
          <label className="pt-label">
            id
            <span className="pt-text-muted"> (required, auto-generated)</span>
            <input className="pt-input" disabled type="text" placeholder="Enter a unique level id e.g. level-1" dir="auto" value={data.id} />
          </label>
          <div className="input-block">
            <label className="pt-label">
              Name
              <input className="pt-input" onChange={this.changeField.bind(this, "name")} type="text" placeholder="Enter the name of this Island" dir="auto" value={data.name}/>
            </label>
            <label className="pt-label">
              pt Name  🇧🇷
              <input className="pt-input" onChange={this.changeField.bind(this, "pt_name")} type="text" placeholder="Enter the name of this Island" dir="auto" value={data.pt_name}/>
            </label>
          </div>
          <div className="input-block">
            <label className="pt-label">
              Description
              <input className="pt-input" onChange={this.changeField.bind(this, "description")} type="text" placeholder="Describe this island in a few words" dir="auto" value={data.description} />
            </label>
            <label className="pt-label">
              pt Description  🇧🇷
              <input className="pt-input" onChange={this.changeField.bind(this, "pt_description")} type="text" placeholder="Describe this island in a few words" dir="auto" value={data.pt_description} />
            </label>
          </div>
        </div>
        <div className="admin-actions-bar">
          <button className="button" onClick={this.saveContent.bind(this)}>
            Save
          </button>
        </div>
      </div>
    );
  }
}

LevelEditor = connect(state => ({
  auth: state.auth
}))(LevelEditor);
LevelEditor = translate()(LevelEditor);
export default LevelEditor;
