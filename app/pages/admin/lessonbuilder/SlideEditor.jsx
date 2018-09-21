import axios from "axios";
import React, {Component} from "react";
import {Link} from "react-router";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import LoadingSpinner from "components/LoadingSpinner";
import RulePicker from "pages/admin/lessonbuilder/RulePicker";
import QuizPicker from "pages/admin/lessonbuilder/QuizPicker";
import CodeEditor from "components/CodeEditor/CodeEditor";
import {Button, Dialog, Toaster, Position, Intent, Switch} from "@blueprintjs/core";

import ImageText from "components/slidetypes/ImageText";
import InputCode from "components/slidetypes/InputCode";
import Quiz from "components/slidetypes/Quiz";
import TextCode from "components/slidetypes/TextCode";
import TextImage from "components/slidetypes/TextImage";
import TextText from "components/slidetypes/TextText";
import RenderCode from "components/slidetypes/RenderCode";
import CheatSheet from "components/slidetypes/CheatSheet";

import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

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
      for (const q of this.quills) {
        // For each Quill instance, reach into the Quill editor itself and clear the selection.
        // This is to prevent a bug where formatting would "spread" from one quill to another when changing slides.
        if (q && q.getWrappedInstance() && q.getWrappedInstance().quillRef) {
          const editor = q.getWrappedInstance().quillRef.getEditor();
          editor.setSelection(0);
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

  handleEditor(field, t) {
    const {data} = this.state;
    data[field] = t;
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

  handleLax(e) {
    const {data} = this.state;
    data.lax = e.target.checked ? true : false;
    this.setState({data});
  }

  saveContent() {
    const {data} = this.state;
    if (this.props.reportSave) this.props.reportSave(data);
    axios.post("/api/builder/slides/save", data).then(resp => {
      if (resp.status === 200) {
        const toast = Toaster.create({className: "slideSave", position: Position.TOP_CENTER});
        toast.show({message: "Slide saved.", intent: Intent.SUCCESS});
      }
      else {
        const toast = Toaster.create({className: "slideFail", position: Position.TOP_CENTER});
        toast.show({message: "Save Error.", intent: Intent.DANGER});
      }
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

    // grab en/pt subdomain from url
    const locale = window.location.host.split(".")[0];
    const fieldGroupClasses = `translation-field-group field-group ${locale}`;

    // grab island URL
    const currentUrl = window.location.pathname.split("/");
    const slideUrlIsland = currentUrl[3];
    const slideUrlLevel = currentUrl[4];

    if (!data) return <LoadingSpinner />;

    this.quills = [];

    const showQuiz = data.type === "Quiz";
    const showRules = data.type === "InputCode";
    const showContent2 = ["Quiz", "CheatSheet"].indexOf(data.type) === -1;
    const showAce2 = ["TextCode", "RenderCode", "InputCode"].indexOf(data.type) !== -1;
    const showImg = ["TextImage", "ImageText"].indexOf(data.type) !== -1;
    const showText2 = data.type === "TextText";
    const SlideComponent = compLookup[data.type];

    const ptData = this.translateData("pt", data);

    return (
      <div id="slide-editor">
        <div className="item-editor-inner">

          <div className="item-editor-meta">

            {/* title display */}
            <h1 className="font-lg u-margin-top-xs u-margin-bottom-off">
              { locale === "en"
                ? `${data.title} / ${data.pt_title}`
                : `${data.pt_title} / ${data.title}`
              }
            </h1>
            <p className="font-xs">
              <Link to={`island/${slideUrlIsland}/${slideUrlLevel}/${data.id}`}>
                codelife.com/island/{slideUrlIsland}/{slideUrlLevel}/{data.id}
              </Link>
            </p>

            {/* title fields */}
            <div className={fieldGroupClasses}>
              {/* en */}
              <div className="field-container font-md">
                <label className="font-sm" htmlFor="title-en">Title (En)</label>
                <input className="field-input"
                  id="title-en"
                  name="title-en"
                  value={data.title}
                  onChange={this.changeField.bind(this, "title")}
                  autoFocus={ locale !== "pt" ? true : false} />
              </div>
              {/* pt */}
              <div className="field-container font-md">
                <label className="font-sm" htmlFor="title-pt">Title (Pt)</label>
                <input className="field-input"
                  id="title-pt"
                  name="title-pt"
                  value={data.pt_title}
                  onChange={this.changeField.bind(this, "pt_title")}
                  autoFocus={ locale === "pt" ? true : false} />
              </div>
            </div>

            {/* slide layout */}
            <div className="field-container font-sm">
              <label htmlFor="slide-layout" className="label">Slide layout: </label>
              <div className="pt-select">
                {/* select menu */}
                <select className="field-input slide-layout-select"
                  id="slide-layout"
                  name="slide-layout"
                  value={data.type}
                  onChange={this.changeField.bind(this, "type")} >
                  <option value="TextImage">Text left, image right</option>
                  <option value="ImageText">Image left, text right</option>
                  <option value="TextCode">Text left, code right</option>
                  <option value="TextText">Text left, text right</option>
                  <option value="RenderCode">Code example (read only)</option>
                  <option value="InputCode">Code input (interactive)</option>
                  <option value="Quiz">Quiz</option>
                  <option value="CheatSheet">Cheat sheet</option>
                </select>
              </div>
            </div>
          </div>


          {/* Slide content */}
          <div className="item-editor-slide-content">

            <h2 className="font-md u-margin-top-lg">Slide content</h2>

            {/* text */}
            <div className={fieldGroupClasses}>
              {/* en */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="htmlcontent1-en">
                  Text {showText2 ? "left" : "content"} (En)
                </label>
                <QuillWrapper
                  id="htmlcontent1-en"
                  value={this.state.data.htmlcontent1}
                  onChange={this.handleEditor.bind(this, "htmlcontent1")}
                  ref={c => this.quills.push(c)}
                />
              </div>
              {/* pt */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="htmlcontent1-pt">
                  Text {showText2 ? "left" : "content"} (Pt)
                </label>
                <QuillWrapper
                  id="htmlcontent1-pt"
                  value={this.state.data.pt_htmlcontent1}
                  onChange={this.handleEditor.bind(this, "pt_htmlcontent1")}
                  ref={c => this.quills.push(c)}
                />
              </div>
            </div>


            {/* text & text */}
            { showText2 &&
              <div className={fieldGroupClasses}>
                {/* en */}
                <div className="field-container font-sm">
                  <label className="font-sm" htmlFor="htmlcontent2-en">
                    Text right (En)
                  </label>
                  <QuillWrapper
                    id="htmlcontent2-en"
                    value={this.state.data.htmlcontent2}
                    onChange={this.handleEditor.bind(this, "htmlcontent2")}
                    ref={c => this.quills.push(c)}
                  />
                </div>
                {/* pt */}
                <div className="field-container font-sm">
                  <label className="font-sm" htmlFor="htmlcontent2-pt">
                    Text right (Pt)
                  </label>
                  <QuillWrapper
                    id="htmlcontent2-pt"
                    value={this.state.data.pt_htmlcontent2}
                    onChange={this.handleEditor.bind(this, "pt_htmlcontent2")}
                    ref={c => this.quills.push(c)}
                  />
                </div>
              </div>
            }


            {/* code editor */}
            { showAce2 &&
              <div className={fieldGroupClasses}>
                {/* en */}
                <div className="field-container font-sm">
                  <label className="font-small">
                    Code snippet (En)
                  </label>
                  <CodeEditor
                    onChangeText={this.handleEditor.bind(this, "htmlcontent2")}
                    initialValue={data.htmlcontent2}
                    ref={c => this.editor = c}/>
                </div>
                {/* pt */}
                <div className="field-container font-sm">
                  <label className="font-small">
                    Code snippet (Pt)
                  </label>
                  <CodeEditor
                    onChangeText={this.handleEditor.bind(this, "pt_htmlcontent2")}
                    initialValue={data.pt_htmlcontent2}
                    ref={c => this.pt_editor = c}/>
                </div>
              </div>
            }
            { showRules &&
              <div className="field-container font-sm u-margin-top-sm">
                <Switch
                  id="lax"
                  checked={data.lax}
                  onChange={this.handleLax.bind(this)}>
                  Lax mode
                </Switch>
                <RulePicker data={data} parentID={data.id} />
              </div>
            }


            {/* image */}
            { showImg &&
              <div className={fieldGroupClasses}>
                {/* en */}
                <div className="field-container">
                  <img src={`/slide_images/${data.id}.jpg?v=${new Date().getTime()})`} alt="" />


                  <div className="field-container has-icon font-md u-fullwidth u-margin-top-xs">
                    <div className="file-select-container">
                      {/* real field; set to 0 opacity by default, but clickable */}
                      <input className="field-input" id="profile-photo-select" onChange={this.onImgUpdate.bind(this, "en")} type="file" />
                      {/* icon */}
                      <span className="field-icon pt-icon pt-icon-media" />
                      {/* fake field; :after element used for the "button" */}
                      <span className="fake-file-select field-input font-md"
                        data-button-text-sm="Upload image (En)" data-button-text-lg="Browse...">
                        Upload image (En)
                      </span>
                    </div>
                  </div>
                </div>
                {/* pt */}
                <div className="field-container">
                  <img src={`/slide_images/pt_${data.id}.jpg?v=${new Date().getTime()})`} alt="" />

                  <div className="field-container has-icon font-md u-fullwidth u-margin-top-xs">
                    <div className="file-select-container">
                      {/* real field; set to 0 opacity by default, but clickable */}
                      <input className="field-input" id="profile-photo-select" onChange={this.onImgUpdate.bind(this, "pt")} type="file" />
                      {/* icon */}
                      <span className="field-icon pt-icon pt-icon-media" />
                      {/* fake field; :after element used for the "button" */}
                      <span className="fake-file-select field-input font-md"
                        data-button-text-sm="Upload image (Pt)" data-button-text-lg="Browse...">
                        Upload image (Pt)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            }


            {/* quiz */}
            { showQuiz &&
              <QuizPicker data={data} parentID={data.id} />
            }

          </div>
        </div>

        {/* actions */}
        <div className="admin-actions-bar">
          <h2 className="u-visually-hidden">Actions: </h2>
          <p className="admin-actions-preview font-sm">Preview:
            <button className="link u-unbutton font-sm" onClick={this.previewSlide.bind(this)}>
              <span className="u-visually-hidden">preview slide in </span>English
            </button>
            <button className="link u-unbutton font-sm" onClick={this.pt_previewSlide.bind(this)}>
              <span className="u-visually-hidden">preview slide in </span>Portuguese
            </button>
          </p>
          <button className="button" onClick={this.saveContent.bind(this)}>Save</button>
        </div>

        {/* preview slide */}
        <Dialog
          className="is-fullscreen slide-preview-container"
          isOpen={this.state.isOpen}
          onClose={this.closePreview.bind(this)}
          title="">

          <div id="slide" className="slide-inner">
            <div className="slide-header" id="slide-head">
              { data.title &&
                <h1 className="slide-title font-lg">{ data.title }</h1>
              }
            </div>
            <SlideComponent {...data} />
          </div>
        </Dialog>

        <Dialog
          className="is-fullscreen slide-preview-container"
          isOpen={this.state.pt_isOpen}
          onClose={this.closePreview.bind(this)}
          title="">

          <div id="slide" className="slide-inner">
            <div className="slide-header" id="slide-head">
              { data.title &&
                <h1 className="slide-title font-lg">{ data.pt_title }</h1>
              }
            </div>
            <SlideComponent {...ptData} overrideLang="pt" />
          </div>
        </Dialog>
      </div>
    );
  }
}

SlideEditor = connect(state => ({
  auth: state.auth
}))(SlideEditor);
SlideEditor = translate()(SlideEditor);
export default SlideEditor;
