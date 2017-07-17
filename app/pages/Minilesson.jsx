import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {connect} from "react-redux";
import axios from "axios";
import "./Minilesson.css";

class Minilesson extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      minilessons: [],
      lesson: null,
      userProgress: null,
      gotUserFromDB: false
    };
  }

  componentDidUpdate() {
    const {user} = this.props;
    const {gotUserFromDB} = this.state;

    if (user && !gotUserFromDB) {
      this.setState({gotUserFromDB: true});
      axios.get(`/api/userprogress?uid=${user.id}`).then (resp => {
        this.setState({userProgress: resp.data});
      });
    }
  }

  componentDidMount() {
    axios.get(`/api/minilessons?lid=${this.props.params.lid}`).then(resp => {
      this.setState({minilessons: resp.data});
    });
    axios.get(`/api/lessons?id=${this.props.params.lid}`).then(resp => {
      this.setState({lesson: resp.data[0]});
    });
  }

  render() {
    
    const {t} = this.props;
    const {lid} = this.props.params;
    const {minilessons, lesson, userProgress} = this.state;

    if (!lesson || minilessons === [] || !userProgress) return <h1>Loading...</h1>;

    const minilessonItems = minilessons.map(minilesson => 
      <li key={minilesson.id}><Link className={userProgress.find(up => up.level === minilesson.id) !== undefined ? "ml_link completed" : "ml_link"} to={`/lesson/${lid}/${minilesson.id}`}>{ minilesson.name }</Link></li>);

    return (
      <div>
        <h1>{lesson.name}</h1>
        <p>{lesson.description}</p>
        <ul>{minilessonItems}</ul>
        <Link className="editor-link" to={`/editor/${lid}`}>Go to my editor (My Snippet)</Link>
        <Nav />
      </div>
    );
  }
}

Minilesson = connect(state => ({
  user: state.auth.user
}))(Minilesson);
Minilesson = translate()(Minilesson);
export default Minilesson;
