import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import Nav from "components/Nav";
import axios from "axios";
import "./ShareSnippet.css"

class ShareSnippet extends Component {

  constructor(props) {
    super(props);
    this.state = {
      snippet: null
    };
  }

  renderPage() {
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.state.snippet.studentcontent);
      doc.close();
    }
  }

  componentDidMount() {
    const {snid} = this.props.params;
    axios.get(`/api/snippets?id=${snid}`).then(resp => {
      this.setState({snippet: resp.data[0]}, this.renderPage.bind(this));
    });
  }

  render() {
    
    const {t} = this.props;
    const {snippet} = this.state;

    if (!snippet) return <h1>Loading...</h1>;

    return (
      <div>
        <iframe id="sharecontainer" ref="rc" frameBorder="0" width="100%" height="100%" />
      </div>
    );
  }
}

export default translate()(ShareSnippet);
