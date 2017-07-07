import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import "./Snippets.css";

class Snippets extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gotUserFromDB: false,
      snippets: [],
      snippetName: ""
    };
  }

  componentDidUpdate() {
    if (this.props.user && !this.state.gotUserFromDB) {
      this.setState({gotUserFromDB: true});
      axios.get(`/api/snippets/?user_id=${this.props.user.id}`).then(resp => {
        this.setState({snippets: resp.data});
      });
    }
  }

  createNewSnippet() {
    const snippetName = this.state.snippetName;
    const windowContents = this.props.onCreateSnippet();
    if (snippetName !== "") {
      axios.post("/api/snippets/save", {name: snippetName, user_id: this.props.user.id, htmlcontent: windowContents}).then (resp => {
        if (resp.status === 200) {
          // todo fix this, this is not a good way to cause a refresh
          this.setState({gotUserFromDB: false, snippetName: ""});
        } 
        else {
          alert("Error");
        }
      }); 
    }    
  }

  handleChange(e) {
    this.setState({snippetName: e.target.value});
  }

  deleteSnippet(snippet) {
    axios.delete("/api/snippets/delete", {params: {id: snippet.id}}).then(resp => {
      if (resp.status === 200) {
        // todo fix this, this is not a good way to cause a refresh
        this.setState({gotUserFromDB: false});
      } 
      else {
        alert("Error");
      }
    });
  }

  render() {
    
    const {t, onChoose} = this.props;

    const snippetArray = this.state.snippets;
    const snippetItems = snippetArray.map(snippet =>
    <li className="snippet" key={snippet.id} onClick={() => onChoose(snippet)}>{snippet.name}</li>);

    const snippetXs = snippetArray.map(snippet =>
    <li className="x" key={snippet.id} onClick={() => this.deleteSnippet(snippet)}>[x]</li>);

    return (
      <div>
        <div style={{width: "250px"}}>
          <ul style={{float: "left", listStyleType: "none"}}>{snippetXs}</ul>
          <ul style={{float: "right"}}>{snippetItems}</ul>   
        </div>
        <div style={{clear: "both"}}>
        <form>
          <input className="snippetName" type="text" value={this.state.snippetName} onChange={this.handleChange.bind(this)} /> 
          <input type="button" value="Create New Snippet From Contents" onClick={this.createNewSnippet.bind(this)} />
        </form>
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
