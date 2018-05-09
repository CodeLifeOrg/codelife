import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {fetchData} from "datawheel-canon";
import axios from "axios";
import ReportBox from "components/ReportBox";
import CodeEditor from "components/CodeEditor/CodeEditor";
import {Helmet} from "react-helmet";
import {Position, Popover, PopoverInteractionKind, Intent, Button} from "@blueprintjs/core";
import "./Share.css";

class Share extends Component {

  constructor(props) {
    super(props);
    this.state = {
      content: null,
      user: null,
      reports: []
    };
  }

  componentDidMount() {
    axios.get("/api/reports").then(resp => 
      resp.status === 200 ? this.setState({reports: resp.data}) : console.log("error")
    );
  }

  handleReport(report) {
    const {reports} = this.state;
    reports.push(report);
    this.setState({reports});
  }

  render() {
    const {t} = this.props;
    const {reports} = this.state;
    const {pathname} = this.props.router.location;
    const {codeblockContent, projectContent, user} = this.props.data;

    const contentType = pathname.includes("codeBlocks/") ? "codeblock" : "project";

    const content = contentType === "codeblock" ? codeblockContent[0] : projectContent[0];
    
    const {id} = content;
    const name = content.name || content.snippetname;

    const reported = reports.find(r => r.type === contentType && r.report_id === id);

    const url = this.props.location.href;
    const origin = this.props.location.origin.includes("localhost") ? this.props.location.origin : this.props.location.origin.replace("http:", "https:");
    const img = `${origin}/${contentType === "codeblock" ? "cb_images" : "pj_images"}/${content.id}.png`;

    const isScreenshot = this.props.location.query.screenshot === "true"

    return (
      <div id="share">
        <Helmet>
          <title>{name}</title>
          <meta property="og:url" content={url} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={`${name} - A CodeLife Project`} />
          <meta property="og:description" content="Description of Codelife" />
          <meta property="og:image" content={img} />
          <meta property="og:updated_time" content={new Date().toISOString()} />
        </Helmet>
        <CodeEditor initialValue={content.studentcontent} noZoom={true} readOnly={true} showEditor={false} ref={c => this.editor = c} tabs={false} showConsole={false} />
        { !isScreenshot && 
          <div id="tag">
            <div className="info">
              <span className="pt-icon-standard pt-icon-code"></span>
              { name }{ user ? ` ${ t("by") } ` : "" }{ user ? <a className="user-link" href={ `/profile/${ user.username }` }>{ user.name || user.username }</a> : null }
            </div>
            <div className="logo">
              { t("Hosted by") } <a href="/"><img src="/logo/logo-sm.png" /></a>
            </div>
            {
              content.status === "banned" || !this.props.auth.user
                ? null
                : <div className="actions">
                  <Popover
                    interactionKind={PopoverInteractionKind.CLICK}
                    popoverClassName="pt-popover-content-sizing"
                    position={Position.TOP_RIGHT}
                    inline={true}
                  >
                    <Button
                      intent={reported ? "" : Intent.DANGER}
                      iconName="flag"
                      text={reported ? "Flagged" : "Flag"}
                    />
                    <div>
                      <ReportBox reportid={id} contentType={contentType} handleReport={this.handleReport.bind(this)}/>
                    </div>
                  </Popover>
                </div>
            }
          </div>
        }
      </div>
    );
  }
}

Share.need = [
  fetchData("codeblockContent", "/api/codeBlocks/byUsernameAndFilename?username=<username>&filename=<filename>"),
  fetchData("projectContent", "/api/projects/byUsernameAndFilename?username=<username>&filename=<filename>"),
  fetchData("user", "/api/profile/share/<username>")
];

Share = connect(state => ({
  auth: state.auth,
  location: state.location,
  data: state.data
}))(Share);
Share = translate()(Share);
export default Share;
