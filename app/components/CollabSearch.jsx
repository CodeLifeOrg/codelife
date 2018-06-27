import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import "./CollabSearch.css";

/**
 * Popover window so that project owners can find and add new users to collaborate on a given project
 */

class CollabSearch extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      users: [],
      geos: [],
      schools: [],
      MAX_COLLABS: 5,
      filterLoc: "default",
      filterSchool: "default"
    };
  }

  /**
   * Don't start hitting the database until the query is more than 2 characters long
   */
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

  clearFilters() {
    this.setState({filterLoc: "default", filterSchool: "default"});
  }

  search() {
    const {query} = this.state;
    axios.get(`/api/searchusers/?query=${query}`).then(resp => {
      if (resp.status === 200) {
        this.setState({users: resp.data});
      }
      else {
        console.log("error");
      }
    });
  }

  /**
   * Given a clicked collaborator, if the constraints are met, post it to userprofiles_profiles (collab table)
   */
  addCollaborator(searchResult) {
    const {currentProject} = this.props;
    const pid = currentProject.id;
    const uid = searchResult.uid;
    const atMax = currentProject.collaborators.length >= this.state.MAX_COLLABS;
    if (uid && pid && !atMax) {
      const payload = {uid, pid};
      axios.post("/api/projects/addcollab", payload).then(resp => {
        if (resp.status === 200) {
          currentProject.collaborators = currentProject.collaborators.concat(searchResult);
          this.setState({currentProject});
        }
        else {
          console.log("error");
        }
      });
    }
  }

  /**
   * Given a uid and the pid of the current project, remove the matching row from userprofiles_profiles
   */
  removeCollaborator(uid) {
    const {currentProject} = this.props;
    const pid = currentProject.id;
    if (uid && pid) {
      const payload = {uid, pid};
      axios.post("/api/projects/removecollab", payload).then(resp => {
        if (resp.status === 200) {
          currentProject.collaborators = currentProject.collaborators.filter(c => c.uid !== uid);
          this.setState({currentProject});
        }
        else {
          console.log("error");
        }
      });
    }
  }

  render() {

    const {t, currentProject} = this.props;
    const {users, query, filterLoc, filterSchool} = this.state;
    const collabs = currentProject.collaborators;
    const atMax = collabs.length >= this.state.MAX_COLLABS;

    // do not include a current collaborator in the search results
    let usersWithoutCollabs = users.filter(u => !collabs.map(c => c.uid).includes(u.uid));

    const locList = Array.from(new Set(usersWithoutCollabs
      .map(r => r.geo && r.geo.name ? r.geo.name : null)))
      .filter(loc => Boolean(loc))
      .map(loc =>
        <option key={loc} value={loc}>{loc}</option>
      );

    /*
    const schoolList = Array.from(new Set(usersWithoutCollabs
      .map(r => r.school && r.school.name ? r.school.name : null)))
      .filter(school => Boolean(school))
      .map(school =>
        <option key={school} value={school}>{school}</option>
      );
    */

    if (filterLoc && filterLoc !== "default") {
      usersWithoutCollabs = usersWithoutCollabs.filter(u => u.geo && u.geo.name && u.geo.name === filterLoc);
    }

    if (filterSchool && filterSchool !== "default") {
      usersWithoutCollabs = usersWithoutCollabs.filter(u => u.school && u.school.name && u.school.name === filterSchool);
    }

    // available collaborators
    const userList = usersWithoutCollabs.map(r =>
      <li className="collab-item available-collab-item card-container" key={r.id}>

        {/* add collaborator button */}
        <button className="card-trigger u-absolute-expand u-unbutton u-margin-top-off u-margin-bottom-off" onClick={this.addCollaborator.bind(this, r)}>
          <span className="u-visually-hidden">{ t("Collab.Add") }</span>
        </button>

        {/* card inner */}
        <span className="card collab-inner">

          <span className="collab-avatar">
            {/* show user image if one is found */}
            <span className="collab-avatar-img" style={
              r.img
                ? {backgroundImage: `url(/uploads/${r.img})`}
                : {backgroundImage: "url(/avatars/avatar-excited-cropped.jpg)"}
            } />
            {/* action indicator */}
            <span className="action-indicator">
              <span className="action-indicator-icon pt-icon pt-icon-plus" />
            </span>
          </span>

          {/* name */}
          <span className="collab-caption">
            <h4 className="collab-heading u-margin-top-off u-margin-bottom-off">{r.user.username}</h4>
            {/* {r.geo && r.geo.name ? <p><Icon iconName="map-marker" /> {r.geo.name}</p> : null}
            {r.school && r.school.name ? <p><Icon iconName="office" /> {r.school.name}</p> : null} */}
          </span>
        </span>
      </li>
    );

    // current collaborators
    const collabList = collabs.map(r =>
      <li className="collab-item current-collab-item card-container" key={r.id}>
        {/* remove collaborator button */}
        <button className="card-trigger u-absolute-expand u-unbutton u-margin-top-off u-margin-bottom-off" onClick={this.removeCollaborator.bind(this, r.uid)}>
          <span className="u-visually-hidden">{ t("Collab.Remove") }</span>
        </button>

        { console.log(r.img) }

        {/* card inner */}
        <span className="card collab-inner">

          <span className="collab-avatar">
            {/* show user image if one is found */}
            <span className="collab-avatar-img" style={
              r.img
                ? {backgroundImage: `url(/uploads/${r.img})`}
                : {backgroundImage: "url(/avatars/avatar-excited-cropped.jpg)"}
            } />
            {/* action indicator */}
            <span className="action-indicator">
              <span className="action-indicator-icon pt-icon pt-icon-small-cross" />
            </span>
          </span>

          {/* name */}
          <span className="collab-caption">
            <h4 className="collab-heading u-margin-top-off u-margin-bottom-off">{r.user.username}</h4>
            {/* {r.geo && r.geo.name ? <p><Icon iconName="map-marker" /> {r.geo.name}</p> : null}
            {r.school && r.school.name ? <p><Icon iconName="office" /> {r.school.name}</p> : null} */}
          </span>
        </span>
      </li>
    );

    // markup for placeholder collaborator slot
    const emptySlot =
    <li className="collab-item placeholder-collab-item">
      {/* img */}
      <span className="collab-avatar" />
      {/* name */}
      <div className="collab-caption">
        <h4 className="collab-heading u-margin-top-off u-margin-bottom-off">
          {t("Slot")} <span className="placeholder-collab-item-count" /> {t("open")}
        </h4>
      </div>
    </li>;

    // add / remove placeholder slots as necessary
    if (!atMax) {
      let i = currentProject.collaborators.length;
      for (i; i < this.state.MAX_COLLABS; i++) {
        collabList.push(emptySlot);
      }
    }

    return (
      <div className="collab-container">

        {/* heading */}
        <h2 className="collab-heading font-xl u-text-center">{t("Collab.Manage")}</h2>
        <p className="collab-subhead heading font-md u-text-center">{currentProject.name}</p>

        {/* wrapper around controls and search results */}
        <div className="collab-outer">

          {/* controls */}
          <div className="collab-controls">

            {/* search */}
            <div className="collab-search-controls">

              {/* heading */}
              <h3 className="collab-search-heading font-sm">{t("Collab.AddCollaborators")}</h3>

              {/* main search input */}
              <div className="field-container font-sm has-icon">
                <label className="font-xs" htmlFor="collab-search">
                  { t("Search.Users") }
                </label>
                <input className="field-input"
                  id="collab-search"
                  value={query}
                  type="text"
                  name="collab-search"
                  onChange={this.handleChange.bind(this)}
                  autoFocus />
                <span className="field-icon pt-icon pt-icon-search" />
              </div>

              {/* location filter */}
              <div className="field-container font-sm">
                <label className="font-xs" htmlFor="collab-location-filter">
                  { t("Collab.LocationFilterLabel") }
                </label>
                <div className="pt-select">
                  <select className="field-input"
                    id="collab-location-filter"
                    value={this.state.filterLoc}
                    onChange={e => this.setState({filterLoc: e.target.value})}>
                    <option value="default">
                      {t("Collab.LocationFilterInitialValue") }
                    </option>
                    {locList}
                  </select>
                </div>
              </div>

              {/* school filter */}
              <div className="field-container font-sm">
                <label className="font-xs" htmlFor="school-location-filter">
                  { t("Collab.SchoolFilterLabel") }
                </label>
                <div className="pt-select">
                  <select className="field-input"
                    id="school-location-filter"
                    value={this.state.filterSchool}
                    onChange={e => this.setState({filterSchool: e.target.value})}>
                    <option value="default">
                      {t("Collab.SchoolFilterInitialValue") }
                    </option>
                    {locList}
                  </select>
                </div>
              </div>
            </div>

            {/* current collaborators */}
            <div className="collab-selections">
              {/* heading */}
              <h3 className="collab-search-heading font-sm">{t("Collab.CurrentCollaborators")}</h3>
              <ul className="collab-list u-list-reset">
                {collabList}
              </ul>
            </div>
          </div>

          {/* search results */}
          <div className="collab-search-results">

            {/* hidden heading for accessiblity and message styling */}
            <h3 className="collab-search-results-heading u-hide-above-sm font-sm">{t("Search.Results")}</h3>

            {/* results list */}
            {!atMax && query.length >= 3 && userList !== null
              ? <div className="collab-list-results-container">
                <ul className="collab-list-results u-list-reset"> {userList} </ul>
              </div>
              : null }
            {/* message */}
            <div className="collab-results-message u-vertical-align-children">

              {/* Message: start typing */}
              <h3 className={!atMax && query.length === 0 ? "collab-results-heading font-lg u-margin-bottom-off u-text-center" : "collab-results-heading is-hidden"}>{t("Search.StartTyping")}</h3>

              {/* Message: keep typing */}
              <h3 className={!atMax && query.length > 0 && query.length < 3 ? "collab-results-heading font-lg u-margin-bottom-off u-text-center" : "collab-results-heading is-hidden"}>{t("Search.KeepTyping")}</h3>

              {/* Message: no more results */}
              {!atMax && query.length >= 3
                ? <div className="clear-collab-results u-text-center">
                  <h3 className="collab-results-heading font-md">{t("Collab.NoMoreResults")}</h3>
                  {/* buttons */}
                  <div className="clear-collab-button-group u-button-group">
                    <button className="pt-button pt-intent-danger"
                      onClick={this.clearSearch.bind(this)}>
                      <span className="pt-icon pt-icon-search" />
                      { t("Collab.ClearSearch") }
                    </button>
                    {/* display clear filter button if filters have been set */}
                    { filterLoc !== "default" || filterSchool !== "default"
                      ? <button className="pt-button pt-intent-danger"
                        onClick={this.clearFilters.bind(this)}>
                        <span className="pt-icon pt-icon-filter" />
                        { t("Collab.ClearFilters") }
                      </button>
                      : null }
                  </div>
                </div>
                : null}

              {/* Message: max collabs cap */}
              <h3 className={atMax ? "collab-results-heading font-lg u-margin-bottom-off u-text-center" : "collab-results-heading is-hidden"}>{t("Collab.AtMax")}</h3>

            </div>
          </div>
        </div>
      </div>
    );
  }
}

CollabSearch = connect(state => ({
  auth: state.auth
}))(CollabSearch);
CollabSearch = translate(undefined, {withRef: true})(CollabSearch);
export default CollabSearch;
