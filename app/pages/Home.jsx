import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";
import {Link} from "react-router";


// Home Page
// Currently Contains only the Nav element, for navigation.

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      introduction: null
    };
  }

  componentDidMount() {
    axios.get("/api/sitecontents?name=introduction").then(resp => {
      this.setState({introduction: resp.data[0].htmlcontent});
    });
  }

  render() {
    
    const {t} = this.props;
    const {introduction} = this.state;

    if (!introduction) return <h1>Loading ...</h1>;

    return (
      <div>
        <h1><img className="image" width="40" height="40" src="icon.svg" />&nbsp;{ t("Codelife") }</h1>
        <div id="intro">{introduction}</div>
        <Nav />
      </div>
    );
  }
}

export default translate()(Home);
