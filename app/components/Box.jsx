import React, {Component} from "react";
import PropTypes from "prop-types";
import {DragSource} from "react-dnd";

const style = {
  border: "1px dashed gray",
  backgroundColor: "white",
  padding: "0.5rem 1rem",
  marginRight: "1.5rem",
  marginBottom: "1.5rem",
  cursor: "move",
  float: "left"
};

const boxSource = {
  beginDrag(props) {
    return {
      text: props.text,
      name: props.name
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    if (dropResult) {
      window.alert(`You dropped ${item.text} into ${dropResult.dropper}!`);
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

const propTypes = {
  text: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isDragging: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func.isRequired
};

class Box extends Component {
  render() {
    const {isDragging, connectDragSource, name} = this.props;
    const opacity = isDragging ? 0.4 : 1;
    return connectDragSource(
      <div style={{...style, opacity}}>
        {name}
      </div>
    );
  }
}

Box.propTypes = propTypes;

export default DragSource("box", boxSource, collect)(Box);

