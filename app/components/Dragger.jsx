import React, {Component} from "react";
import {translate} from "react-i18next";
import {DragDropContextProvider} from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import Box from "components/Box";
import Dustbin from "components/Dustbin";

class Dragger extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div>
          <div style={{width: "1200px"}}>
            <div style={{float: "left", width: "450px"}}>
              <Box name="title snippet" text="<h1>title</h1>"/>
              <Box name="list snippet" text="<ul><li>test</li></ul>"/>
              <Box name="img snippet" text="<img src='img' />" />
            </div>
            <div style={{float: "right", width: "450px"}}>
              <Dustbin />
            </div>
          </div>
          <div style={{clear: "both"}} />
        </div>
      </DragDropContextProvider>
    );
  }
}

export default translate()(Dragger);
