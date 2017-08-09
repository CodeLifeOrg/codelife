import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import {Position, Popover, PopoverInteractionKind, Tooltip} from "@blueprintjs/core";
import "./Snippets.css";

class Snippets extends Component {

  constructor(props) {
    super(props);
    this.state = {
      snippets: [],
      lessons: null,
      snippetName: ""
    };
  }

  componentDidMount() {
    const sget = axios.get("/api/snippets");
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

    // todo: this sorts by id, which is not a guarantee of proper order.  need to do by ordered lessons
    snippets.sort((a, b) => a.id - b.id);
    const snippetItems = snippets.map(snippet => {

      const lesson = lessons.find(l => snippet.lid === l.id);

      return <li className="snippet" key={snippet.id}>
        <div className="snippet-title">{ snippet.snippetname }</div>
        <Tooltip content={ t("View Cheat Sheet") }>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            popoverClassName="pt-popover-content-sizing"
            position={Position.RIGHT_TOP}
          >
            <span className="pt-icon-standard pt-icon-predictive-analysis"></span>
            <div>
              <h5>{lesson.name} {t("Cheat Sheet")}</h5>
              <p style={{whiteSpace: "pre-wrap"}} dangerouslySetInnerHTML={{__html: lesson.cheatsheet}} />
            </div>
          </Popover>
        </Tooltip>
        <Tooltip content={ t("Insert into Project") }>
          <span onClick={ () => onClickSnippet(snippet) } className="pt-icon-standard pt-icon-log-in"></span>
        </Tooltip>
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

Snippets = connect(state => ({
  user: state.auth.user
}))(Snippets);
Snippets = translate()(Snippets);
export default Snippets;
