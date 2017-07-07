import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import axios from "axios";

// Minilesson Page
// Lists available lessons.  A lesson id, or "lid", is stored in the database.
// The lid is also used as the navigational slug in the URL of the page.

class Minilesson extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      minilessons: []
    };
  }

  componentDidMount() {
    axios.get(`/api/minilessons?lid=${this.props.params.lid}`).then(resp => {
      console.log(resp);
      this.setState({minilessons: resp.data});
    });
  }

  render() {
    
    const {t} = this.props;
    const {lid} = this.props.params;

    const {minilessons} = this.state;

    if (minilessons === []) return <h1>Loading...</h1>;

    const minilessonItems = minilessons.map(minilesson => 
      <li key={minilesson.id}><Link className="link" to={`/lesson/${lid}/${minilesson.id}`}>{ minilesson.name }</Link></li>);

    return (
      <div>
        <h1>{t("Minilessons")}</h1>
        <ul>{minilessonItems}</ul>
        <Nav />
      </div>
    );
  }
}

export default translate()(Minilesson);
