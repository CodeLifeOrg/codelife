import React, {Component} from "react";
import {Link} from "react-router";
import "./IslandLink.css";

import {ICONS} from "consts";

class IslandLink extends Component {

  render() {

    const {description, done, lesson, next, width} = this.props;

    const small = width < 400;

    if (lesson.isNext || next || lesson.isDone || done) {
      let css = "islandLink";
      if (lesson.isNext || next) css += " next";
      if (lesson.isDone || done) css += " done";
      return <Link to={`/lesson/${lesson.id}`} className={ css } key={ lesson.id } style={{height: `${width * (small ? 1 : 0.75)}px`, width: `${width}px`}}>
        <div className="graphic" style={{backgroundImage: `url('/islands/${ lesson.theme }${ small ? "-small" : "" }.png')`, height: `${width * (small ? 1 : 0.75)}px`, width: `${width}px`}}></div>
        <div className={ `pt-popover pt-tooltip ${ lesson.theme }` } style={{marginTop: `${width * 0.25}px`}}>
          <div className="pt-popover-content">
            <div className="title">{ ICONS[lesson.id] ? <span className={ `pt-icon-standard pt-icon-${ICONS[lesson.id]}` } /> : null }{ lesson.name }</div>
            { description ? <div className="description">{ lesson.description }</div> : null }
          </div>
        </div>
      </Link>;
    }
    return <div className="islandLink" key={ lesson.id } style={{height: `${width * (small ? 1 : 0.75)}px`, width: `${width}px`}}>
      <div className="graphic" to={`/lesson/${lesson.id}`} style={{backgroundImage: `url('/islands/${ lesson.id }${ small ? "-small" : "" }.png')`, height: `${width * (small ? 1 : 0.75)}px`, width: `${width}px`}}></div>
      <div className={ `pt-popover pt-tooltip ${ lesson.id }` } style={{marginTop: `${width * 0.25}px`}}>
        <div className="pt-popover-content">
          <div className="title"><span className="pt-icon-standard pt-icon-lock" />{ lesson.name }</div>
          { description ? <div className="description">{ lesson.description }</div> : null }
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
