import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";

import UserCard from "components/UserCard";
import "./CollabList.css";

/** 
 * Provides a list of Collaborators for a project provided by props.
 */

class CollabList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: "",
      users: []
    };
  }

  render() {
    const {t, currentProject} = this.props;
    const collabs = currentProject.collaborators;

    // UserCard requires a certain user format to display all the fields correctly. 
    // Extract the project owner and collaborators from the project and prep them for use with UserCard.
    // project owner
    const collabOwner = {
      bio: currentProject.userprofile.bio,
      id: currentProject.uid,
      img: currentProject.userprofile.img,
      name: currentProject.user.name,
      username: currentProject.user.username
    };

    // project collaborators
    const collabList = collabs.map(user => {
      const collabUser = {
        bio: user.bio,
        id: user.uid,
        img: user.img,
        name: user.user.name,
        username: user.user.username
      };
      // console.log(collabUser);
      return <UserCard user={collabUser} key={user.id} />;
    });

    return (
      <div className="collab-list-inner">

        {/* heading */}
        <h2 className="collab-list-heading font-xl u-text-center">{currentProject.name}</h2>

        {/* project owner */}
        <div className="collab-list">
          <h3 className="collab-list-subhead">
            {t("Collab.Owner")}
          </h3>

          <UserCard user={collabOwner} key={collabOwner.id} />
        </div>


        {/* current collaborators */}
        <div className="collab-list">
          <h3 className="collab-list-subhead">
            {t("Collab.Collaborators")}
          </h3>
          {collabList}
        </div>
      </div>
    );
  }
}


CollabList = connect(state => ({
  auth: state.auth
}))(CollabList);
CollabList = translate(undefined, {withRef: true})(CollabList);
export default CollabList;
