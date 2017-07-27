import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import Loading from "components/Loading";
import {Intent, Position, Popover, Button, PopoverInteractionKind} from "@blueprintjs/core";
import "./AllSnippets.css";

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
    
    if (!snippets || !lessons) return <Loading />;

    // todo: this sorts by id, which is not a guarantee of proper order.  need to do by ordered lessons
    snippets.sort((a, b) => a.id - b.id);
    const snippetItems = snippets.map(snippet =>
    <li className="snippet" key={snippet.id}> 
      <span onClick={() => onClickSnippet(snippet)}>
        {snippet.username} - {snippet.snippetname}
      </span>
    </li>);

    return (
      <div>
        <div id="snippet-title">Everyone's Snippets</div>
        <div id="snippet-container">
          <ul id="snippet-list">{snippetItems}</ul>   
        </div>
        <div className="clear">
        </div>
      </div>
    );
  }
}

AllSnippets = connect(state => ({
  user: state.auth.user
}))(AllSnippets);
AllSnippets = translate()(AllSnippets);
export default AllSnippets;
