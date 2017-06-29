import React, {Component} from "react";
import {translate} from "react-i18next";
import {listSnippets} from "api";
import axios from "axios";
import "./Snippets.css";

class Snippets extends Component {

  constructor(props) {
    super(props);
    this.state = {snippets:[]};
  }

  componentDidMount() {
    axios.get("api/snippets").then(resp => {
      this.setState({snippets: resp.data});
    });
  }

  render() {
    
    const {t, onChoose} = this.props;

    const snippetArray = this.state.snippets;
    const snippetItems = snippetArray.map(snippet =>
    <li key={snippet.id} onClick={() => onChoose(snippet)}>{snippet.name}</li>);

    return (
      <div>
        <ul>{snippetItems}</ul>
      </div>
    );
  }
}

export default translate()(Snippets);
