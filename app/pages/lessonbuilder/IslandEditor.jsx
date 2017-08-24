import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import CodeEditor from "components/CodeEditor";
import RulePicker from "pages/lessonbuilder/RulePicker";

import "./IslandEditor.css";

class IslandEditor extends Component {

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
      this.editor.getWrappedInstance().setEntireContents(this.props.data.initialcontent);
      this.setState({data: this.props.data});
    }
  }

  render() {

    const {data} = this.state;

    if (!data) return <Loading />;
    
    return (
      <div id="island-editor">
        <label className="pt-label">
          id
          <span className="pt-text-muted"> (unique)</span>
          <input className="pt-input" type="text" placeholder="Enter a unique page id e.g. island-1" dir="auto" value={data.id} />
        </label>
        <label className="pt-label">
          Name
          <input className="pt-input" type="text" placeholder="Enter the name of this Island" dir="auto" value={data.name}/>
        </label>
        <label className="pt-label">
          Description
          <input className="pt-input" type="text" placeholder="Describe this island in a few words" dir="auto" value={data.description} />
        </label>
        <label className="pt-label">
          Cheat Sheet
          <textarea className="pt-input pt-fill" type="text" rows="15" placeholder="Enter a summary of the concepts learned in this lesson" dir="auto" value={data.cheatsheet} />
        </label>
        <label className="pt-label">
          Final Codeblock Prompt
          <textarea className="pt-input pt-fill" type="text" rows="10" placeholder="Enter instructions for this island's final test" dir="auto" value={data.prompt} />
        </label>
        <label className="pt-label">
          Initial Codeblock State<br/><br/>
          <CodeEditor initialValue={data.initialcontent} ref={c => this.editor = c}/>       
        </label>
        <RulePicker rules={data.rulejson} />
        <label className="pt-label">
          Victory Text
          <textarea className="pt-input pt-fill" type="text" placeholder="Enter congratulatory text for when this island is completed" dir="auto" value={data.victory} />
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
