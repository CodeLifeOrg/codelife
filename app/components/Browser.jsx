import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tree} from "@blueprintjs/core";
import Loading from "components/Loading";

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
    const {pathObj} = this.props;
    let nodeFromProps;
    const iget = axios.get("/api/builder/islands/all");
    const lget = axios.get("/api/builder/levels/all");
    const sget = axios.get("/api/builder/slides/all");
    Promise.all([iget, lget, sget]).then(resp => {
      const islands = resp[0].data;
      const levels = resp[1].data;
      const slides = resp[2].data;
      islands.sort((a, b) => a.ordering - b.ordering);
      levels.sort((a, b) => a.ordering - b.ordering);
      slides.sort((a, b) => a.ordering - b.ordering);

      const nodes = [];

      for (let i of islands) {
        i = this.fixNulls(i);
        const islandObj = {
          id: i.id,
          hasCaret: true,
          iconName: "map",
          label: i.name,
          itemType: "island",
          parent: {childNodes: nodes},
          childNodes: [],
          data: i
        };
        if (pathObj.island && !pathObj.level && !pathObj.slide && pathObj.island === islandObj.id) nodeFromProps = islandObj;
        nodes.push(islandObj);
      }
      for (let l of levels) {
        l = this.fixNulls(l);
        const islandNode = nodes.find(node => node.data.id === l.lid);
        if (islandNode) {
          const levelObj = {
            id: l.id,
            hasCaret: true,
            iconName: "multi-select",
            label: l.name,
            itemType: "level",
            parent: islandNode,
            childNodes: [],
            data: l
          };
          if (pathObj.island && pathObj.level && !pathObj.slide && pathObj.level === levelObj.id) nodeFromProps = levelObj;
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
            hasCaret: false,
            iconName: slideIcons[s.type],
            label: s.title,
            itemType: "slide",
            parent: levelNode,
            data: s
          };
          if (pathObj.island && pathObj.level && pathObj.slide && pathObj.slide === slideObj.id) nodeFromProps = slideObj;
          levelNode.childNodes.push(slideObj);
        }
      }
      this.setState({mounted: true, nodes}, this.initFromProps.bind(this, nodeFromProps));
    });    
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
      this.handleNodeClick(nodeFromProps);
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

  handleNodeClick(node) {
    const {currentNode} = this.state;
    if (!currentNode) {
      node.isSelected = true;
      node.secondaryLabel = <CtxMenu node={node} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.deleteItem.bind(this)} />;
    }
    else if (node.id !== currentNode.id) {
      node.isSelected = true;
      currentNode.isSelected = false;
      node.secondaryLabel = <CtxMenu node={node} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.deleteItem.bind(this)} />;
      currentNode.secondaryLabel = null;
    }
    node.isExpanded = !node.isExpanded;
    if (this.props.setPath) this.props.setPath(node);
    this.setState({currentNode: node});
  }

  handleNodeCollapse(node) {
    node.isExpanded = false;
    this.setState({nodes: this.state.nodes});
  }

  handleNodeExpand(node) {
    node.isExpanded = true;
    this.setState({nodes: this.state.nodes});
  }

  reportSave(newData) {
    const {currentNode} = this.state;
    if (currentNode.itemType === "island" || currentNode.itemType === "level") currentNode.label = newData.name;
    if (currentNode.itemType === "slide") currentNode.label = newData.title;
    this.setState({currentNode});
  }

  render() {

    const {nodes, currentNode} = this.state;

    if (!nodes) return <Loading />;

    console.log("hi", this.state.showBrowser);

    return (
      <div id="lesson-builder">
        asdf
        <div id="tree">
          <Tree
            onNodeClick={this.handleNodeClick.bind(this)}
            onNodeCollapse={this.handleNodeCollapse.bind(this)}
            onNodeExpand={this.handleNodeExpand.bind(this)}
            contents={nodes}
          />
        </div>
      </div>
    );
  }
}

Browser = connect(state => ({
  auth: state.auth
}))(Browser);
Browser = translate()(Browser);
export default Browser;
