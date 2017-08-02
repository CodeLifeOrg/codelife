import React, {Component} from "react";
import {translate} from "react-i18next";
import himalaya from "himalaya";
import {Button, Dialog, Intent} from "@blueprintjs/core";
import "moment/locale/pt-br";
import moment from "moment";

import "components/ProjectCard.css";

class ProjectCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  getTitleText(theText) {
    const content = himalaya.parse(theText);
    let head, html, title = null;
    let titleText = "";
    if (content) html = content.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) title = head.children.find(e => e.tagName === "title");
    if (title && title.children[0]) titleText = title.children[0].content;
    return titleText || "Webpage";
  }

  componentDidUpdate() {
    if (this.iframe) {
      const doc = this.iframe.contentWindow.document;
      const {studentcontent} = this.props.project;
      doc.open();
      doc.write(studentcontent);
      doc.close();
    }
  }

  toggleDialog() {
    this.setState({open: !this.state.open});
  }

  render() {

    const {open} = this.state;
    const {project, t} = this.props;
    const {datemodified, id, name, studentcontent, username} = project;

    const titleText = this.getTitleText(studentcontent);

    console.log(project);

    moment.locale("pt-BR");

    return (
      <div className="projectCard pt-card pt-elevation-0 pt-interactive" key={id}>
        <div className="box" onClick={ this.toggleDialog.bind(this) }>
          <div className="icon"><span className="pt-icon-standard pt-icon-code-block pt-intent-warning" /></div>
          <div className="info">
            <div className="card-title">{ name }</div>
            { datemodified ? <div className="card-author">{ t("Modified on") } { moment(datemodified).format("DD/MM/YY") }</div> : null }
            { username ? <div className="card-author">{ t("Created by") } { username }</div> : null }
          </div>
        </div>
        <Dialog
          isOpen={ open }
          onClose={ this.toggleDialog.bind(this) }
          title={ name }
          lazy={false}
          inline={true}
          style={{
            height: "75vh",
            maxHeight: "600px",
            maxWidth: "800px",
            width: "100%"
          }}
        >
          <div className="pt-dialog-body">
            <div className="render">
              <div className="panel-title"><img className="favicon" src="/islands/island-1-small.png" />{ titleText }</div>
              <iframe className="iframe" ref={ comp => this.iframe = comp } />
            </div>
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-byline">{ username ? `${t("Created by")} {username}` : "" }</div>
            <div className="pt-dialog-footer-actions">
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

ProjectCard = translate()(ProjectCard);
export default ProjectCard;
