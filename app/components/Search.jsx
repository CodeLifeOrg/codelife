import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {browserHistory} from "react-router";
import {connect} from "react-redux";
import "./Search.css";

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      results: [],
      showResults: false
    };
  }

  handleChange(e) {
    const query = e.target.value;
    if (query.length > 2) { 
      this.setState({query});
      this.search();
    } 
    else {
      this.setState({query, results: []});
    }
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

  openResult(r) {
    //if (r.type === "user") {
    browserHistory.push(`/profile/${r.username}`);
    this.setState({showResults: false});
  }

  render() {

    const {results, showResults} = this.state;

    console.log(results);

    const resultList = results.map(r => 
      <li className="search-result-item">
        <div onClick={this.openResult.bind(this, r)}>
          {r.name ? `${r.username} (${r.name})` : r.username}
        </div>
      </li>
    );

    return (
      <div id="site-search-box">
        <input  
          id="site-search"
          onChange={this.handleChange.bind(this)}
          // onBlur={() => this.setState({showResults: false})}
          onFocus={() => this.setState({showResults: true})}
          value={this.state.query}
        />
        <div id="search-result-container" className={showResults ? "" : "search-hidden"}>
          <ul id="search-result-list">
            {resultList}
          </ul>
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
