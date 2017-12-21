import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tab2, Tabs2} from "@blueprintjs/core";
import Loading from "components/Loading";
import {UserAdmin} from "datawheel-canon";
import LessonBuilder from "pages/admin/lessonbuilder/LessonBuilder";
import RuleBuilder from "pages/admin/lessonbuilder/RuleBuilder";
import GlossaryBuilder from "pages/admin/GlossaryBuilder";
import ReportViewer from "pages/admin/ReportViewer";
import {browserHistory} from "react-router";

import "./AdminPanel.css";

class AdminPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      activeTabId: "lesson-builder"
    };
  }

  componentDidMount() {
    if (this.props.auth.user.role < 1) browserHistory.push("/");
    const mounted = true;
    this.setState({mounted});
  }

  handleTabChange(activeTabId) {
    this.setState({activeTabId});
  }

  render() {

    const {mounted, activeTabId} = this.state;
    const {t} = this.props;

    if (!mounted) return <Loading />;

    return (
      <div>
        <Tabs2 className="admin-tabs" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
          <Tab2 id="lesson-builder" className="admin-tab" title={t("Lesson Builder")} panel={<LessonBuilder />}/>
          <Tab2 id="rule-builder" className="admin-tab" title={t("Rule Builder")} panel={<RuleBuilder />} />
          <Tab2 id="glossary-builder" className="admin-tab" title={t("Glossary Builder")} panel={<GlossaryBuilder />} />
          { this.props.auth.user.role > 1 ? <Tab2 id="report-viewer" className="admin-tab" title={t("Flagged Content")} panel={<ReportViewer />} /> : null }
          { this.props.auth.user.role > 1 ? <Tab2 id="user-admin" className="admin-tab" title={t("User Admin")} panel={<UserAdmin />} /> : null }
        </Tabs2>
      </div>
    );
  }
}

AdminPanel = connect(state => ({
  auth: state.auth
}))(AdminPanel);
AdminPanel = translate()(AdminPanel);
export default AdminPanel;
