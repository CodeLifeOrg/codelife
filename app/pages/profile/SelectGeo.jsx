import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Classes, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/labs";
import STATES from "./states";
import "@blueprintjs/labs/dist/blueprint-labs.css";

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
    const {gid, t} = this.props;
    const {loading, error, geos, filteredGeos, geoQuery, homeGeo} = this.state;
    const state = gid ? gid.substr(0, 3) : null;

    const changeState = this.changeState.bind(this);
    const filterGeos = this.filterGeos.bind(this);
    const setSelectedGeo = this.setSelectedGeo.bind(this);

    if (loading) return <p>Loading ...</p>;
    if (error) return <h1>{error}</h1>;

    return (
      <div className="pt-form-content">
        <div className="pt-select">
          <select onChange={changeState} value={state || ""}>
            {STATES.map(s => <option key={s.id} value={s.id}>{`${s.name} (${s.id.substr(1, 2).toUpperCase()})`}</option>)}
          </select>
        </div>
        { geos.length
          ? <Select
            resetOnSelect={true}
            items={filteredGeos}
            inputProps={{value: geoQuery, onChange: filterGeos}}
            itemRenderer={({handleClick, item: geo, isActive}) => <MenuItem onClick={handleClick} className={homeGeo.id === geo.id || isActive ? Classes.ACTIVE : ""} text={geo.name} />}
            onItemSelect={setSelectedGeo}
            noResults={<MenuItem disabled text="No results." />}
          >
            <Button text={homeGeo ? homeGeo.name : ""} rightIconName="caret-down" />
          </Select> : null}
      </div>
    );
  }
}

export default translate()(SelectGeo);
