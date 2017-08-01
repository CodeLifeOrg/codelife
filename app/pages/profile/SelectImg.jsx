import React, {Component} from "react";
import {translate} from "react-i18next";

class SelectImg extends Component {

  constructor(props) {
    super(props);
  }

  onUpdate(e) {
    const {callback} = this.props;
    callback(e.target.files[0]);
  }

  render() {
    const onUpdate = this.onUpdate.bind(this);
    return (
      <div className="pt-form-content">
        <label className="pt-file-upload">
          <input onChange={onUpdate} type="file" />
          <span className="pt-file-upload-input">Upload new picture...</span>
        </label>
      </div>
    );
  }

}

export default translate()(SelectImg);
