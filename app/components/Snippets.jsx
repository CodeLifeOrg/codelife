import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import Loading from "components/Loading";
import {Intent, Position, Popover, Button, PopoverInteractionKind} from "@blueprintjs/core";
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

  buildPopover(snippet) {
    const {lessons} = this.state;
    return (
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        popoverClassName="pt-popover-content-sizing"
        position={Position.RIGHT}
      >
        <Button intent={Intent.PRIMARY}>?</Button>
        <div>
          <h5>{lessons.find(l => snippet.lid === l.id).name} Cheat Sheet</h5>
            <p style={{whiteSpace: "pre"}}>{lessons.find(l => snippet.lid === l.id).cheatsheet}</p>
          <Button className="pt-popover-dismiss">Dismiss</Button>
        </div>
      </Popover>
    );
  }

  render() {
    
    const {t, onClickSnippet} = this.props;
    const {snippets, lessons} = this.state;
    
    if (!snippets || !lessons) return <Loading />;

    // todo: this sorts by id, which is not a guarantee of proper order.  need to do by ordered lessons
    snippets.sort((a, b) => a.id - b.id);
    const snippetItems = snippets.map(snippet =>
    <li className="snippet" key={snippet.id}> 
      <span onClick={() => onClickSnippet(snippet)}>
        {snippet.snippetname}
      </span>&nbsp;&nbsp;
      {this.buildPopover(snippet)}
    </li>);

    return (
      <div>
        <div id="snippet-title">My Snippets</div>
        <div id="snippet-container">
          <ul id="snippet-list">{snippetItems}</ul>   
        </div>
        <div className="clear">
        </div>
      </div>
    );
  }
}

Snippets = connect(state => ({
  user: state.auth.user
}))(Snippets);
Snippets = translate()(Snippets);
export default Snippets;
