import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";
//import AceEditor from "react-ace";

//import "brace/mode/html";

// Studio Page
// Test zone for inline code editing

class Studio extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>{ t("Studio") }</h1>
        { /*
        <AceEditor
        mode="html"
        theme="monokai"
        name="blah2"
        onLoad={this.onLoad}
        onChange={this.onChange}
        fontSize={14}
        height="100%"
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={`function onLoad(editor) {
        console.log("i've loaded");
        }`}
        setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
        }}/>
      */ } 

        <Nav />
      </div>
    );
  }
}

export default translate()(Studio);
