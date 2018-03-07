import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import "./Search.css";

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      results: []
    };
  }

  handleChange(e) {
    const query = e.target.value;
    if (query.length > 2) this.search();
    this.setState({query});
  }

  search() {
    const {query} = this.state;
    axios.get(`/api/search/?query=${query}`).then(resp => {
      if (resp.status === 200) {
        this.setState({results: resp.data});
      }
      else {
        console.log("error");
      }
    })
  }

  render() {

    const {results} = this.state;

    console.log(results.map(r => r.name));

    return (
      <div id="site-search-box">
        <input  
          id="site-search"
          onChange={this.handleChange.bind(this)}
          value={this.state.query}
        />
        <div style={{backgroundColor: "white", width: "200px", display:"block"}}>
          { results.map(r => <span style={{textAlign: "center", width: "200px"}}>{r.name}<br/></span>) }
        </div>
      </div>
    );
  }
}

Search = connect(state => ({
  auth: state.auth
}))(Search);
Search = translate()(Search);
export default Search;
