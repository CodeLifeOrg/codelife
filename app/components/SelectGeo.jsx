import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/labs";
import STATES from "pages/profile/states";
import "@blueprintjs/labs/dist/blueprint-labs.css";

import "./SelectGeo.css";

/** 
 * Component for selecting a location from a database of geo codes in Brazil
 */

class SelectGeo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: null,
      geos: [],
      filteredGeos: [],
      geoQuery: ""
    };
  }

  /**
   * On Mount, get the gid (embedded in props via userprofile) and populate the search bar accordingly
   */
  componentDidMount() {
    const {gid} = this.props;
    // the hard-coded "-1" is used to indicate that this user has overtly elected to opt-out of providing their location.
    if (gid && gid !== "-1") {
      const state = gid.substr(0, 3);
      axios.get(`/api/geos/?state=${state}`).then(geosResp => {
        const homeGeo = geosResp.data[geosResp.data.findIndex(geo => geo.id === gid)];
        const geoQuery = homeGeo.name;
        this.setState({
          loading: false,
          geos: geosResp.data,
          filteredGeos: geosResp.data,
          geoQuery,
          homeGeo
        });
      });
    }
    else {
      this.setState({loading: false});
    }
  }

  /**
   * Callback for the select box. Contains some code from what was going to be an "Unspecified" option, but was 
   * changed to a higher up "Rather not say" option in EditProfile.jsx which cancels out the dialog entirely 
   * and writes a hard-coded "-1" to the user's geo id. 
   */
  changeState(e) {
    const {callback} = this.props;
    const state = e.target.value;
    if (state === "unspecified") {
      
      /*
      this.setSelectedGeo({
        id: "unspecified",
        name: "Unspecified"
      });
      */
    }
    else {
      axios.get(`/api/geos/?state=${state}`).then(geosResp => {
        const homeGeo = geosResp.data[0];
        const geoQuery = homeGeo.name;
        this.setState({
          geos: geosResp.data,
          filteredGeos: geosResp.data,
          geoQuery,
          homeGeo
        });
        callback(homeGeo);
      });
    }
  }

  filterGeos(e) {
    const searchQuery = e.target.value;
    const {geos} = this.state;
    this.setState({
      filteredGeos: geos.filter(g => g.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0),
      geoQuery: searchQuery
    });
  }

  setSelectedGeo(selectedGeo) {
    console.log(selectedGeo);
    const {callback} = this.props;
    this.setState({
      homeGeo: selectedGeo,
      geoQuery: selectedGeo.name
    });
    callback(selectedGeo);
  }

  render() {
    const {gid, t, context} = this.props;
    const {loading, error, geos, filteredGeos, homeGeo} = this.state;
    const state = gid ? gid.substr(0, 3) : null;
    const filterGeos = this.filterGeos.bind(this);
    const setSelectedGeo = this.setSelectedGeo.bind(this);
    const changeState = this.changeState.bind(this);
    const popoverProps = {
      popoverClassName: "geosearch-popover pt-minimal",
      inline: true
    };

    if (loading || error) {
      return (
        <div className="geosearch-container">
          { error ? <h1 className="font-sm">{error}</h1> : null }
        </div>
      );
    }

    return (
      <div className="geosearch-container">

        {/* select state */}
        <div className="field-container state-select-container font-md">
          <label className="font-sm" htmlFor={`${context}-state-select`}>{ t("State") }</label>
          <div className="pt-select">
            <select className="field-input"
              id={`${context}-state-select`}
              value={state || ""}
              onChange={changeState}>
              {/*<option value="unspecified">{t("Unspecified")}</option>*/}
              {STATES.map(s =>
                <option key={s.id} value={s.id}>
                  {`${s.id.substr(1, 2).toUpperCase()} - ${s.name}`}
                </option>)}
            </select>
          </div>
          {/* <span className="field-icon pt-icon pt-icon-application" /> */}
        </div>

        {/* select city */}
        <div className="field-container city-select-container font-md u-margin-top-off">
          <label className="font-sm" htmlFor={`${context}-city-select`}>{ t("City") }</label>
          <Select
            popoverProps={popoverProps}
            className={ geos.length ? "city-select pt-minimal" : "city-select pt-minimal is-disabled" }
            resetOnSelect={true}
            items={filteredGeos}
            inputProps={{onChange: filterGeos}}
            onItemSelect={setSelectedGeo}
            itemRenderer={ ({handleClick, item: geo, isActive}) =>
              <MenuItem onClick={handleClick}
                className={ homeGeo.id === geo.id || isActive ? "is-focused" : "" }
                text={ geo ? geo.name : null } />
            }
            noResults={
              <MenuItem disabled text={t("noResults")} />
            }>
            <div className="field-container">
              <Button
                className="select-trigger font-md u-margin-top-off"
                id={`${context}-city-select`}
                text={homeGeo ? homeGeo.name : ""} rightIconName="geosearch" />
            </div>
          </Select>
        </div>
      </div>
    );
  }
}

SelectGeo.defaultProps = {
  context: "location" // used to give fields unique IDs
};

export default translate()(SelectGeo);
