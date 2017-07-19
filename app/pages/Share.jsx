import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import Nav from "components/Nav";
import axios from "axios";
import "./Share.css";

class Share extends Component {

  constructor(props) {
    super(props);
    this.state = {
      content: null
    };
  }

  renderPage() {
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.state.content.studentcontent);
      doc.close();
    }
  }

  componentDidMount() {
    const {type, id} = this.props.params;
    if (type === "snippet") {
      axios.get(`/api/snippets/byid?id=${id}`).then(resp => {
        this.setState({content: resp.data[0]}, this.renderPage.bind(this));
      }); 
    }
    if (type === "project") {
      axios.get(`/api/projects/byid?id=${id}`).then(resp => {
        this.setState({content: resp.data[0]}, this.renderPage.bind(this));
      }); 
    }
  }

  render() {
    
    const {t} = this.props;
    const {content} = this.state;

    if (!content) return <h1>Loading...</h1>;

    return (
      <div>
        <iframe id="sharecontainer" ref="rc" frameBorder="0" width="100%" height="100%" />
      </div>
    );
  }
}

export default translate()(Share);
