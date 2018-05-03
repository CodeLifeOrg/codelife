import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Link} from "react-router";

import UserCard from "components/UserCard";
import "./CollabList.css";

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

// <li className="collab-list-item current-collab-item card-container" key={r.id}>
//   {/* remove collaborator button */}
//   <Link to="" className="card-trigger u-absolute-expand u-margin-top-off u-margin-bottom-off">
//     <span className="u-visually-hidden">{ t("View profile") }</span>
//   </Link>
//
//   {/* card inner */}
//   <span className="card collab-inner">
//
//     <span className="collab-list-avatar">
//       {/* show user image if one is found */}
//       { r.user.img
//         ? <span className="collab-list-avatar-img" style={{backgroundImage: `url(/uploads/${r.user.img})`}} />
//         : <span className="collab-list-avatar-icon pt-icon pt-icon-person" />
//       }
//       {/* action indicator */}
//       <span className="action-indicator">
//         <span className="action-indicator-icon pt-icon pt-icon-arrow-right" />
//       </span>
//     </span>
//
//     {/* name */}
//     <span className="collab-list-caption">
//       <h3 className="collab-list-heading u-margin-top-off u-margin-bottom-off font-sm">{r.user.username}</h3>
//     </span>
//   </span>
// </li>


CollabList = connect(state => ({
  auth: state.auth
}))(CollabList);
CollabList = translate(undefined, {withRef: true})(CollabList);
export default CollabList;
