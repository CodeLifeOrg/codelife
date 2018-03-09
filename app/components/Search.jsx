import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Icon} from "@blueprintjs/core";
import {Link} from "react-router";
import {connect} from "react-redux";
import "./Search.css";

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      results: {
        users: [],
        projects: []
      },
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
      this.setState({query, results: {users: [], projects: []}});
    }
  }

  clearSearch() {
    this.setState({query: "", showResults: false, results: {users: [], projects: []}});
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
    });
  }

  render() {

    const {results, showResults} = this.state;

    const userList = results.users.map(r => 
      <li key={r.id} className="search-result-item user-result">
        <Link to={`/profile/${r.username}`} onClick={this.clearSearch.bind(this)}>
          <Icon iconName="user" /> {r.name ? `${r.username} (${r.name})` : r.username}
        </Link>
      </li>
    );
    const projectList = results.projects.filter(r => r.user).map(r => 
      <li key={r.id} className="search-result-item project-result">
        <Link to={`/projects/${r.user.username}/${r.name}`} onClick={this.clearSearch.bind(this)}>     
          <Icon iconName="projects" /> {`${r.name} (${r.user.username})`}
        </Link>
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
            {userList}
            {projectList}
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
