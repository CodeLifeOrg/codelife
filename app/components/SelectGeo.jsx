import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Classes, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/labs";
import STATES from "pages/profile/states";
import "@blueprintjs/labs/dist/blueprint-labs.css";

import "./SelectGeo.css";

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

  componentWillMount() {
    const {gid} = this.props;
    if (gid) {
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

  changeState(e) {
    const {callback} = this.props;
    const state = e.target.value;
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

  filterGeos(e) {
    const searchQuery = e.target.value;
    const {geos} = this.state;
    this.setState({
      filteredGeos: geos.filter(g => g.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0),
      geoQuery: searchQuery
    });
  }

  setSelectedGeo(selectedGeo) {
    const {callback} = this.props;
    this.setState({
      homeGeo: selectedGeo,
      geoQuery: selectedGeo.name
    });
    callback(selectedGeo);
  }

  render() {
    const {gid, t, context} = this.props;
    const {loading, error, geos, filteredGeos, geoQuery, homeGeo} = this.state;
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
              {/* <option value="unspecified" /> */}
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
