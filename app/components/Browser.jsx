import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tree, Tooltip} from "@blueprintjs/core";
import LoadingSpinner from "components/LoadingSpinner";
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

/**
 * Browser is a drop-down menu embedded in Nav that lets the user jump to any
 * level or island that they have beaten in the past
 */

class Browser extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      nodes: null,
      currentNode: null
    };
  }

  /** 
   * On mount, fetch all islands/levels/slides, sort them, and arrange them 
   * hierarchically for use in the Blueprint Tree. Also grab the logged in user's progress
   * so that the browser can lock unbeaten levels.
   */
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

  /**
   * Builds the "nodes" object that will be used to populate the blueprint tree.
   * The Blueprint Tree component requires lots of metadata and nesting, so a fair
   * amount of crawling must be done to populate it properly
   * Note: This is borrowed heavily from the tree in the CMS. Someday they should be merged
   */
  buildTree() {
    const {islands, levels, slides, progress, current} = this.state;
    const nodes = [];
    const blockLabel =
      <Tooltip content="You haven't unlocked this level yet!">
        <span className="pt-icon-standard pt-icon-lock"/>
      </Tooltip>;

    // Nav.jsx passes down an object that parses args the URL. Use this later to 
    // automatically highlight the node with the page the user is actually on.
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
      // if the path object designates that the user is on this island (and not a level or slide)
      // save this node as the one to highlight as the current location
      if (pathObj && pathObj.island && !pathObj.level && !pathObj.slide && pathObj.island === islandObj.id) nodeFromProps = islandObj;      
      islandObj.hasBeaten = progress.find(p => p.level === i.id) || i.id === current.id;
      if (!islandObj.hasBeaten) islandObj.secondaryLabel = blockLabel, islandObj.className = "is-locked";
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
        if (!levelObj.hasBeaten) levelObj.secondaryLabel = blockLabel, levelObj.className = "is-locked";
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
          className: `${s.id} slide`,
          hasCaret: false,
          iconName: slideIcons[s.type],
          label: s.title,
          itemType: "slide",
          // "parent" is not a required param of a blueprint tree node, but it is used internally
          // to "crawl back out" from any given node. See selectNodeFromProps for usage.
          parent: levelNode,
          data: s
        };
        if (pathObj && pathObj.island && pathObj.level && pathObj.slide && pathObj.slide === slideObj.id) nodeFromProps = slideObj;
        levelNode.childNodes.push(slideObj);
      }
    }
    this.setState({mounted: true, nodes}, this.initFromProps.bind(this, nodeFromProps));
  }

  /**
   * Given a blueprint tree node, saved during the buildTree function, expand and select
   * the appropriate node to match the location
   * @param {Object} nodeFromProps A Blueprint Tree node 
   */
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

  /**
   * Helper function to avoid errors from accessing non-existent properties
   * Longer term, database defaults values should be established to avoid this
   * @param {Object} obj the object to prune
   * @returns {Object} an object whose null/undefined params are changed to ""
   */
  fixNulls(obj) {
    for (const k in obj) {
      if (obj.hasOwnProperty(k) && (obj[k] === undefined || obj[k] === null)) {
        obj[k] = "";
      }
    }
    return obj;
  }

  /**
   * As the user beats new levels, they are written to the db, but no redux-level store
   * is updated. This public-facing function is invoked by Nav.jsx when the Browser is opened,
   * resulting in a short loading screen while the latest progress is retrieved.
   * See Nav.jsx for more details.
   */
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

  /**
   * Similar to initNodeFromProps which expands the Blueprint Tree, this function selects
   * the node that matches the LinkObj provided by Nav.
   */
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

  /**
   * Callback for clicking a node. Uses browserhistory to navigate the user to the new page
   * @param {Object} node The blueprint node that was clicked
   */
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

    if (!nodes) return <LoadingSpinner />;

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

// withRef is a way to expose the functions of this component to its parent via getWrappedInstance.
// see Nav.jsx for what we need this for
Browser = connect(state => ({
  auth: state.auth
}), null, null, {withRef: true})(Browser);
Browser = translate(undefined, {withRef: true})(Browser);
export default Browser;
