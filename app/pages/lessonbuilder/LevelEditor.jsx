import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import {Button} from "@blueprintjs/core";

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

  onChangeID(e) {
    const {data} = this.state;
    data.id = e.target.value;
    if (this.props.reportChange) this.props.reportChange(data);
    this.setState({data});
  }

  onChangeName(e) {
    const {data} = this.state;
    data.name = e.target.value;
    if (this.props.reportChange) this.props.reportChange(data);
    this.setState({data});
  }

  onChangeDescription(e) {
    const {data} = this.state;
    data.description = e.target.value;
    if (this.props.reportChange) this.props.reportChange(data);
    this.setState({data});
  }


  render() {

    const {data} = this.state;

    if (!data) return <Loading />;
    
    return (
      <div id="level-editor">
        <label className="pt-label">
          id
          <span className="pt-text-muted"> (unique)</span>
          <input className="pt-input" onChange={this.onChangeID.bind(this)} type="text" placeholder="Enter a unique level id e.g. level-1" dir="auto" value={data.id} />
        </label>
        <label className="pt-label">
          Name
          <input className="pt-input" onChange={this.onChangeName.bind(this)} type="text" placeholder="Enter the name of this Island" dir="auto" value={data.name}/>
        </label>
        <label className="pt-label">
          Description
          <input className="pt-input" onChange={this.onChangeDescription.bind(this)} type="text" placeholder="Describe this island in a few words" dir="auto" value={data.description} />
        </label>
        <Button type="button" className="pt-button pt-large pt-intent-success">Save</Button>
      </div>
    );
  }
}

LevelEditor = connect(state => ({
  auth: state.auth
}))(LevelEditor);
LevelEditor = translate()(LevelEditor);
export default LevelEditor;
