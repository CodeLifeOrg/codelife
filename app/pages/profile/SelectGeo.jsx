import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Classes, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/labs";

const STATES = [
  {id: "1ac", name: "Acre"},
  {id: "1am", name: "Amazonas"},
  {id: "1ap", name: "Amapá"},
  {id: "1pa", name: "Pará"},
  {id: "1ro", name: "Rondônia"},
  {id: "1rr", name: "Roraima"},
  {id: "1to", name: "Tocantins"},
  {id: "2al", name: "Alagoas"},
  {id: "2ba", name: "Bahia"},
  {id: "2ce", name: "Ceará"},
  {id: "2ma", name: "Maranhão"},
  {id: "2pb", name: "Paraíba"},
  {id: "2pe", name: "Pernambuco"},
  {id: "2pi", name: "Piauí"},
  {id: "2rn", name: "Rio Grande do Norte"},
  {id: "2se", name: "Sergipe"},
  {id: "3df", name: "Distrito Federal"},
  {id: "3go", name: "Goiás"},
  {id: "3ms", name: "Mato Grosso do Sul"},
  {id: "3mt", name: "Mato Grosso"},
  {id: "4es", name: "Espírito Santo"},
  {id: "4mg", name: "Minas Gerais"},
  {id: "4rj", name: "Rio de Janeiro"},
  {id: "4sp", name: "São Paulo"},
  {id: "5pr", name: "Paraná"},
  {id: "5rs", name: "Rio Grande do Sul"},
  {id: "5sc", name: "Santa Catarina"}
];

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
  }

  changeState(e) {
    const {setGid} = this.props;
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
      setGid(homeGeo);
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
    const {setGid} = this.props;
    this.setState({
      homeGeo: selectedGeo,
      geoQuery: selectedGeo.name
    });
    setGid(selectedGeo);
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
      <div className="pt-form-group pt-inline">
        <label className="pt-label" htmlFor="example-form-group-input-d">
          {t("Where are you from?")}
        </label>
        <div className="pt-form-content">
          <div className="pt-select">
            <select onChange={changeState} value={state || ""}>
              {STATES.map(s => <option key={s.id} value={s.id}>{`${s.id.substr(1, 2).toUpperCase()} - ${s.name}`}</option>)}
            </select>
          </div>
          { geos.length
            ? <Select
              resetOnSelect={true}
              items={filteredGeos}
              inputProps={{value: geoQuery, onChange: filterGeos}}
              itemRenderer={({handleClick, item: geo, isActive}) => <MenuItem onClick={handleClick} className={(homeGeo.id === geo.id || isActive) ? Classes.ACTIVE : ""} text={geo.name} />}
              onItemSelect={setSelectedGeo}
              noResults={<MenuItem disabled text="No results." />}
            >
              <Button text={homeGeo ? homeGeo.name : ""} rightIconName="double-caret-vertical" />
            </Select> : null}
        </div>
      </div>
    );
  }
}

export default translate()(SelectGeo);
