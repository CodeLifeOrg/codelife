import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {fetchData} from "datawheel-canon";
import axios from "axios";
import ReportBox from "components/ReportBox";
import CodeEditor from "components/CodeEditor/CodeEditor";
import Logo from "components/Logo.svg";
import {Helmet} from "react-helmet";
import Error from "pages/Error";
import {Position, Popover, PopoverInteractionKind, Intent, Button} from "@blueprintjs/core";
import "./Share.css";

/**
 * The Share Page is a top-level page that does not require login, enabling users to share
 * their projects or codeblocks on facebook or with others. It looks up the content via name/user
 * and renders a fullscreen codeeditor for display, essentially acting as a hosting page for 
 * the students' work. Show a Report bar on the bottom for logged in users to report inappropriate content
 */

class Share extends Component {

  constructor(props) {
    super(props);
    this.state = {
      content: null,
      user: null,
      reports: []
    };
  }

  /**
   * In order to color the ReportBox Button appropriate, it needs to be known if the logged 
   * in user has reported this content. Fetch the reports to check. 
   */
  componentDidMount() {
    axios.get("/api/reports").then(resp =>
      resp.status === 200 ? this.setState({reports: resp.data}) : console.log("error")
    );
  }

  /**
   * The ReportBox component needs a callback to tell this outer component that a report
   * has been processed.
   */
  handleReport(report) {
    const {reports} = this.state;
    reports.push(report);
    this.setState({reports});
  }

  render() {
    const {t} = this.props;
    const {reports} = this.state;
    const {pathname} = this.props.router.location;
    // Content is fetched using canon needs - therefore the content will come in via props
    const {codeblockContent, projectContent, user} = this.props.data;

    const contentType = pathname.includes("codeBlocks/") ? "codeblock" : "project";

    // This is a little hacky - canon needs don't have any kind of proper decision tree in 
    // what gets retrieved - so the needs get BOTH a project and codeblock by the id provided.
    // Then check the URL pathname to understand which type this page is trying to load, and
    // grab and show that one (the other get ends up being unused)
    const content = contentType === "codeblock" ? codeblockContent[0] : projectContent[0];

    if (!content) return <div style={{height: "100vh", backgroundColor: "#74c3b7"}}><Error /></div>;

    const {id} = content;
    const name = content.name || content.snippetname;

    const reported = reports.find(r => r.type === contentType && r.report_id === id);

    // Prep some metadata for Facebook scraping, including the screenshot image
    const url = this.props.location.href;
    const origin = this.props.location.origin.includes("localhost") ? this.props.location.origin : this.props.location.origin.replace("http:", "https:");
    const img = `${origin}/${contentType === "codeblock" ? "cb_images" : "pj_images"}/${content.user.username}/${content.id}.png`;

    // Share.jsx is the page that the screenshot engine loads in order to take a picture.
    // When the screenshot engine does this, it appends ?screenshot=true to the URL. 
    // This does things like hiding the scroll bar and hiding the footer, so that the 
    // screenshot is a nice clean image of the content only.
    const isScreenshot = this.props.location.query.screenshot === "true";

    return (
      <div id="share" className="share-render">
        <Helmet>
          <title>{name}</title>
          <meta property="og:url" content={url} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={`${name} - ${t("A CodeLife Project")}`} />
          <meta property="og:description" content={t("Home.IntroText")} />
          <meta property="og:image" content={img} />
          <meta property="og:updated_time" content={new Date().toISOString()} />
        </Helmet>

        {/* rendered website */}
        <CodeEditor
          initialValue={content.studentcontent}
          noZoom={true}
          readOnly={true}
          showEditor={false}
          ref={c => this.editor = c}
          tabs={false}
          showConsole={false}
          suppressJS={isScreenshot} />

        {/* footer */}
        { !isScreenshot &&
          <div className="share-footer" id="tag">

            {/* user */}
            <div className="info">
              <span className="pt-icon-standard pt-icon-code"></span>
              { name }{ user ? ` ${ t("by") } ` : "" }{ user ? <a className="user-link" href={ `/profile/${ user.username }` }>{ user.name || user.username }</a> : null }
            </div>

            {/* codelife logo & link */}
            <div className="share-footer-logo">
              { t("Hosted by") } <a className="share-footer-logo-link" href="/"><Logo /></a>
            </div>

            {/* report button */}
            { content.status === "banned" || !this.props.auth.user
              ? null
              : <div className="actions">
                <Popover
                  interactionKind={PopoverInteractionKind.CLICK}
                  popoverClassName="pt-popover-content-sizing"
                  position={Position.TOP_RIGHT}
                  inline={true}>
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
