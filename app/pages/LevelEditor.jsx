import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

import "./LevelEditor.css";

class LevelEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  render() {

    // const {t} = this.props;

    return (
      <div id="leveleditor">
        i will be a level editor
      </div>
    );
  }
}

LevelEditor = connect(state => ({
  auth: state.auth
}))(LevelEditor);
LevelEditor = translate()(LevelEditor);
export default LevelEditor;
