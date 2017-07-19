import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import "./Snippets.css";

class Snippets extends Component {

  constructor(props) {
    super(props);
    this.state = {
      snippets: [],
      snippetName: ""
    };
  }

  componentDidMount() {
    axios.get("/api/snippets").then(resp => {
      this.setState({snippets: resp.data});
    });
  }

  render() {
    
    const {t, onChoose} = this.props;

    const snippetArray = this.state.snippets;
    // todo: this sorts by id, which is not a guarantee of proper order.  need to do by ordered lessons
    snippetArray.sort((a, b) => a.id - b.id);
    const snippetItems = snippetArray.map(snippet =>
    <li className="snippet" key={snippet.id} onClick={() => onChoose(snippet)}>{snippet.name}</li>);

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
