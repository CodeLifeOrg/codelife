import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Popover, PopoverInteractionKind, Intent, Position, Button, Dialog} from "@blueprintjs/core";
import "moment/locale/pt-br";
import moment from "moment";
import ReportBox from "components/ReportBox";
import CodeEditor from "components/CodeEditor";

import "components/ProjectCard.css";

class ProjectCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  toggleDialog() {
    this.setState({open: !this.state.open});
  }

  render() {
    const {open} = this.state;
    const {location, project, t, user} = this.props;
    const {datemodified, id, name, studentcontent, username, reported} = project;

    moment.locale("pt-BR");

    const embedLink = `${ location.origin }/projects/${ username }/${ project.name }`;

    return (
      <div className="projectCard pt-card pt-elevation-0 pt-interactive" key={id}>
        <div className="box" onClick={ this.toggleDialog.bind(this) }>
          <div className="icon"><span className="pt-icon-standard pt-icon-code pt-intent-warning" /></div>
          <div className="info">
            <div className="card-title">{ name }</div>
            <div className="card-meta">
              { datemodified ? <div className="card-author">{ t("Modified on") } { moment(datemodified).format("DD/MM/YY") }</div> : null }
              { username ? <div className="card-author">{ t("Created by") } { username }</div> : null }
            </div>
          </div>
        </div>
        <Dialog
          isOpen={ open }
          onClose={ this.toggleDialog.bind(this) }
          title={ name }
          lazy={false}
          inline={false}
          style={{
            height: "80vh",
            maxHeight: "1000px",
            width: "90%"
          }}
        >
          <div className="pt-dialog-body">
            <div className="render">
              <CodeEditor initialValue={studentcontent} readOnly={true} showEditor={false} ref={c => this.editor = c} />
            </div>
          </div>
          <div className="pt-dialog-footer">          
            <div className="pt-dialog-footer-byline">
              { t("Created by") } { username }
              <a href={ embedLink } target="_blank" className="share-link">{ embedLink }</a>
            </div>
            <div className="pt-dialog-footer-actions">
              <Popover
                interactionKind={PopoverInteractionKind.CLICK}
                popoverClassName="pt-popover-content-sizing"
                position={Position.TOP_RIGHT}
              >
                <Button
                  intent={reported ? "" : Intent.DANGER}
                  iconName="flag"
                  text={reported ? "Flagged" : "Flag"}
                />
                <div>
                 <ReportBox reportid={id} contentType="project"/>
                </div>
              </Popover>
              <Button
                intent={ Intent.PRIMARY }
                onClick={ this.toggleDialog.bind(this) }
                text={ t("Close") }
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

ProjectCard = connect(state => ({
  location: state.location,
  user: state.auth.user
}))(ProjectCard);
ProjectCard = translate()(ProjectCard);
export default ProjectCard;
