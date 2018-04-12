import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tree, Tooltip} from "@blueprintjs/core";
import Loading from "components/Loading";
import PropTypes from "prop-types";

import "./Browser.css";

const slideIcons = {
  CheatSheet: "clipboard",
  ImageText: "media",
  InputCode: "code-block",
  Quiz: "help",
  RenderCode: "application",
  TextCode: "code",
  TextImage: "media",
  TextText: "label"
};

class Browser extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      nodes: null,
      currentNode: null
    };
  }

  componentDidMount() {
    const iget = axios.get("/api/islands/all");
    const lget = axios.get("/api/levels/all");
    const sget = axios.get("/api/slides/all");
    const upget = axios.get("/api/userprogress/mine");
    Promise.all([iget, lget, sget, upget]).then(resp => {
      const islands = resp[0].data;
      const levels = resp[1].data;
      const slides = resp[2].data;
      const progress = resp[3].data.progress;
      const current = resp[3].data.current;
      islands.sort((a, b) => a.ordering - b.ordering);
      levels.sort((a, b) => a.ordering - b.ordering);
      slides.sort((a, b) => a.ordering - b.ordering);
      this.setState({islands, levels, slides, progress, current}, this.buildTree.bind(this));
    });
  }

  buildTree() {
    const {islands, levels, slides, progress, current} = this.state;
    const nodes = [];
    const blockLabel = 
      <Tooltip content="You haven't unlocked this level yet!">
        <span className="pt-icon-standard pt-icon-lock"/>
      </Tooltip>;

    const pathObj = {
      island: this.props.linkObj.lid,
      level: this.props.linkObj.mlid,
      slide: this.props.linkObj.sid
    };
    let nodeFromProps;
    for (let i of islands) {
      i = this.fixNulls(i);
      const islandObj = {
        id: i.id,
        className: i.id,
        hasCaret: true,
        iconName: "map-marker",
        label: i.name,
        itemType: "island",
        parent: {childNodes: nodes},
        childNodes: [],
        data: i
      };
      if (pathObj && pathObj.island && !pathObj.level && !pathObj.slide && pathObj.island === islandObj.id) nodeFromProps = islandObj;
      islandObj.hasBeaten = progress.find(p => p.level === i.id) || i.id === current.id;
      if (!islandObj.hasBeaten) islandObj.secondaryLabel = blockLabel;
      nodes.push(islandObj);
    }
    for (let l of levels) {
      l = this.fixNulls(l);
      const islandNode = nodes.find(node => node.data.id === l.lid);
      if (islandNode) {
        const levelObj = {
          id: l.id,
          className: l.id,
          hasCaret: true,
          iconName: "multi-select",
          label: l.name,
          itemType: "level",
          parent: islandNode,
          childNodes: [],
          data: l
        };
        if (pathObj && pathObj.island && pathObj.level && !pathObj.slide && pathObj.level === levelObj.id) nodeFromProps = levelObj;
        levelObj.hasBeaten = progress.find(p => p.level === l.id);
        if (!levelObj.hasBeaten) levelObj.secondaryLabel = blockLabel;
        islandNode.childNodes.push(levelObj);
      }
    }
    for (let s of slides) {
      s = this.fixNulls(s);
      let levelNode = null;

      for (const islandNode of nodes) {
        levelNode = islandNode.childNodes.find(cn => cn.data.id === s.mlid);
        if (levelNode) break;
      }
      if (levelNode) {
        const slideObj = {
          id: s.id,
          className: s.id,
          hasCaret: false,
          iconName: slideIcons[s.type],
          label: s.title,
          itemType: "slide",
          parent: levelNode,
          data: s
        };
        if (pathObj && pathObj.island && pathObj.level && pathObj.slide && pathObj.slide === slideObj.id) nodeFromProps = slideObj;
        levelNode.childNodes.push(slideObj);
      }
    }
    this.setState({mounted: true, nodes}, this.initFromProps.bind(this, nodeFromProps));
  }

  initFromProps(nodeFromProps) {
    if (nodeFromProps) {
      if (nodeFromProps.itemType === "island") {
        nodeFromProps.isExpanded = true;
      }
      else if (nodeFromProps.itemType === "level") {
        nodeFromProps.isExpanded = true;
        nodeFromProps.parent.isExpanded = true;
      }
      else if (nodeFromProps.itemType === "slide") {
        nodeFromProps.isExpanded = true;
        nodeFromProps.parent.isExpanded = true;
        nodeFromProps.parent.parent.isExpanded = true;
      }
      this.setState({nodes: this.state.nodes});
      this.selectNodeFromProps(nodeFromProps);
    }
  }

  fixNulls(obj) {
    for (const k in obj) {
      if (obj.hasOwnProperty(k) && (obj[k] === undefined || obj[k] === null)) {
        obj[k] = "";
      }
    }
    return obj;
  }

  reloadProgress() {
    axios.get("/api/userprogress/mine").then(resp => {
      if (resp.status === 200) {
        this.setState({progress: resp.data.progress, current: resp.data.current}, this.buildTree.bind(this));
      }
      else {
        console.log("error");
      }

    });
  }

  selectNodeFromProps(node) {
    const {currentNode} = this.state;
    if (!currentNode) {
      node.isSelected = true;
    }
    else if (node.id !== currentNode.id) {
      node.isSelected = true;
      currentNode.isSelected = false;
    }
    this.setState({currentNode: node});
  }

  handleNodeClick(node) {
    if (node.hasBeaten) {
      const {currentNode} = this.state;
      const {browserHistory} = this.context;
      if (!currentNode) {
        node.isSelected = true;
      }
      else if (node.id !== currentNode.id) {
        node.isSelected = true;
        currentNode.isSelected = false;
      }
      if (node.itemType === "island") {
        browserHistory.push(`/island/${node.data.id}`);
      }
      else if (node.itemType === "level") {
        browserHistory.push(`/island/${node.parent.data.id}/${node.data.id}`);
      }
      else if (node.itemType === "slide") {
        browserHistory.push(`/island/${node.parent.parent.data.id}/${node.parent.data.id}/${node.data.id}`);
      }
      if (this.props.reportClick) this.props.reportClick(node);
      this.setState({currentNode: node});
    }
  }

  handleNodeCollapse(node) {
    node.isExpanded = false;
    this.setState({nodes: this.state.nodes});
  }

  handleNodeExpand(node) {
    node.isExpanded = true;
    this.setState({nodes: this.state.nodes});
  }

  render() {

    const {nodes} = this.state;

    if (!nodes) return <Loading />;

    return (
      <div className="tree" id="tree">
        <Tree
          onNodeClick={this.handleNodeClick.bind(this)}
          onNodeCollapse={this.handleNodeCollapse.bind(this)}
          onNodeExpand={this.handleNodeExpand.bind(this)}
          contents={nodes}
        />
      </div>
    );
  }
}

Browser.contextTypes = {
  browserHistory: PropTypes.object
};

Browser = connect(state => ({
  auth: state.auth
}), null, null, {withRef: true})(Browser);
Browser = translate(undefined, {withRef: true})(Browser);
export default Browser;
