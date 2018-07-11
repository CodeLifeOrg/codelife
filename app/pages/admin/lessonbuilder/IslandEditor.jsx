import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Link} from "react-router";
import LoadingSpinner from "components/LoadingSpinner";
import CodeEditor from "components/CodeEditor/CodeEditor";
import RulePicker from "pages/admin/lessonbuilder/RulePicker";
import {Toaster, Intent, Position} from "@blueprintjs/core";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";
import styleyml from "style.yml";

import "./IslandEditor.css";

class IslandEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      themes: null
    };
  }

  componentDidMount() {
    const {data} = this.props;
    const themes = styleyml.islands.array;
    this.setState({data, themes});
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

  handleEditor(field, t) {
    const {data} = this.state;
    data[field] = t;
    this.setState({data});
  }

  saveContent() {
    const {data} = this.state;
    if (this.props.reportSave) this.props.reportSave(data);
    const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
    axios.post("/api/builder/islands/save", data).then(resp => {
      console.log(resp);
      if (resp.status === 200) {
        toast.show({message: "Saved!", intent: Intent.SUCCESS});
      }
      else {
        toast.show({message: "Error!", intent: Intent.DANGER});
      }
    });
  }

  render() {

    const {data, themes} = this.state;

    // grab en/pt subdomain from url
    const locale = window.location.host.split(".")[0];

    if (!data || !themes) return <LoadingSpinner />;

    const themeItems = themes.map(t => <option key={`island-${t}`} value={`island-${t}`}>{`${t} island`}</option>);

    // const dark = `${data.theme.split("-")[1]}-island-dark`;
    // const medium = `${data.theme.split("-")[1]}-island-medium`;
    // const light = `${data.theme.split("-")[1]}-island-light`;

    const fieldGroupClasses = `translation-field-group field-group ${locale}`;

    return (
      <div id="island-editor" className={data.theme}>
        <div className="item-editor-inner">

          <div className="item-editor-meta">

            {/* title display */}
            <h1 className="font-lg u-margin-top-xs u-margin-bottom-off">
              { locale === "en"
                ? `${data.name} / ${data.pt_name}`
                : `${data.pt_name} / ${data.name}`
              }
            </h1>
            <p className="font-xs">
              <Link to={`island/${data.id}`}>
                codelife.com/island/{data.id}
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
                  value={data.name}
                  onChange={this.changeField.bind(this, "name")}
                  autoFocus={ locale !== "pt" ? true : false} />
              </div>
              {/* pt */}
              <div className="field-container font-md">
                <label className="font-sm" htmlFor="title-pt">Title (Pt)</label>
                <input className="field-input"
                  id="title-pt"
                  name="title-pt"
                  value={data.pt_name}
                  onChange={this.changeField.bind(this, "pt_name")}
                  autoFocus={ locale === "pt" ? true : false} />
              </div>
            </div>

            {/* description */}
            <div className={fieldGroupClasses}>
              {/* en */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="description-en">Description (En)</label>
                <input className="field-input"
                  id="description-en"
                  name="description-en"
                  value={data.description}
                  onChange={this.changeField.bind(this, "description")}
                  placeholder="Describe this island in a few words" />
              </div>
              {/* pt */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="description-pt">Description (Pt)</label>
                <input className="field-input"
                  id="description-pt"
                  name="description-pt"
                  value={data.pt_description}
                  onChange={this.changeField.bind(this, "pt_description")}
                  placeholder="Describe this island in a few words" />
              </div>
            </div>

            {/* theme & icon */}
            <div className="field-group">
              {/* theme */}
              <div className="field-container font-sm">
                <label htmlFor="theme" className="label">Theme: </label>
                <div className="pt-select">
                  <select className="field-input" id="theme" name="theme" value={data.theme} onChange={this.changeField.bind(this, "theme")} >
                    {themeItems}
                  </select>
                </div>
                {/* <span className="island-swatch" style={{backgroundColor: styleyml[dark]}} />
                <span className="island-swatch" style={{backgroundColor: styleyml[medium]}} />
                <span className="island-swatch" style={{backgroundColor: styleyml[light]}} /> */}
              </div>
              {/* icon */}
              <div className="field-container has-icon font-sm">
                <label className="label" htmlFor="icon">Icon:</label>
                <input className="input"
                  id="icon"
                  onChange={this.changeField.bind(this, "icon")} placeholder="Enter an Icon Name"
                  value={data.icon}/>
                <span className={`field-icon pt-icon ${data.icon}`} />
              </div>

            </div>
          </div>


          {/* Codeblock config */}
          <div className="item-editor-codeblock">

            <h2 className="font-md u-margin-top-lg">{data.name} Codeblock</h2>

            {/* prompt */}
            <div className={fieldGroupClasses}>
              {/* en */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="prompt-en">Prompt (En)</label>
                <QuillWrapper
                  id="prompt-en"
                  value={this.state.data.prompt}
                  onChange={this.handleEditor.bind(this, "prompt")}
                />
              </div>
              {/* pt */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="prompt-pt">Prompt (Pt)</label>
                <QuillWrapper
                  id="prompt-pt"
                  value={this.state.data.pt_prompt}
                  onChange={this.handleEditor.bind(this, "pt_prompt")}
                />
              </div>
            </div>

            {/* cheat sheet */}
            <div className={fieldGroupClasses}>
              {/* en */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="cheatsheet-en">Cheat sheet (En)</label>
                <QuillWrapper
                  id="cheatsheet-en"
                  value={this.state.data.cheatsheet}
                  onChange={this.handleEditor.bind(this, "cheatsheet")}
                />
              </div>
              {/* pt */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="cheatsheet-pt">Cheat sheet (Pt)</label>
                <QuillWrapper
                  id="cheatsheet-pt"
                  value={this.state.data.pt_cheatsheet}
                  onChange={this.handleEditor.bind(this, "pt_cheatsheet")}
                />
              </div>
            </div>

            {/* Codeblock initial state */}
            <div className={fieldGroupClasses}>
              {/* en */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="codeblock-initial-state-en">Initial state (En)</label>
                <CodeEditor
                  id="codeblock-initial-state-en"
                  onChangeText={this.handleEditor.bind(this, "initialcontent")} initialValue={data.initialcontent}
                  ref={c => this.editor = c} />
              </div>
              {/* pt */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="codeblock-initial-state-pt">Initial state (Pt)</label>
                <CodeEditor
                  id="codeblock-initial-state-pt"
                  onChangeText={this.handleEditor.bind(this, "pt_initialcontent")} initialValue={data.pt_initialcontent}
                  ref={c => this.pt_editor = c} />
              </div>
            </div>

            {/* rules */}
            <RulePicker data={data} parentID={data.id} locale={locale} />
          </div>


          {/* victory message */}
          <div className={fieldGroupClasses}>
            {/* en */}
            <div className="field-container font-sm">
              <label className="font-sm" htmlFor="victory-en">Victory text (En)</label>
              <textarea className="field-textarea"
                id="victory-en"
                name="victory-en"
                value={data.victory}
                onChange={this.changeField.bind(this, "victory")}
                placeholder="Congratulatory text upon island completion" />
            </div>
            {/* pt */}
            <div className="field-container font-sm">
              <label className="font-sm" htmlFor="victory-pt">Victory text (Pt)</label>
              <textarea className="field-textarea"
                id="victory-pt"
                name="victory-pt"
                value={data.pt_victory}
                onChange={this.changeField.bind(this, "pt_victory")}
                placeholder="Congratulatory text upon island completion" />
            </div>
          </div>
        </div>

        <h2 className="u-visually-hidden">Actions: </h2>
        <div className="admin-actions-bar">
          <button className="button" onClick={this.saveContent.bind(this)}>
            Save changes
          </button>
        </div>
      </div>
    );
  }
}

IslandEditor = connect(state => ({
  auth: state.auth
}))(IslandEditor);
IslandEditor = translate()(IslandEditor);
export default IslandEditor;
