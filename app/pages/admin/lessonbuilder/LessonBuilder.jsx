import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {NonIdealState, Tree} from "@blueprintjs/core";
import Loading from "components/Loading";
import IslandEditor from "pages/admin/lessonbuilder/IslandEditor";
import LevelEditor from "pages/admin/lessonbuilder/LevelEditor";
import SlideEditor from "pages/admin/lessonbuilder/SlideEditor";
import CtxMenu from "pages/admin/lessonbuilder/CtxMenu";

import crypto from "crypto";

import "./LessonBuilder.css";

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

class LessonBuilder extends Component {

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

  saveNode(node) {
    let path = null;
    if (node.itemType === "island") path = "/api/builder/islands/save";
    if (node.itemType === "level") path = "/api/builder/levels/save";
    if (node.itemType === "slide") path = "/api/builder/slides/save";
    if (path) {
      axios.post(path, node.data).then(resp => {
        resp.status === 200 ? console.log("saved") : console.log("error");
      });
    }
  }

  newNode(nodes) {
    const ipath = "/api/builder/islands/new";
    const lpath = "/api/builder/levels/new";
    const spath = "/api/builder/slides/new";

    if (nodes.length === 1) {
      const snode = nodes[0];
      axios.post(spath, snode.data).then(resp => {
        resp.status === 200 ? console.log("saved") : console.log("error");
      });
    }
    if (nodes.length === 2) {
      const lnode = nodes[0];
      const snode = nodes[1];
      axios.post(lpath, lnode.data).then(() => {
        axios.post(spath, snode.data).then(resp => {
          resp.status === 200 ? console.log("saved") : console.log("error");
        });
      });
    }
    if (nodes.length === 3) {
      const inode = nodes[0];
      const lnode = nodes[1];
      const snode = nodes[2];
      axios.post(ipath, inode.data).then(() => {
        axios.post(lpath, lnode.data).then(() => {
          axios.post(spath, snode.data).then(resp => {
            resp.status === 200 ? console.log("saved") : console.log("error");
          });
        });
      });
    }
  }

  delNode(node) {
    let path = null;
    if (node.itemType === "island") path = "/api/builder/islands/delete";
    if (node.itemType === "level") path = "/api/builder/levels/delete";
    if (node.itemType === "slide") path = "/api/builder/slides/delete";
    if (path) {
      axios.delete(path, {params: {id: node.data.id}}).then(resp => {
        resp.status === 200 ? console.log("successfully deleted") : console.log("error");
      });
    }
  }

  moveItem(n, dir) {
    const {nodes} = this.state;
    const arr = n.parent.childNodes;
    if (dir === "up") {
      const old = arr.find(node => node.data.ordering === n.data.ordering - 1);
      old.data.ordering++;
      n.data.ordering--;
      this.saveNode(old);
      this.saveNode(n);
    }
    if (dir === "down") {
      const old = arr.find(node => node.data.ordering === n.data.ordering + 1);
      old.data.ordering--;
      n.data.ordering++;
      this.saveNode(old);
      this.saveNode(n);
    }
    arr.sort((a, b) => a.data.ordering - b.data.ordering);
    this.setState({nodes});
  }

  getUUID() {
    return crypto.randomBytes(2).toString("hex");
  }

  addItem(n, dir) {

    const {nodes} = this.state;
    const arr = n.parent.childNodes;
    let loc = n.data.ordering;
    if (dir === "above") {
      for (const node of arr) {
        if (node.data.ordering >= n.data.ordering) {
          node.data.ordering++;
          this.saveNode(node);
        }
      }
    }
    if (dir === "below") {
      loc++;
      for (const node of arr) {
        if (node.data.ordering >= n.data.ordering + 1) {
          node.data.ordering++;
          this.saveNode(node);
        }
      }
    }
    const slideUUID = `slide-${this.getUUID()}`;
    const objSlide = {
      id: slideUUID,
      hasCaret: false,
      iconName: "page-layout",
      label: "New Slide",
      itemType: "slide",
      parent: n.parent,
      data: {
        id: slideUUID,
        type: "TextImage",
        title: "New Slide",
        htmlcontent1: "New Content 1",
        htmlcontent2: "New Content 2",
        quizjson: "",
        rulejson: "",
        pt_title: "New Slide",
        pt_htmlcontent1: "New Content 1",
        pt_htmlcontent2: "New Content 2",
        pt_quizjson: "",
        mlid: n.data.mlid,
        ordering: loc
      }
    };
    const levelUUID = `level-${this.getUUID()}`;
    const objLevel = {
      id: levelUUID,
      hasCaret: true,
      iconName: "multi-select",
      label: "New Level",
      itemType: "level",
      parent: n.parent,
      data: {
        id: levelUUID,
        name: "New Level",
        description: "New Description",
        pt_name: "New Level",
        pt_description: "New Description",
        lid: n.data.lid,
        ordering: loc
      }
    };
    const islandUUID = `island-${this.getUUID()}`;
    const objIsland = {
      id: islandUUID,
      hasCaret: true,
      iconName: "map",
      label: "New Island",
      itemType: "island",
      parent: n.parent,
      data: {
        id: islandUUID,
        name: "New Island",
        description: "New Description",
        prompt: "New Prompt",
        victory: "New Victory",
        initialcontent: "",
        rulejson: "",
        cheatsheet: "New Cheatsheet",
        pt_name: "New Island",
        pt_description: "New Description",
        pt_prompt: "New Prompt",
        pt_victory: "New Victory",
        pt_initialcontent: "",
        pt_cheatsheet: "New Cheatsheet",
        ordering: loc
      }
    };

    let obj = null;

    if (n.itemType === "slide") {
      obj = objSlide;
    }
    if (n.itemType === "level") {
      obj = objLevel;
      objSlide.data.ordering = 0;
      objSlide.data.mlid = obj.data.id;
      objSlide.parent = obj;
      obj.childNodes = [objSlide];
    }
    if (n.itemType === "island") {
      obj = objIsland;
      objLevel.data.ordering = 0;
      objLevel.data.lid = obj.data.id;
      objLevel.parent = obj;
      objSlide.data.ordering = 0;
      objSlide.data.mlid = objLevel.data.id;
      objSlide.parent = objLevel;
      objLevel.childNodes = [objSlide];
      obj.childNodes = [objLevel];
    }
    if (obj) {
      arr.push(obj);
      arr.sort((a, b) => a.data.ordering - b.data.ordering);
      // oh boy do i hate this TODO: generalize this array without breaking it
      if (n.itemType === "slide") this.newNode([obj]);
      if (n.itemType === "level") this.newNode([obj, objSlide]);
      if (n.itemType === "island") this.newNode([obj, objLevel, objSlide]);
      this.setState({nodes});
      this.handleNodeClick(obj);
    }
  }

  deleteItem(n) {
    const {nodes} = this.state;
    const oldLoc = n.data.ordering;
    const i = n.parent.childNodes.indexOf(n);
    n.parent.childNodes.splice(i, 1);
    const arr = n.parent.childNodes;
    for (const node of arr) {
      if (node.data.ordering > oldLoc) {
        node.data.ordering--;
        this.saveNode(node);
      }
    }
    // this sort *should* be unnecessary but I'm running it just in case
    n.parent.childNodes.sort((a, b) => a.data.ordering - b.data.ordering);
    this.delNode(n);
    this.setState({nodes});
    if (n.parent.childNodes[0]) this.handleNodeClick(n.parent.childNodes[0]);
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

    return (
      <div id="lesson-builder">
        <div id="tree">
          <Tree
            onNodeClick={this.handleNodeClick.bind(this)}
            onNodeCollapse={this.handleNodeCollapse.bind(this)}
            onNodeExpand={this.handleNodeExpand.bind(this)}
            contents={nodes}
          />
        </div>
        <div id="item-editor">
          { currentNode
            ? currentNode.itemType === "island"
              ? <IslandEditor data={currentNode.data} reportSave={this.reportSave.bind(this)} />
              : currentNode.itemType === "level"
                ? <LevelEditor data={currentNode.data} reportSave={this.reportSave.bind(this)}/>
                : currentNode.itemType === "slide"
                  ? <SlideEditor data={currentNode.data} reportSave={this.reportSave.bind(this)}/>
                  : null
            : <NonIdealState title="No Island Selected" description="Please select an island from the menu on the left." visual="path-search" />
          }
        </div>
      </div>
    );
  }
}

LessonBuilder = connect(state => ({
  auth: state.auth
}))(LessonBuilder);
LessonBuilder = translate()(LessonBuilder);
export default LessonBuilder;
