import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/labs";
import SelectGeo from "components/SelectGeo";

/** 
 * Component for choosing a school from a db of school ids and geos - meant to be used in conjunction with SelectGeo
 */

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

  /**
   * On Mount, get the sid from props (originally retrieved from userprofile) and populate the dropdown accordingly
   */
  componentDidMount() {
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

  // This was added to limit the school list to Minas Gerais - but not sure why there are two componentDidMount functions?? TODO: revisit this  
  componentDidMount() {
    this.updateSchoolList({id: "4mg000000"});
  }

  /**
   * Callback for dual dropdown - Given a selected Geo, hit the API to retrieve all the schools for that Geo and populate the dropdown.
   */
  updateSchoolList(geo) {
    const {t} = this.props;
    const {id: gid} = geo;
    this.setState({loading: true});
    axios.get(`/api/schoolsByGid?gid=${gid}`).then(schoolsResp => {
      if (schoolsResp.data.length) {
        const mySchool = schoolsResp.data[0];
        const schoolQuery = mySchool.name;
        this.setState({
          error: null,
          loading: false,
          schools: schoolsResp.data,
          filteredSchools: schoolsResp.data,
          schoolQuery,
          mySchool
        });
      }
      else {
        this.setState({
          loading: false,
          error: t("schoolListUnavailable")
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
    const {t} = this.props;
    const {loading, error, mySchool, schools, filteredSchools} = this.state;

    if (loading) return <div className="school-geosearch-container"></div>;

    const filterSchools = this.filterSchools.bind(this);
    const setSelectedSchool = this.setSelectedSchool.bind(this);
    const updateSchoolList = this.updateSchoolList.bind(this);
    const gid = mySchool ? mySchool.gid : null;
    const popoverProps = {
      popoverClassName: "geosearch-popover pt-minimal",
      inline: true
    };

    return (
      <div className="school-geosearch-container">

        {/* select state & city */}
        <SelectGeo gid={gid} callback={updateSchoolList} context="school" />
        {error ? <p>{error}</p> : null}

        {/* select school */}
        <div className="field-container school-select-container font-md">
          <label className="font-sm" htmlFor="school-select">{ t("School") }</label>
          {schools.length && !error
            ? <Select
              popoverProps={popoverProps}
              resetOnSelect={true}
              items={filteredSchools}
              inputProps={{onChange: filterSchools}}
              itemRenderer={({handleClick, item: geo, isActive}) => <MenuItem onClick={handleClick} className={mySchool.id === geo.id || isActive ? "is-focused" : ""} text={geo.name} />}
              onItemSelect={setSelectedSchool}
              noResults={<MenuItem disabled text={t("noResults")} />}
            >
              <div className="field-container">
                <Button
                  className="select-trigger font-md u-margin-top-off"
                  id="school-select"
                  text={mySchool ? mySchool.name : ""} rightIconName="geosearch" />
              </div>
            </Select> : null}
        </div>
      </div>
    );
  }
}

export default translate()(SelectSchool);
