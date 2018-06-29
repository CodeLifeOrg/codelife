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

    const dark = `${data.theme.split("-")[1]}-island-dark`;
    const medium = `${data.theme.split("-")[1]}-island-medium`;
    const light = `${data.theme.split("-")[1]}-island-light`;

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
            <div className={`translation-field-group field-group ${locale}`}>
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
            <div className={`translation-field-group field-group ${locale}`}>
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

          {/* <span className="island-swatch" style={{backgroundColor: styleyml[dark]}} />
          <span className="island-swatch" style={{backgroundColor: styleyml[medium]}} />
          <span className="island-swatch" style={{backgroundColor: styleyml[light]}} /> */}


          <div className="area-block">
            <div className="pt-label">
              Cheat Sheet
              <QuillWrapper
                value={this.state.data.cheatsheet}
                onChange={this.handleEditor.bind(this, "cheatsheet")}
              />
            </div>
            <div className="pt-label">
              pt Cheat Sheet  🇧🇷
              <QuillWrapper
                value={this.state.data.pt_cheatsheet}
                onChange={this.handleEditor.bind(this, "pt_cheatsheet")}
              />
            </div>
          </div>
          <div className="area-block">
            <div className="pt-label">
              Final Codeblock Prompt
              <QuillWrapper
                value={this.state.data.prompt}
                onChange={this.handleEditor.bind(this, "prompt")}
              />
            </div>
            <div className="pt-label">
              pt Final Codeblock Prompt  🇧🇷
              <QuillWrapper
                value={this.state.data.pt_prompt}
                onChange={this.handleEditor.bind(this, "pt_prompt")}
              />
            </div>
          </div>
          <label className="pt-label">
            Initial Codeblock State<br/><br/>
            <CodeEditor noZoom={true} onChangeText={this.handleEditor.bind(this, "initialcontent")} initialValue={data.initialcontent} ref={c => this.editor = c}/>
          </label>
          <label className="pt-label">
            pt Initial Codeblock State  🇧🇷 <br/><br/>
            <CodeEditor noZoom={true} onChangeText={this.handleEditor.bind(this, "pt_initialcontent")} initialValue={data.pt_initialcontent} ref={c => this.pt_editor = c}/>
          </label>
          <RulePicker data={data} parentID={data.id}/>
          <div className="area-block">
            <label className="pt-label">
              Victory Text
              <textarea className="pt-input" onChange={this.changeField.bind(this, "victory")} type="text" placeholder="Enter congratulatory text for when this island is completed" dir="auto" value={data.victory} />
            </label>
            <label className="pt-label">
              pt Victory Text  🇧🇷
              <textarea className="pt-input" onChange={this.changeField.bind(this, "pt_victory")} type="text" placeholder="Enter congratulatory text for when this island is completed" dir="auto" value={data.pt_victory} />
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

IslandEditor = connect(state => ({
  auth: state.auth
}))(IslandEditor);
IslandEditor = translate()(IslandEditor);
export default IslandEditor;
