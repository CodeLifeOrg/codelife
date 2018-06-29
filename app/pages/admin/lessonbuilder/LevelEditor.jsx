import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Link} from "react-router";
import LoadingSpinner from "components/LoadingSpinner";
import {Button, Toaster, Position, Intent} from "@blueprintjs/core";

import "./LevelEditor.css";

class LevelEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    const {data} = this.props;
    this.setState({data});
  }

  componentDidUpdate() {
    if (this.props.data.id !== this.state.data.id) {
      this.setState({data: this.props.data});
    }
  }

  changeField(field, e) {
    const {data} = this.state;
    data[field] = e.target.value;
    this.setState({data});
  }

  saveContent() {
    const {data} = this.state;
    if (this.props.reportSave) this.props.reportSave(data);
    axios.post("/api/builder/levels/save", data).then(resp => {
      if (resp.status === 200) {
        const toast = Toaster.create({className: "levelSave", position: Position.TOP_CENTER});
        toast.show({message: "Level saved.", intent: Intent.SUCCESS});
      }
      else {
        const toast = Toaster.create({className: "levelFail", position: Position.TOP_CENTER});
        toast.show({message: "Save Error.", intent: Intent.DANGER});
      }
    });
  }

  render() {

    const {data} = this.state;

    // grab en/pt subdomain from url
    const locale = window.location.host.split(".")[0];

    if (!data) return <LoadingSpinner />;

    return (
      <div id="level-editor">
        <div className="item-editor-inner">

          <div className="item-editor-meta">

            {/* title display */}
            <h1 className="font-lg u-margin-top-xs u-margin-bottom-off">
              { locale === "en"
                ? `${data.name} / ${data.pt_name}`
                : `${data.pt_name} / ${data.name}`
              }
            </h1>
            <p className="font-xs">
              <Link to={`island/${data.lid}/${data.id}`}>
                codelife.com/island/{data.lid}/{ data.id }
              </Link>
            </p>

            {/* title fields */}
            <div className={`translation-field-group field-group ${locale}`}>
              {/* en */}
              <div className="field-container font-md">
                <label className="font-sm" htmlFor="title-en">Title (En)</label>
                <input className="field-input"
                  id="title-en"
                  name="title-en"
                  value={data.name}
                  onChange={this.changeField.bind(this, "name")}
                  autoFocus={ locale !== "pt" ? true : false} />
              </div>
              {/* pt */}
              <div className="field-container font-md">
                <label className="font-sm" htmlFor="title-pt">Title (Pt)</label>
                <input className="field-input"
                  id="title-pt"
                  name="title-pt"
                  value={data.pt_name}
                  onChange={this.changeField.bind(this, "pt_name")}
                  autoFocus={ locale === "pt" ? true : false} />
              </div>
            </div>

            {/* description */}
            <div className={`translation-field-group field-group ${locale}`}>
              {/* en */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="description-en">Description (En)</label>
                <input className="field-input"
                  id="description-en"
                  name="description-en"
                  value={data.description}
                  onChange={this.changeField.bind(this, "description")}
                  placeholder="Describe this island in a few words" />
              </div>
              {/* pt */}
              <div className="field-container font-sm">
                <label className="font-sm" htmlFor="description-pt">Description (Pt)</label>
                <input className="field-input"
                  id="description-pt"
                  name="description-pt"
                  value={data.pt_description}
                  onChange={this.changeField.bind(this, "pt_description")}
                  placeholder="Describe this island in a few words" />
              </div>
            </div>
          </div>
        </div>
        <div className="admin-actions-bar">
          <button className="button" onClick={this.saveContent.bind(this)}>
            Save
          </button>
        </div>
      </div>
    );
  }
}

LevelEditor = connect(state => ({
  auth: state.auth
}))(LevelEditor);
LevelEditor = translate()(LevelEditor);
export default LevelEditor;
