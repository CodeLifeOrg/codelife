import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import CodeEditor from "components/CodeEditor";
import RulePicker from "pages/admin/lessonbuilder/RulePicker";
import {Button, Toaster, Intent, Position} from "@blueprintjs/core";
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
    const themes = styleyml.islands;
    this.setState({data, themes});   
  }

  componentDidUpdate() {
    if (this.props.data.id !== this.state.data.id) {
      if (this.editor) {
        this.editor.getWrappedInstance().getWrappedInstance().setEntireContents(this.props.data.initialcontent);
      }
      if (this.pt_editor) {
        this.pt_editor.getWrappedInstance().getWrappedInstance().setEntireContents(this.props.data.pt_initialcontent); 
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

    if (!data || !themes) return <Loading />;

    const themeItems = [];
    for (const k in themes) {
      if (themes.hasOwnProperty(k)) themeItems.push(<option key={k} value={k}>{k}</option>);
    }
    
    return (
      <div id="island-editor">
        <label className="pt-label">
          id
          <span className="pt-text-muted"> (required, auto-generated)</span>
          <input className="pt-input" style={{width: "180px"}} disabled type="text" placeholder="Enter a unique page id e.g. island-1" dir="auto" value={data.id} />
        </label>
        <label className="pt-label">
          <span>
            Theme:&nbsp;&nbsp;
            <span className="island-swatch" style={themes[data.theme] ? {backgroundColor: themes[data.theme].dark} : null } />
            <span className="island-swatch" style={themes[data.theme] ? {backgroundColor: themes[data.theme].light} : null } />
          </span>
          <div className="pt-select" style={{width: "180px"}}>
            <select value={data.theme} onChange={this.changeField.bind(this, "theme")} >
              {themeItems}
            </select>
          </div>
        </label>
        <div className="input-block">
          <label className="pt-label">
            Icon:&nbsp;&nbsp;
            <span className={`pt-icon-standard ${data.icon}`} />
            <input className="pt-input" style={{width: "180px"}} onChange={this.changeField.bind(this, "icon")} type="text" placeholder="Enter an Icon Name" dir="auto" value={data.icon}/>
          </label>
        </div>
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
        <div className="area-block">
          <label className="pt-label">
            Cheat Sheet
            <QuillWrapper
              style={{width: "500px", marginRight: "15px", backgroundColor: "white"}}
              value={this.state.data.cheatsheet}
              onChange={this.handleEditor.bind(this, "cheatsheet")} 
            />
          </label>
          <label className="pt-label">
            pt Cheat Sheet  🇧🇷 
            <QuillWrapper
              style={{width: "500px", marginRight: "15px", backgroundColor: "white"}}
              value={this.state.data.pt_cheatsheet}
              onChange={this.handleEditor.bind(this, "pt_cheatsheet")} 
            />
          </label>
        </div>
        <div className="area-block">
          <label className="pt-label">
            Final Codeblock Prompt
            <QuillWrapper
              style={{width: "500px", marginRight: "15px", backgroundColor: "white"}}
              value={this.state.data.prompt}
              onChange={this.handleEditor.bind(this, "prompt")} 
            />
          </label>
          <label className="pt-label">
            pt Final Codeblock Prompt  🇧🇷 
            <QuillWrapper
              style={{width: "500px", marginRight: "15px", backgroundColor: "white"}}
              value={this.state.data.pt_prompt}
              onChange={this.handleEditor.bind(this, "pt_prompt")} 
            />
          </label>
        </div>
        <label className="pt-label">
          Initial Codeblock State<br/><br/>
          <CodeEditor style={{height: "400px"}} onChangeText={this.handleEditor.bind(this, "initialcontent")} initialValue={data.initialcontent} ref={c => this.editor = c}/>       
        </label>
        <label className="pt-label">
          pt Initial Codeblock State  🇧🇷 <br/><br/>
          <CodeEditor style={{height: "400px"}} onChangeText={this.handleEditor.bind(this, "pt_initialcontent")} initialValue={data.pt_initialcontent} ref={c => this.pt_editor = c}/>       
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
        <Button type="button" onClick={this.saveContent.bind(this)} className="pt-button pt-large pt-intent-success">Save</Button>
      </div>
    );
  }
}

IslandEditor = connect(state => ({
  auth: state.auth
}))(IslandEditor);
IslandEditor = translate()(IslandEditor);
export default IslandEditor;
