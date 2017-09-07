import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import RulePicker from "pages/lessonbuilder/RulePicker";
import QuizPicker from "pages/lessonbuilder/QuizPicker";
import CodeEditor from "components/CodeEditor";
import {Button, Dialog} from "@blueprintjs/core";

import ImageText from "components/slidetypes/ImageText";
import InputCode from "components/slidetypes/InputCode";
import Quiz from "components/slidetypes/Quiz";
import TextCode from "components/slidetypes/TextCode";
import TextImage from "components/slidetypes/TextImage";
import TextText from "components/slidetypes/TextText";
import RenderCode from "components/slidetypes/RenderCode";
import CheatSheet from "components/slidetypes/CheatSheet";

//import RichTextEditor from "react-rte/lib/RichTextEditor";

import "./SlideEditor.css";

const compLookup = {TextImage, ImageText, TextText, TextCode, InputCode, RenderCode, Quiz, CheatSheet};

class SlideEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      isOpen: false
    };
  }

  componentDidMount() {
    const {data} = this.props;
    this.setState({data});   
  }

  componentDidUpdate() {
    if (this.props.data.id !== this.state.data.id) {
      if (["TextCode", "RenderCode", "InputCode"].indexOf(this.props.data.type) !== -1) {
        if (this.editor) {
          this.editor.getWrappedInstance().setEntireContents(this.props.data.htmlcontent2);
        }
      }
      this.setState({data: this.props.data});
    }
  }

  changeType(e) {
    const {data} = this.state;
    data.type = e.target.value;
    this.setState({data});    
  }

  changeID(e) {
    const {data} = this.state;
    data.id = e.target.value;
    // TODO: confirm that changing this doesn't mess with state in Update 
    this.setState({data});    
  }

  changeTitle(e) {
    const {data} = this.state;
    data.title = e.target.value;
    this.setState({data});
  }

  changeHTML1(e) {
    const {data} = this.state;
    data.htmlcontent1 = e.target.value;
    this.setState({data});
  }

  changeHTML2(e) {
    const {data} = this.state;
    data.htmlcontent2 = e.target.value;
    this.setState({data});
  }

  onChangeText(t) {
    const {data} = this.state;
    data.htmlcontent2 = t;
    this.setState({data});
  }

  previewSlide() {
    this.setState({isOpen: !this.state.isOpen});
  }

  closePreview() {
    this.setState({isOpen: false});
  }

  saveSlide() {
    console.log(this.state.data);
  }

  onChangeQuiz(json) {
    
  }

  onChangeRules(json) {
    
  }

  render() {

    const {data} = this.state;

    if (!data) return <Loading />;

    const showQuiz = data.type === "Quiz";
    const showRules = data.type === "InputCode";
    const showContent2 = ["TextImage", "Quiz", "CheatSheet"].indexOf(data.type) === -1;
    const showAce2 = ["TextCode", "RenderCode", "InputCode"].indexOf(data.type) !== -1;
    const SlideComponent = compLookup[data.type];

    return (
      <div id="slide-editor">
        
        { /* <RichTextEditor /> */ }

        <Dialog
          isOpen={this.state.isOpen}
          onClose={this.closePreview.bind(this)}
          title={data.title}
          style={{
            height: "80vh",
            maxHeight: "1000px",
            width: "90%"
          }}
        >
          <div id="slide" className="pt-dialog-body">
            <SlideComponent {...data} />
          </div>
        </Dialog>

        <label className="pt-label">
          id
          <span className="pt-text-muted"> (required, unique)</span>
          <input className="pt-input" onChange={this.changeID.bind(this)} type="text" placeholder="Enter a unique slide id e.g. slide-1" dir="auto" value={data.id} />
        </label>
        <label className="pt-label">
          Title
          <span className="pt-text-muted"> (required)</span>
          <input className="pt-input" onChange={this.changeTitle.bind(this)} type="text" placeholder="Enter a title for this slide" dir="auto" value={data.title} />
        </label>
        <label className="pt-label">
          Type
          <span className="pt-text-muted"> (required)</span>
          <div className="pt-select">
            <select value={data.type} onChange={this.changeType.bind(this)}>
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
          htmlcontent1
          <textarea className="pt-input pt-fill" onChange={this.changeHTML1.bind(this)} rows="10" type="text" placeholder="htmlcontent1" dir="auto" value={data.htmlcontent1} />
        </label>
        { showContent2
          ? <label className="pt-label">
            htmlcontent2
            { showAce2 
              ? <CodeEditor style={{height: "400px"}} onChangeText={this.onChangeText.bind(this)} initialValue={data.htmlcontent2} ref={c => this.editor = c}/> 
              : <textarea className="pt-input pt-fill" onChange={this.changeHTML2.bind(this)} rows="10" type="text" placeholder="htmlcontent2" dir="auto" value={data.htmlcontent2} />
            }
          </label> : null
        }
        { showQuiz ? <QuizPicker quiz={data.quizjson} parentID={data.id} onChangeQuiz={this.onChangeQuiz.bind(this)} /> : null }
        { showRules ? <RulePicker rules={data.rulejson} parentID={data.id} onChangeRules={this.onChangeRules.bind(this)} /> : null }
        <Button type="button" onClick={this.previewSlide.bind(this)} className="pt-button pt-large pt-intent-warning">Preview</Button>&nbsp;
        <Button type="button" onClick={this.saveSlide.bind(this)} className="pt-button pt-large pt-intent-success">Save</Button>
      </div>
    );
  }
}

SlideEditor = connect(state => ({
  auth: state.auth
}))(SlideEditor);
SlideEditor = translate()(SlideEditor);
export default SlideEditor;
