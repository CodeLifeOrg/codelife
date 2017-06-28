import React, {Component} from "react";
import {translate} from "react-i18next";
import {listSnippets} from "api";

class Snippets extends Component {

  render() {
    
    const {t} = this.props;

    const snippetArray = listSnippets();
    const snippetItems = snippetArray.map(snippet =>
    <li style={{display: "block", cursor: "pointer", width: "100px"}} onClick={this.onClickItem.bind(this, snippet)}>{snippet.name}</li>);

    return (
      <div>
        <h1>snippets</h1>
        <Nav />
      </div>
    );
  }
}

export default translate()(Snippets);
