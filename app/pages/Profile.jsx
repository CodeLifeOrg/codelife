import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import Nav from 'components/Nav';

class Profile extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>Profile</h1>
        <p>I'm a user</p>
        <Nav />
      </div>
    );
  }
}

export default translate()(Profile);