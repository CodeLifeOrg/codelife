import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Classes, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/labs";
import SelectGeo from "./SelectGeo";

class SelectSchool extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: null,
      schools: [],
      filteredSchools: [],
      schoolQuery: ""
    };
  }

  componentWillMount() {
    const {sid} = this.props;
    if (sid) {
      axios.get(`/api/schoolsBySid?sid=${sid}`).then(schoolsResp => {
        const mySchool = schoolsResp.data[schoolsResp.data.findIndex(school => school.id === sid)];
        const schoolQuery = mySchool.name;
        this.setState({
          loading: false,
          schools: schoolsResp.data,
          filteredSchools: schoolsResp.data,
          schoolQuery,
          mySchool
        });
      });
    }
    else {
      this.setState({loading: false});
    }
  }

  updateSchoolList(geo) {
    // console.log('updateSchoolList', geo)
    // return
    const {id: gid} = geo;
    this.setState({loading: true});
    axios.get(`/api/schoolsByGid?gid=${gid}`).then(schoolsResp => {
      if (schoolsResp.data.length) {
        const mySchool = schoolsResp.data[0];
        const schoolQuery = mySchool.name;
        this.setState({
          loading: false,
          schools: schoolsResp.data,
          filteredSchools: schoolsResp.data,
          schoolQuery,
          mySchool
        });
      }
    });
  }

  filterSchools(e) {
    const searchQuery = e.target.value;
    const {schools} = this.state;
    this.setState({
      filteredSchools: schools.filter(g => g.name.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0),
      schoolQuery: searchQuery
    });
  }

  setSelectedSchool(selectedSchool) {
    const {callback} = this.props;
    this.setState({
      mySchool: selectedSchool,
      schoolQuery: selectedSchool.name
    });
    callback(selectedSchool);
  }

  render() {
    const {loading, error, mySchool, schools, filteredSchools, schoolQuery} = this.state;

    if (loading) return <p>Loading ...</p>;
    if (error) return <h1>{error}</h1>;

    const filterSchools = this.filterSchools.bind(this);
    const setSelectedSchool = this.setSelectedSchool.bind(this);
    const updateSchoolList = this.updateSchoolList.bind(this);
    const gid = mySchool ? mySchool.gid : null;

    return (
      <div>
        <SelectGeo gid={gid} callback={updateSchoolList} />
        <div className="pt-form-content">
          { schools.length
            ? <Select
              resetOnSelect={true}
              items={filteredSchools}
              inputProps={{value: schoolQuery, onChange: filterSchools}}
              itemRenderer={({handleClick, item: geo, isActive}) => <MenuItem onClick={handleClick} className={mySchool.id === geo.id || isActive ? Classes.ACTIVE : ""} text={geo.name} />}
              onItemSelect={setSelectedSchool}
              noResults={<MenuItem disabled text="No results." />}
            >
              <Button text={mySchool ? mySchool.name : ""} rightIconName="caret-down" />
            </Select> : null}
        </div>
      </div>
    );
  }

}

export default translate()(SelectSchool);
