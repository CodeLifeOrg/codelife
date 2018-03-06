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
  }

  render() {

    return (
      <div id="site-search-box">
        <input  
          id="site-search"
          onChange={this.handleChange.bind(this)}
          value={this.state.query}
        />
      </div>
    );
  }
}

Search = connect(state => ({
  auth: state.auth
}))(Search);
Search = translate()(Search);
export default Search;
