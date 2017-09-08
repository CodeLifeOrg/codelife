import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tree} from "@blueprintjs/core";
import Loading from "components/Loading";
import IslandEditor from "pages/lessonbuilder/IslandEditor";
import LevelEditor from "pages/lessonbuilder/LevelEditor";
import SlideEditor from "pages/lessonbuilder/SlideEditor";
import CtxMenu from "pages/lessonbuilder/CtxMenu";

import "./LessonBuilder.css";

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
    const lget = axios.get("/api/builder/lessons");
    const mlget = axios.get("/api/builder/minilessons/all");
    const sget = axios.get("/api/builder/slides/all");
    Promise.all([lget, mlget, sget]).then(resp => {
      const lessons = resp[0].data;
      const minilessons = resp[1].data;
      const slides = resp[2].data;
      lessons.sort((a, b) => a.ordering - b.ordering);
      minilessons.sort((a, b) => a.ordering - b.ordering);
      slides.sort((a, b) => a.ordering - b.ordering);      
      minilessons.map(m => m.slides = []);
      lessons.map(l => l.minilessons = []);

      const nodes = [];

      for (let l of lessons) {
        l = this.fixNulls(l);
        nodes.push({
          id: l.id,
          hasCaret: true, 
          iconName: "map", 
          label: l.name,
          itemType: "island",
          parent: {childNodes: nodes},
          childNodes: [],
          data: l
        });
      }
      for (let m of minilessons) {
        m = this.fixNulls(m);
        const lessonNode = nodes.find(node => node.data.id === m.lid);
        if (lessonNode) {
          lessonNode.childNodes.push({
            id: m.id,
            hasCaret: true, 
            iconName: "multi-select", 
            label: m.name,
            itemType: "level",
            parent: lessonNode,
            childNodes: [],
            data: m
          });
        }
      }
      for (let s of slides) {
        s = this.fixNulls(s);
        let levelNode = null;
        for (const lessonNode of nodes) {
          levelNode = lessonNode.childNodes.find(cn => cn.data.id === s.mlid);
          if (levelNode) break;
        }
        if (levelNode) {
          levelNode.childNodes.push({
            id: s.id,
            hasCaret: false, 
            iconName: "page-layout", 
            label: s.title,
            itemType: "slide",
            parent: levelNode,
            data: s
          });
        }
      }
      this.setState({mounted: true, nodes});
    });
  }

  fixNulls(obj) {
    for (const k in obj) {
      if (obj.hasOwnProperty(k) && (obj[k] === undefined || obj[k] === null)) {
        obj[k] = "";
      }
    }
    return obj;
  }

  moveItem(n, dir) {
    const {nodes} = this.state;
    const arr = n.parent.childNodes;
    if (dir === "up") {
      const old = arr.find(node => node.data.ordering === n.data.ordering - 1);
      old.data.ordering++;
      n.data.ordering--;
    }
    if (dir === "down") {
      const old = arr.find(node => node.data.ordering === n.data.ordering + 1);
      old.data.ordering--;
      n.data.ordering++;
    }
    arr.sort((a, b) => a.data.ordering - b.data.ordering);  
    this.setState({nodes}); 
  }

  addItem(n, dir) {
    const {nodes} = this.state;
    const arr = n.parent.childNodes;
    let obj = null;
    let loc = n.data.ordering;
    const epoch = Date.now();
    if (dir === "above") {
      arr.map(node => node.data.ordering >= n.data.ordering ? node.data.ordering++ : null);
    }
    if (dir === "below") {
      loc++;
      arr.map(node => node.data.ordering >= n.data.ordering + 1 ? node.data.ordering++ : null);
    }
    if (n.itemType === "slide") {
      obj = {
        id: `new-slide${epoch}`,
        hasCaret: false, 
        iconName: "page-layout", 
        label: "New Slide",
        itemType: "slide",
        parent: n.parent,
        data: {
          id: `new-slide${epoch}`,
          type: "TextImage",
          title: "New Slide",
          htmlcontent1: "New Content 1",
          mlid: n.data.mlid,
          ordering: loc
        }
      };
    }
    if (n.itemType === "level") {
      obj = {
        id: `new-level${epoch}`,
        hasCaret: true, 
        iconName: "multi-select", 
        label: "New Level",
        itemType: "level",
        parent: n.parent,
        data: {
          id: `new-level${epoch}`,
          name: "New Level",
          description: "New Description",
          lid: n.data.lid,
          ordering: loc
        }
      };
    }
    if (n.itemType === "island") {
      obj = {
        id: `new-island${epoch}`,
        hasCaret: true, 
        iconName: "map", 
        label: "New Island",
        itemType: "island",
        parent: n.parent,
        data: {
          id: `new-island${epoch}`,
          name: "New Island",
          description: "New Description",
          prompt: "New Prompt",
          victory: "New Victory",
          initialcontent: "",
          rulejson: "",
          cheatsheet: "New Cheatsheet",
          ordering: loc
        }
      };
    }
    if (obj) {
      arr.push(obj);
      arr.sort((a, b) => a.data.ordering - b.data.ordering);  
      this.setState({nodes});
      this.handleNodeClick(obj);
    }
  }

  deleteItem(n) {
    const {nodes} = this.state;
    const oldLoc = n.data.ordering;
    const i = n.parent.childNodes.indexOf(n);
    n.parent.childNodes.splice(i, 1);
    n.parent.childNodes.map(node => node.data.ordering > oldLoc ? node.data.ordering-- : null);
    // n.parent.childNodes.sort((a, b) => a.data.ordering - b.data.ordering);
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
        { currentNode 
          ? <div id="item-editor">
              {currentNode.itemType === "island" ? <IslandEditor data={currentNode.data} reportSave={this.reportSave.bind(this)} /> : null}
              {currentNode.itemType === "level" ? <LevelEditor data={currentNode.data} reportSave={this.reportSave.bind(this)}/> : null }
              {currentNode.itemType === "slide" ? <SlideEditor data={currentNode.data} reportSave={this.reportSave.bind(this)}/> : null }
            </div>
          : null 
        }
      </div>
    );
  }
}

LessonBuilder = connect(state => ({
  auth: state.auth
}))(LessonBuilder);
LessonBuilder = translate()(LessonBuilder);
export default LessonBuilder;
