import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Tree, Popover, Position, Menu, MenuItem, MenuDivider, Button} from "@blueprintjs/core";
import Loading from "components/Loading";
import IslandEditor from "pages/lessonbuilder/IslandEditor";
import LevelEditor from "pages/lessonbuilder/LevelEditor";
import SlideEditor from "pages/lessonbuilder/SlideEditor";

import "./LessonBuilder.css";

class LessonBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      lessons: null, 
      nodes: null,
      currentNode: null
    };
  }

  componentDidMount() {
    const lget = axios.get("/api/lessons");
    const mlget = axios.get("/api/minilessons/all");
    const sget = axios.get("/api/slides/all");
    Promise.all([lget, mlget, sget]).then(resp => {
      const lessons = resp[0].data;
      const minilessons = resp[1].data;
      const slides = resp[2].data;
      lessons.sort((a, b) => a.index - b.index);
      minilessons.sort((a, b) => a.ordering - b.ordering);
      slides.sort((a, b) => a.ordering - b.ordering);      
      minilessons.map(m => m.slides = []);
      lessons.map(l => l.minilessons = []);
      for (let l of lessons) {
        l = this.fixNulls(l);
        l.itemType = "Island";
      }
      for (let s of slides) {
        s = this.fixNulls(s);
        s.itemType = "Slide";
        const minilesson = minilessons.find(m => m.id === s.mlid);
        if (minilesson) {
          if (!minilesson.slides) minilesson.slides = [];
          minilesson.slides.push(s);
        }
      }
      for (let m of minilessons) {
        m = this.fixNulls(m);
        m.itemType = "Level";
        const lesson = lessons.find(l => l.id === m.lid);
        if (lesson) {
          if (!lesson.minilessons) lesson.minilessons = [];
          lesson.minilessons.push(m);
        }
      }
      if (lessons.length > 1) lessons[lessons.length - 1].isLast = true;
      for (const l of lessons) {
        if (l.minilessons.length > 1) l.minilessons[l.minilessons.length - 1].isLast = true;
        for (const m of l.minilessons) {
          if (m.slides.length > 1) m.slides[m.slides.length - 1].isLast = true;
        }
      }
      const nodes = this.buildNodes(lessons);
      this.setState({mounted: true, lessons, nodes});
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

  buildMenu(n) {
    const menu = <Menu>
      <MenuItem
        iconName="arrow-up"
        onClick={this.handleClick}
        text={`Move ${n.itemType} Up`}
        disabled={n.ordering === 0 || n.index === "0"}
      />
      <MenuItem
        iconName="arrow-down"
        onClick={this.handleClick}
        text={`Move ${n.itemType} Down`}
        disabled={n.isLast}
      />
      <MenuDivider />
      <MenuItem
        iconName="add"
        onClick={this.handleClick}
        text={`Add ${n.itemType} Above`}
      />
      <MenuItem
        iconName="add"
        onClick={this.handleClick}
        text={`Add ${n.itemType} Below`}
      />
      <MenuDivider />
      <MenuItem className="pt-intent-danger" text={`Delete ${n.itemType}`} iconName="delete" />
    </Menu>;
    return <Popover content={menu} position={Position.RIGHT_TOP}>
      <Button className="pt-button" iconName="changes"/>
    </Popover>;
  }
  
  buildNodes(lessons) {
    const ltree = [];
    for (const l of lessons) {
      const mltree = [];
      for (const m of l.minilessons) {
        const stree = [];
        for (const s of m.slides) {
          stree.push({
            id: s.id, 
            hasCaret: false, 
            iconName: "page-layout", 
            label: s.title,
            data: s
          });
        }
        mltree.push({
          id: m.id, 
          hasCaret: m.slides.length, 
          iconName: "multi-select", 
          label: m.name, 
          childNodes: stree,
          data: m
        });
      }
      ltree.push({
        id: l.id, 
        hasCaret: 
        l.minilessons.length, 
        iconName: "map", 
        label: l.name, 
        childNodes: mltree,
        data: l
      });
    }
    return ltree;
  }

  handleNodeClick(node) {
    const {currentNode} = this.state;
    if (!currentNode) {
      node.isSelected = true;
      node.secondaryLabel = this.buildMenu(node.data);
    }
    else if (node.id !== currentNode.id) {
      node.isSelected = true;
      currentNode.isSelected = false;
      node.secondaryLabel = this.buildMenu(node.data);
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

  reportChange(newdata) {
    
  }

  render() {

    const {lessons, nodes, currentNode} = this.state;

    if (!lessons) return <Loading />;
    
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
              {currentNode.data.itemType === "Island" ? <IslandEditor data={currentNode.data} reportChange={this.reportChange.bind(this)} /> : null}
              {currentNode.data.itemType === "Level" ? <LevelEditor data={currentNode.data} reportChange={this.reportChange.bind(this)}/> : null }
              {currentNode.data.itemType === "Slide" ? <SlideEditor data={currentNode.data} reportChange={this.reportChange.bind(this)}/> : null }
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
