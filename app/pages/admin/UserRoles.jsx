import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import axios from "axios";
import LoadingSpinner from "components/LoadingSpinner";
import "./UserRoles.css";

// NOTE: copied in from https://github.com/Datawheel/datawheel-canon/blob/master/src/components/UserAdmin.jsx

class UserRoles extends Component {

  constructor(props) {
    super(props);
    this.state = {
      users: [],
      query: ""
    };
  }

  componentDidMount() {
    axios.get("/auth/users").then(res => this.setState({users: res.data}));
  }

  onChangeRole(event, user) {
    const role = event.target.value;
    user.role = false;
    this.forceUpdate();
    axios.post(`/auth/users/update?id=${user.id}&role=${role}`).then(() => {
      user.role = role;
      this.forceUpdate();
    });
  }

  render() {
    const {t} = this.props;
    const {users} = this.state;

    // define users by role
    let {adminUsers, contributorUsers, basicUsers} = [];
    if (users) {
      adminUsers = users.filter(user => user.role === 2);
      contributorUsers = users.filter(user => user.role === 1);
      basicUsers = users.filter(user => user.role === 0);
    }

    return (
      <div className="admin-roles">
        <h1 className="font-xl u-text-center u-margin-bottom-off">{t("User roles")}</h1>

        { !users.length && <LoadingSpinner label={false} /> }

        <div className="admin-roles-inner">
          <div className="admin-user-column">
            { adminUsers.length
              ? <div className="admin-user-group">
                <h2 className="admin-user-heading u-margin-top-lg u-margin-bottom-sm">{t("Admin")}</h2>
                <ul className="admin-user-list font-sm u-list-reset">
                  { adminUsers.map(user =>
                    <li className="admin-user-item" key={ user.id } data-username={ `${user.username} ${user.name ? user.name : null }` }>
                      {/* name & link to profile */}
                      <Link className="admin-user-link link" to={ `/profile/${user.username}` }>
                        { user.name ? user.name : user.username }
                      </Link>
                      {/* role select; hidden by default */}
                      <select className="admin-user-role" value={ user.role } onChange={event => this.onChangeRole.bind(this)(event, user)} disabled={ user.role === false }>
                        <option value="2">{ t("Admin") }</option>
                        <option value="1">{ t("Contributor") }</option>
                        <option value="0">{ t("User") }</option>
                      </select>
                    </li>
                  )}
                </ul>
              </div>
              : null
            }

            { contributorUsers.length
              ? <div className="admin-user-group">
                <h2 className="admin-user-heading u-margin-top-lg u-margin-bottom-sm">{t("Contributor")}</h2>
                <ul className="admin-user-list font-sm u-list-reset">
                  { contributorUsers.map(user =>
                    <li className="admin-user-item" key={ user.id } data-username={ `${user.username} ${user.name ? user.name : null }` }>
                      {/* name & link to profile */}
                      <Link className="admin-user-link link" to={ `/profile/${user.username}` }>
                        { user.name ? user.name : user.username }
                      </Link>
                      {/* role select; hidden by default */}
                      <select className="admin-user-role" value={ user.role } onChange={event => this.onChangeRole.bind(this)(event, user)} disabled={ user.role === false }>
                        <option value="2">{ t("Admin") }</option>
                        <option value="1">{ t("Contributor") }</option>
                        <option value="0">{ t("User") }</option>
                      </select>
                    </li>
                  )}
                </ul>
              </div>
              : null
            }
          </div>

          { basicUsers.length
            ? <div className="admin-user-column">
              <div className="admin-user-group">
                <h2 className="admin-user-heading u-margin-top-lg u-margin-bottom-sm">{t("User")}</h2>
                <ul className="basic-admin-user-list admin-user-list font-sm u-list-reset">
                  { basicUsers.map(user =>
                    <li className="admin-user-item" key={ user.id } data-username={ `${user.username} ${user.name}` }>
                      {/* name & link to profile */}
                      <Link className="admin-user-link link" to={ `/profile/${user.username}` }>
                        { user.name ? user.name : user.username }
                      </Link>
                      {/* role select; hidden by default */}
                      <select className="admin-user-role" value={ user.role } onChange={event => this.onChangeRole.bind(this)(event, user)} disabled={ user.role === false }>
                        <option value="2">{ t("Admin") }</option>
                        <option value="1">{ t("Contributor") }</option>
                        <option value="0">{ t("User") }</option>
                      </select>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            : null
          }
        </div>
      </div>
    );
  }
}

export default translate()(UserRoles);
