import React, {Component} from "react";
import {Link} from "react-router";
import "./IslandLink.css";

class IslandLink extends Component {

  render() {

    const {description, done, island, next, width} = this.props;

    const small = width < 400;

    if (island.isNext || next || island.isDone || done) {
      let css = "islandLink";
      if (island.isNext || next) css += " next";
      if (island.isDone || done) css += " done";
      return <Link to={`/island/${island.id}`} className={ css } key={ island.id } style={{height: `${width * (small ? 1 : 0.75)}px`, width: `${width}px`}}>
        <div className="graphic" style={{backgroundImage: `url('/islands/${ island.theme }${ small ? "-small" : "" }.png')`, height: `${width * (small ? 1 : 0.75)}px`, width: `${width}px`}}></div>
        <div className={ `pt-popover pt-tooltip ${ island.theme }` } style={{marginTop: `${width * 0.25}px`}}>
          <div className="pt-popover-content">
            <div className="title">{ island.icon ? <span className={ `pt-icon-standard ${island.icon}` } /> : null }{ island.name }</div>
            { description ? <div className="description">{ island.description }</div> : null }
          </div>
        </div>
      </Link>;
    }
    return <div className="islandLink" key={ island.id } style={{height: `${width * (small ? 1 : 0.75)}px`, width: `${width}px`}}>
      <div className="graphic" to={`/island/${island.id}`} style={{backgroundImage: `url('/islands/${ island.theme }${ small ? "-small" : "" }.png')`, height: `${width * (small ? 1 : 0.75)}px`, width: `${width}px`}}></div>
      <div className={ `pt-popover pt-tooltip ${ island.id }` } style={{marginTop: `${width * 0.25}px`}}>
        <div className="pt-popover-content">
          <div className="title"><span className="pt-icon-standard pt-icon-lock" />{ island.name }</div>
          { description ? <div className="description">{ island.description }</div> : null }
        </div>
      </div>
    </div>;

  }
}

IslandLink.defaultProps = {
  description: true,
  width: 400
};

export default IslandLink;
