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

  componentWillReceiveProps(nextProps) {
    if (this.props.linkObj !== nextProps.linkObj) {
      this.clearSearch();
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
    else if (e.key === "Escape") {
      this.clearSearch();
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

    const {t, scope} = this.props;
    const {results, showResults, selectedIndex, query} = this.state;
    const inputID = `${scope}-search-input`;

    const allResults = results.users.concat(results.projects).map(r => {
      r.selected = false;
      return r;
    });

    const selectedItem = allResults && selectedIndex !== null ? allResults[selectedIndex] : null;
    if (selectedItem) selectedItem.selected = true;

    const userList = results.users.map(r =>
      <li key={r.id} className="search-results-item user-result">
        <Link className={`search-results-link ${r.selected ? "search-selected" : ""}`} to={`/profile/${r.username}`} onClick={this.clearSearch.bind(this)}>
          <span className="search-results-text primary-search-results-text font-sm">{r.username}</span>
          {r.name ? <span className="search-results-text secondary-search-results-text font-xs">{r.name}</span> : "" }
        </Link>
      </li>
    );
    const projectList = results.projects.filter(r => r.user).map(r =>
      <li key={r.id} className="search-results-item project-result">
        <Link className={`search-results-link ${r.selected ? "search-selected" : ""}`} to={`/projects/${r.user.username}/${r.name}`} onClick={this.clearSearch.bind(this)}>
          <span className="search-results-text primary-search-results-text font-sm">{r.name}</span>
          <span className="search-results-text secondary-search-results-text font-xs">
            {t("by")} {r.user.username}
          </span>
        </Link>
      </li>
    );

    return (
      <div className="search-container">

        {/* icon as label */}
        <label className="search-label" htmlFor={inputID}>
          <span className="search-label-icon pt-icon pt-icon-search" />
          <span className="u-visually-hidden">{t("Search.Site")}</span>
        </label>

        {/* text input */}
        <input
          id={inputID}
          className="search-input font-sm"
          onChange={this.handleChange.bind(this)}
          onKeyDown={this.onKeyDown.bind(this)}
          // onBlur={() => this.setState({showResults: false})}
          value={query}
          placeholder={t("Search.Site")} />

        {/* text input */}
        <div className={query.length > 0 ? "search-results-outer" : "search-results-outer is-hidden"}>

          {/* hidden heading (for accessibility) */}
          <h2 className="u-visually-hidden">{t("Search.Results")}</h2>

          {/* Message: keep typing */}
          <h3 className={query.length <= 2 ? "search-results-message font-lg u-margin-bottom-off u-text-center" : "search-results-message is-hidden"}>{t("Search.KeepTyping")}</h3>

          {/* Message: no results */}
          <h3 className={query.length > 2 && allResults.length === 0 ? "search-results-message font-lg u-margin-bottom-off u-text-center" : "search-results-message is-hidden"}>{t("Search.NoResults")}</h3>

          {/* users */}
          <div className={query.length > 2 && userList.length !== 0 ? "search-results-inner" : "search-results-inner is-hidden"}>
            <h3 className="search-results-heading font-md">
              <span className="search-results-heading-icon pt-icon pt-icon-people" />&nbsp;{t("Search.UsersHeading")}
            </h3>
            <ul className="search-results-list">
              {userList}
            </ul>
          </div>

          {/* projects */}
          <div className={query.length > 2 && projectList.length !== 0 ? "search-results-inner" : "search-results-inner is-hidden"}>
            <h3 className="search-results-heading font-md">
              <span className="search-results-heading-icon pt-icon pt-icon-applications" />&nbsp;{t("Search.ProjectsHeading")}
            </h3>
            <ul className="search-results-list">
              {projectList}
            </ul>
          </div>

          {/* close button */}
          <button className="search-reset-button pt-dialog-close-button pt-icon-small-cross" onClick={this.clearSearch.bind(this)} aria-label="Close" />
        </div>
      </div>
    );
  }
}

Search = connect(state => ({
  auth: state.auth
}))(Search);
Search = translate(undefined, {withRef: true})(Search);
export default Search;

