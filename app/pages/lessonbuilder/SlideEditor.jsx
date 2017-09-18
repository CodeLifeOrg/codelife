import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import RulePicker from "pages/lessonbuilder/RulePicker";
import QuizPicker from "pages/lessonbuilder/QuizPicker";
import CodeEditor from "components/CodeEditor";
import {Button, Dialog, Toaster, Position, Intent} from "@blueprintjs/core";

import ImageText from "components/slidetypes/ImageText";
import InputCode from "components/slidetypes/InputCode";
import Quiz from "components/slidetypes/Quiz";
import TextCode from "components/slidetypes/TextCode";
import TextImage from "components/slidetypes/TextImage";
import TextText from "components/slidetypes/TextText";
import RenderCode from "components/slidetypes/RenderCode";
import CheatSheet from "components/slidetypes/CheatSheet";

import QuillWrapper from "pages/lessonbuilder/QuillWrapper";

import "./SlideEditor.css";

const compLookup = {TextImage, ImageText, TextText, TextCode, InputCode, RenderCode, Quiz, CheatSheet};

class SlideEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      img: null,
      pt_img: null,
      isOpen: false,
      pt_isOpen: false
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
        if (this.pt_editor) {
          this.pt_editor.getWrappedInstance().setEntireContents(this.props.data.pt_htmlcontent2);
        }
      }
      this.setState({data: this.props.data});
    }
  }

  changeField(field, e) {
    const {data} = this.state;
    data[field] = e.target.value;
    this.setState({data});
  }

  onChangeText(t) {
    const {data} = this.state;
    data.htmlcontent2 = t;
    this.setState({data});
  }

  pt_onChangeText(t) {
    const {data} = this.state;
    data.pt_htmlcontent2 = t;
    this.setState({data});
  }

  onImgUpdate(lang, e) {
    const img = e.target.files[0];
    const config = {headers: {"Content-Type": "multipart/form-data"}};
    const formData = new FormData();
    formData.append("file", img);
    if (lang === "pt") {
      formData.append("title", `pt_${this.state.data.id}`);
    } 
    else {
      formData.append("title", `${this.state.data.id}`);
    }
    axios.post("/api/slideImgUpload/", formData, config).then(imgResp => {
      const imgRespData = imgResp.data;
      if (imgRespData.error) {
        const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
        toast.show({message: "Unable to upload image!", intent: Intent.DANGER});
      }
      else {
        const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
        toast.show({message: "Image Uploaded!", intent: Intent.SUCCESS});
      }
      this.forceUpdate();
    });
  }

  previewSlide() {
    this.setState({isOpen: !this.state.isOpen});
  }

  pt_previewSlide() {
   this.setState({pt_isOpen: !this.state.pt_isOpen}); 
  }

  closePreview() {
    this.setState({isOpen: false, pt_isOpen: false});
  }

  handleChange(text) {
    const {data} = this.state;
    data.htmlcontent1 = text;
    this.setState({data});
  }

  pt_handleChange(text) {
    const {data} = this.state;
    data.pt_htmlcontent1 = text;
    this.setState({data});
  }
  
  saveContent() {
    const {data} = this.state;
    if (this.props.reportSave) this.props.reportSave(data);
    axios.post("/api/builder/slides/save", data).then(resp => {
      resp.status === 200 ? console.log("saved") : console.log("error");
    });
  }

  translateData(lang, data) {
    const resp = {};
    resp.id = data.id;
    for (const k in data) {
      if (data[`${lang}_${k}`]) resp[k] = data[`${lang}_${k}`];
    }
    return resp;
  }

  render() {

    const {data} = this.state;

    if (!data) return <Loading />;

    const showQuiz = data.type === "Quiz";
    const showRules = data.type === "InputCode";
    const showContent2 = ["Quiz", "CheatSheet"].indexOf(data.type) === -1;
    const showAce2 = ["TextCode", "RenderCode", "InputCode"].indexOf(data.type) !== -1;
    const showImg = ["TextImage", "ImageText"].indexOf(data.type) !== -1;
    const SlideComponent = compLookup[data.type];

    const ptData = this.translateData("pt", data);

    return (
      <div id="slide-editor">

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

        <Dialog
          isOpen={this.state.pt_isOpen}
          onClose={this.closePreview.bind(this)}
          title={ptData.title}
          style={{
            height: "80vh",
            maxHeight: "1000px",
            width: "90%"
          }}
        >
          <div id="slide" className="pt-dialog-body">
            <SlideComponent {...ptData} overrideLang="pt" />
          </div>
        </Dialog>

        <label className="pt-label">
          id
          <span className="pt-text-muted"> (required, auto-generated)</span>
          <input className="pt-input" disabled type="text" placeholder="Enter a unique slide id e.g. slide-1" dir="auto" value={data.id} />
        </label>
        <div className="input-block">
          <label className="pt-label">
            Title
            <span className="pt-text-muted"> (required)</span>
            <input className="pt-input" onChange={this.changeField.bind(this, "title")} type="text" placeholder="Enter a title for this slide" dir="auto" value={data.title} />
          </label>
          <label className="pt-label">
            pt Title 🇧🇷 
            <span className="pt-text-muted"> (required)</span>
            <input className="pt-input" onChange={this.changeField.bind(this, "pt_title")} type="text" placeholder="Enter a title for this slide" dir="auto" value={data.pt_title} />
          </label>
        </div>
        <label className="pt-label">
          Type
          <span className="pt-text-muted"> (required)</span>
          <div className="pt-select">
            <select value={data.type} onChange={this.changeField.bind(this, "type")}>
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
        <div className="area-block">
          <label className="pt-label">
            htmlcontent1
            <QuillWrapper
              style={{width: "500px", marginRight: "15px", backgroundColor: "white"}}
              value={this.state.data.htmlcontent1}
              onChange={this.handleChange.bind(this)} 
            />
          </label>
          <label className="pt-label">
            pt htmlcontent1  🇧🇷 
            <QuillWrapper
              style={{width: "500px", marginRight: "15px", backgroundColor: "white"}}
              value={this.state.data.pt_htmlcontent1}
              onChange={this.pt_handleChange.bind(this)} 
            />
          </label>
        </div>
        { showContent2
          ? showAce2 
            ? <div>
                <label className="pt-label">
                  htmlcontent2
                  <CodeEditor style={{height: "400px"}} onChangeText={this.onChangeText.bind(this)} initialValue={data.htmlcontent2} ref={c => this.editor = c}/> 
                </label>
                <label className="pt-label">
                  pt htmlcontent2  🇧🇷 
                  <CodeEditor style={{height: "400px"}} onChangeText={this.pt_onChangeText.bind(this)} initialValue={data.pt_htmlcontent2} ref={c => this.pt_editor = c}/> 
                </label>
              </div>
            : <div className="area-block">
                <label className="pt-label">
                  htmlcontent2
                  {showImg 
                    ? <div style={{marginRight: "15px"}}>
                        <img width="500px" src={`/slide_images/${data.id}.jpg?v=${new Date().getTime()})`} /><br/>
                        <label className="pt-file-upload">
                          <input onChange={this.onImgUpdate.bind(this, "en")} type="file" />
                          <span className="pt-file-upload-input">Upload</span>
                        </label>
                      </div>
                    : <textarea className="pt-input" onChange={this.changeField.bind(this, "htmlcontent2")} rows="10" type="text" placeholder="htmlcontent2" dir="auto" value={data.htmlcontent2} />
                  }
                </label>
                <label className="pt-label">
                  pt htmlcontent2  🇧🇷 
                  {showImg 
                    ? <div>
                        <img width="500px" src={`/slide_images/pt_${data.id}.jpg?v=${new Date().getTime()})`} /><br/>
                        <label className="pt-file-upload">
                          <input onChange={this.onImgUpdate.bind(this, "pt")} type="file" />
                          <span className="pt-file-upload-input">Upload</span>
                        </label>
                      </div>
                    : <textarea className="pt-input" onChange={this.changeField.bind(this, "pt_htmlcontent2")} rows="10" type="text" placeholder="pt_htmlcontent2" dir="auto" value={data.pt_htmlcontent2} />
                  }
                </label>
              </div>
          : null
        }
        { showQuiz ? <QuizPicker data={data} parentID={data.id} /> : null }
        { showRules ? <RulePicker data={data} parentID={data.id} /> : null }
        <Button type="button" onClick={this.previewSlide.bind(this)} className="pt-button pt-large pt-intent-warning">Preview</Button>&nbsp;
        <Button type="button" onClick={this.pt_previewSlide.bind(this)} className="pt-button pt-large pt-intent-warning">Preview PT</Button>&nbsp;
        <Button type="button" onClick={this.saveContent.bind(this)}  className="pt-button pt-large pt-intent-success">Save</Button>
      </div>
    );
  }
}

SlideEditor = connect(state => ({
  auth: state.auth
}))(SlideEditor);
SlideEditor = translate()(SlideEditor);
export default SlideEditor;
