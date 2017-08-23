import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import CodeEditor from "components/CodeEditor";
import {Select} from "@blueprintjs/core";

import "./SlideEditor.css";

class SlideEditor extends Component {

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
      //this.editor.getWrappedInstance().setEntireContents(this.props.data.initialcontent);
      this.setState({data: this.props.data});
    }
  }

  render() {

    const {data} = this.state;

    if (!data) return <Loading />;
    
    return (
      <div id="slide-editor">
        <label className="pt-label">
          id
          <span className="pt-text-muted"> (required, unique)</span>
          <input className="pt-input" type="text" placeholder="Enter a unique slide id e.g. slide-1" dir="auto" value={data.id} />
        </label>
        <label className="pt-label">
          Type
          <span className="pt-text-muted"> (required)</span>
          <div className="pt-select">
            <select value={data.type} >
              <option value="TextImage">Text Left, Image Right</option>
              <option value="ImageText">Image Left, Text Right</option>
              <option value="TextCode">Text Left, Code Right</option>
              <option value="TextText">Text Left, Text Right</option>
              <option value="RenderCode">Code Example (non blocking)</option>
              <option value="InputCode">Code Input (blocking test)</option>
              <option value="Quiz">Quiz</option>
              <option value="CheatSheet">Cheat Sheet</option>
            </select>
          </div>
        </label>
        <label className="pt-label">
          Title
          <span className="pt-text-muted"> (required)</span>
          <input className="pt-input" type="text" placeholder="Enter a title for this slide" dir="auto" value={data.title} />
        </label>
        <label className="pt-label">
          htmlcontent1
          <span className="pt-text-muted"> (required)</span>
          <textarea className="pt-input pt-fill" rows="10" type="text" placeholder="Describe this island in a few words" dir="auto" value={data.htmlcontent1} />
        </label>
        <label className="pt-label">
          htmlcontent2
          <span className="pt-text-muted"> (optional)</span>
          <textarea className="pt-input pt-fill" rows="10" type="text" placeholder="Describe this island in a few words" dir="auto" value={data.htmlcontent2} />
        </label>
        <label className="pt-label">
          quizjson
          { /* todo make this different for different type selections */ }
          <span className="pt-text-muted"> (optional)</span>
          <textarea className="pt-input pt-fill" rows="10" type="text" placeholder="Describe this island in a few words" dir="auto" value={data.quizjson} />
        </label>
        <label className="pt-label">
          rulejson
          { /* todo make this different for different type selections */ }
          <span className="pt-text-muted"> (optional)</span>
          <textarea className="pt-input pt-fill" rows="10" type="text" placeholder="Describe this island in a few words" dir="auto" value={data.rulejson} />
        </label>
      </div>
    );
  }
}

SlideEditor = connect(state => ({
  auth: state.auth
}))(SlideEditor);
SlideEditor = translate()(SlideEditor);
export default SlideEditor;
