import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Icon} from "@blueprintjs/core";
import {Link} from "react-router";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
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
      selectedIndex: null,
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
      this.setState({query, showResults: true, results: {users: [], projects: []}});
    }
  }

  clearSearch() {
    this.setState({selectedIndex: null, query: "", showResults: false, results: {users: [], projects: []}});
  }

  onKeyDown(e) {
    const {selectedIndex, results} = this.state;
    const allResults = results.users.concat(results.projects);
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
      if (selectedIndex === null) {
        if (e.key === "ArrowDown") {
          this.setState({selectedIndex: 0});
        }
      }
      else {
        if (e.key === "ArrowDown" && selectedIndex < allResults.length) {
          this.setState({selectedIndex: selectedIndex + 1});
        } 
        else if (e.key === "ArrowUp" && selectedIndex > 0) {
          this.setState({selectedIndex: selectedIndex - 1}); 
        }
        else if (e.key === "Enter") {
          const selectedItem = allResults[selectedIndex];
          if (selectedItem && selectedItem.type === "user") browserHistory.push(`/profile/${selectedItem.username}`);
          if (selectedItem && selectedItem.type === "project") browserHistory.push(`/projects/${selectedItem.user.username}/${selectedItem.name}`);
          this.clearSearch();
        }
      }
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
    });
  }

  render() {

    const {results, showResults, selectedIndex} = this.state;

    const allResults = results.users.concat(results.projects).map(r => {
      r.selected = false;
      return r;
    });

    const selectedItem = allResults && selectedIndex !== null ? allResults[selectedIndex] : null;
    if (selectedItem) selectedItem.selected = true;

    const userList = results.users.map(r => 
      <li key={r.id} className={`search-result-item user-result ${r.selected ? "search-selected" : ""}`}>
        <Link to={`/profile/${r.username}`} onClick={this.clearSearch.bind(this)}>
          <Icon iconName="user" /> {r.name ? `${r.username} (${r.name})` : r.username}
        </Link>
      </li>
    );
    const projectList = results.projects.filter(r => r.user).map(r => 
      <li key={r.id} className={`search-result-item project-result ${r.selected ? "search-selected" : ""}`}>
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
          onKeyDown={this.onKeyDown.bind(this)}
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
