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
    const {t, context} = this.props;
    const onUpdate = this.onUpdate.bind(this);

    let iconClasses = "field-icon pt-icon pt-icon-media";
    context === "profile"
      ? iconClasses = "field-icon pt-icon pt-icon-mugshot" : null;

    return (
      <div className="field-container has-icon font-md">
        <label className="font-sm" htmlFor="profile-photo-select">
          {context === "profile" ? t("Profile image") : t("Image")}
        </label>
        <div className="file-select-container">
          {/* real field; set to 0 opacity by default, but clickable */}
          <input className="field-input" id="profile-photo-select" onChange={onUpdate} type="file" />
          {/* icon */}
          <span className={iconClasses} />
          {/* fake field; :after element used for the "button" */}
          <span className="fake-file-select field-input font-md"
            data-button-text-sm={t("Upload image")} data-button-text-lg={t("Browse…")}>
            {t("Upload image")}
          </span>
        </div>
      </div>
    );
  }

}

SelectImg.defaultProps = {
  context: "" // used to specify which icon to use
};
export default translate()(SelectImg);
