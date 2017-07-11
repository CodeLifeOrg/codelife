import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import axios from "axios";

class Minilesson extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      minilessons: []
    };
  }

  componentDidMount() {
    axios.get(`/api/minilessons?lid=${this.props.params.lid}`).then(resp => {
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
        <Link className="editor-link" to={`/editor/${lid}`}>Go to my editor</Link>
        <Nav />
      </div>
    );
  }
}

export default translate()(Minilesson);
