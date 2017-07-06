import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listMinilessonsByLessonID} from "api";

// Minilesson Page
// Lists available lessons.  A lesson id, or "lid", is stored in the database.
// The lid is also used as the navigational slug in the URL of the page.

class Minilesson extends Component {

  render() {
    
    const {t} = this.props;
    const {lid} = this.props.params;

    const minilessonArray = listMinilessonsByLessonID(parseInt(lid, 10));

    const minilessonItems = minilessonArray.map(minilesson => 
      <li key={minilesson.id}><Link className="link" to={`/lesson/${lid}/${minilesson.id}`}>{ minilesson.title }</Link></li>);

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
