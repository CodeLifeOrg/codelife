import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import {Tooltip} from "@blueprintjs/core";
import "./Snippets.css";

class AllSnippets extends Component {

  constructor(props) {
    super(props);
    this.state = {
      snippets: [],
      lessons: null,
      snippetName: ""
    };
  }

  componentDidMount() {
    const sget = axios.get("/api/snippets/allothers");
    const lget = axios.get("/api/lessons");
    Promise.all([sget, lget]).then(resp => {
      const snippets = resp[0].data;
      const lessons = resp[1].data;
      this.setState({snippets, lessons});
    });
  }

  render() {

    const {t, onClickSnippet} = this.props;
    const {snippets, lessons} = this.state;

    if (!snippets || !lessons) return null;

    const snippetItems = snippets.map(snippet => {

      const lesson = lessons.find(l => snippet.lid === l.id);

      return <li className={ `snippet ${lesson.id}` } key={snippet.id}>
        <div className="snippet-title">{ snippet.snippetname }</div>
        <Tooltip content={ t("Insert into Project") }>
          <span onClick={ () => onClickSnippet(snippet) } className="pt-icon-standard pt-icon-log-in"></span>
        </Tooltip>
        <div className="snippet-author">{ t("Created by {{name}}", {name: snippet.username}) }</div>
      </li>;
    });

    return (
      <div id="snippets">
        <ul className="snippets-list">
          { snippetItems }
        </ul>
      </div>
    );
  }
}

AllSnippets = connect(state => ({
  user: state.auth.user
}))(AllSnippets);
AllSnippets = translate()(AllSnippets);
export default AllSnippets;
