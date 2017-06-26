import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";
import {DragDropContextProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Snippet from "components/Snippet";
import Dustbin from "components/Dustbin";

//import AceEditor from "react-ace";

//import "brace/mode/html";
//import "brace/theme/monokai"

// Studio Page
// Test zone for inline code editing

class Editor extends Component {

  render() {
    if (typeof window !== 'undefined') {
      const Ace = require('react-ace').default;
      require('brace/mode/html');
      require('brace/theme/monokai');

      return <Ace ref={editor => this.editor = editor} {...this.props}/>
    }
    return null;
  }
}

class Studio extends Component {

  state = {mounted: false, output: ""};

  componentDidMount() {
    this.setState({mounted: true});
  }

  insertTextAtCursor(theText) {
    const reactAceComponent = this.editor.editor;
    reactAceComponent.editor.insert(theText);
  }

  onChange(theText) {
    this.setState({output: theText});
  }

  onClick(e) {
    this.insertTextAtCursor("test");
  }
  
  render() {
    
    const {t} = this.props;

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div>
          <h1>{ t("Studio") }</h1>
          <div style={{width:"1200px"}}>
            <div style={{float:"left", width:"450px"}}>
            <Snippet name="title snippet" text="<h1>title</h1>"/>
            <Snippet name="list snippet" text="<ul><li>test</li></ul>"/>
            <Snippet name="img snippet" text="<img src='img' />" />
            </div>
            <div style={{float:"right", width:"450px"}}>
            <Dustbin />
            </div>
          </div>
          <div style={{clear:"both"}}></div>
          <hr/>
          <button onClick={this.onClick.bind(this)}>Inject</button><br/><br/>       
          <div style={{width:"1200px"}}>
            <div style={{float:"left", width:"450px"}}>
            { this.state.mounted ? <Editor ref={ comp => this.editor = comp } mode="html" theme="monokai" onChange={this.onChange.bind(this)} value={this.state.output}/> : null }
            </div>
            <div style={{float:"right", border:"solid 1px black", width: "650px", height: "400px"}} dangerouslySetInnerHTML={ {__html: this.state.output } } />
          </div>
          <div style={{clear:"both"}}>
          <br/><br/>
          
          <Nav />
          </div>
        </div>
      </DragDropContextProvider>
    );
  }
}

export default translate()(Studio);
