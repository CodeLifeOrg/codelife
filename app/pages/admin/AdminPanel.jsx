import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tab2, Tabs2} from "@blueprintjs/core";
import Loading from "components/Loading";
import {UserAdmin} from "datawheel-canon";
import LessonBuilder from "pages/admin/lessonbuilder/LessonBuilder";
import RuleBuilder from "pages/admin/lessonbuilder/RuleBuilder";
import ReportViewer from "pages/admin/ReportViewer";
import Statistics from "pages/admin/Statistics";
import {browserHistory} from "react-router";

import "./AdminPanel.css";

class AdminPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      activeTabId: "lesson-builder",
      currentNode: null
    };
  }

  componentDidMount() {
    if (this.props.auth.user.role < 1) browserHistory.push("/");
    if (!this.props.params.tab) {
      this.handleTabChange("lesson-builder");
    }
    const mounted = true;
    this.setState({mounted});
  }

  setPath(node) {
    let path = "/admin/lesson-builder/";
    if (node.itemType === "island") {
      path += node.id;
    } 
    else if (node.itemType === "level") {
      path += `${node.parent.id}/${node.id}`;
    }
    else {
      path += `${node.parent.parent.id}/${node.parent.id}/${node.id}`;
    }
    browserHistory.push(path);
    this.setState({currentNode: node});
  }

  handleTabChange(activeTabId) {
    if (activeTabId === "lesson-builder" && this.state.currentNode) {
      this.setPath(this.state.currentNode);
    }
    else {
      browserHistory.push(`/admin/${activeTabId}`);  
    }
    this.setState({activeTabId});
  }

  render() {

    const {mounted, activeTabId} = this.state;
    const {island, level, slide} = this.props.params;
    const pathObj = {island, level, slide};
    const {t} = this.props;

    if (!mounted) return <Loading />;

    return (
      <div>
        <Tabs2 className="admin-tabs" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
          <Tab2 id="lesson-builder" className="admin-tab" title={t("Lesson Builder")} panel={<LessonBuilder setPath={this.setPath.bind(this)} pathObj={pathObj} />}/>
          <Tab2 id="rule-builder" className="admin-tab" title={t("Rule Builder")} panel={<RuleBuilder />} />
          { this.props.auth.user.role > 1 ? <Tab2 id="report-viewer" className="admin-tab" title={t("Flagged Content")} panel={<ReportViewer />} /> : null }
          { this.props.auth.user.role > 1 ? <Tab2 id="user-admin" className="admin-tab" title={t("User Admin")} panel={<UserAdmin />} /> : null }
          { this.props.auth.user.role > 1 ? <Tab2 id="statistics" className="admin-tab" title={t("Statistics")} panel={<Statistics />} /> : null }
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
