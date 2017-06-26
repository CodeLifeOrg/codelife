import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";
import {DragDropContextProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Snippet from "components/Snippet";
import Dustbin from "components/Dustbin";

class Dragger extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div>
          <div style={{width:"1200px"}}>
            <div style={{float:"left", width:"450px"}}>
              <Snippet name="title snippet" text="<h1>title</h1>"/>
              <Snippet name="list snippet" text="<ul><li>test</li></ul>"/>
              <Snippet name="img snippet" text="<img src='img' />" />
            </div>
            <div style={{float:"right", width:"450px"}}>
              <Dustbin />
            </div>
          </div>
          <div style={{clear:"both"}} />
        </div>
      </DragDropContextProvider>
    );
  }
}

export default translate()(Dragger);
