import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";

// Studio Page
// Test zone for inline code editing

class Studio extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>{ t("Studio") }</h1>
        <form>
          
          <textarea name="ide" rows="30" cols="100">write your code here</textarea>
          <br/>
          <input type="submit" />
        </form>
        <Nav />
      </div>
    );
  }
}

export default translate()(Studio);
