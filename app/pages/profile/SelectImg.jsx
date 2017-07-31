import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Classes, MenuItem} from "@blueprintjs/core";
import {Select} from "@blueprintjs/labs";
import SelectGeo from "./SelectGeo";

class SelectImg extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
  }

  onUpdate(e) {
    const {callback} = this.props;
    callback(e.target.files[0]);
  }

  render() {
    const onUpdate = this.onUpdate.bind(this);
    return (
      <div className="pt-form-content">
        <label className="pt-file-upload .modifier">
          <input onChange={onUpdate} type="file" />
          <span className="pt-file-upload-input">Upload new picture...</span>
        </label>
      </div>
    );
  }

}

export default translate()(SelectImg);
