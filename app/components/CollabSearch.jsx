import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
// import {Card, Elevation} from "@blueprintjs/core";
import {Link} from "react-router";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import "./CollabSearch.css";

class CollabSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      users: []
    };
  }

  handleChange(e) {
    const query = e.target.value;
    if (query.length > 2) {
      this.setState({query});
      this.search();
    }
    else {
      this.setState({query, users: []});
    }
  }

  clearSearch() {
    this.setState({query: "", users: []});
  }

  search() {
    const {query} = this.state;
    axios.get(`/api/search/?query=${query}`).then(resp => {
      if (resp.status === 200) {
        this.setState({users: resp.data.users});
      }
      else {
        console.log("error");
      }
    });
  }

  render() {

    const {t, scope} = this.props;
    const {users, query} = this.state;
    const inputID = `${scope}-search-input`;

    const userList = users.map(r =>
      /*<Card key={r.id} interactive={true} elevation={Elevation.TWO}>
        <h5><a href="#">Card heading</a></h5>
        <p>Card content</p>
        <button>Submit</button>
      </Card>
    );*/
      

      <li key={r.id} className="search-results-item user-result">
        <Link className={`search-results-link ${r.selected ? "search-selected" : ""}`} to={`/profile/${r.username}`} onClick={this.clearSearch.bind(this)}>
          <span className="search-results-text primary-search-results-text font-sm">{r.username}</span>
          {r.name ? <span className="search-results-text secondary-search-results-text font-xs">{r.name}</span> : "" }
        </Link>
      </li>
    );
    
    return (
      <div className="search-container">

        {/* icon as label */}
        <label className="search-label" htmlFor={inputID}>
          <span className="search-label-icon pt-icon pt-icon-search" />
          <span className="u-visually-hidden">{t("Search.Users")}</span>
        </label>

        {/* text input */}
        <input
          id={inputID}
          className="search-input font-sm"
          onChange={this.handleChange.bind(this)}
          value={query}
          placeholder={t("Search.Users")} />


      
      </div>
    );
  }
}

CollabSearch = connect(state => ({
  auth: state.auth
}))(CollabSearch);
CollabSearch = translate(undefined, {withRef: true})(CollabSearch);
export default CollabSearch;

