import React, {Component} from "react";
import {Link} from "react-router";
import "./IslandLink.css";

class IslandLink extends Component {

  render() {

    const {description, done, island, next, width} = this.props;

    const small = width < 400;

    if (island.isNext || next || island.isDone || done) {

      { /* unlocked island link */ }
      let unlockedClasses = `${ island.theme } island-link`;
      if (small) unlockedClasses += " island-link-small";
      if (!(island.isNext || next)) unlockedClasses += " is-prev";
      if (island.isNext || next) unlockedClasses += " is-next";
      if (island.isDone || done) unlockedClasses += " is-done";

      return <Link to={`/island/${island.id}`} className={ unlockedClasses } key={ island.id }>
        <div className={ small ? "island-link-image island-link-image-small" : "island-link-image" } />
        <div className="island-link-popover pt-popover pt-tooltip">
          <div className={ `${ island.theme } island-link-label pt-popover-content` }>
            <div className="island-link-title">
              { island.icon ? <span className={ `pt-icon-standard ${island.icon}` } /> : null }
              { island.name }
            </div>
            { description ? <div className="island-link-description">{ island.description }</div> : null }
          </div>
        </div>
      </Link>;
    }

    { /* locked island link */ }
    let lockedClasses = `${ island.theme } island-link is-locked`;
    if (small) lockedClasses += " island-link-small";

    return <div className={ lockedClasses } key={ island.id }>
      <div className={ small ? "island-link-image island-link-image-small" : "island-link-image" } to={`/island/${island.id}`} />
      <div className={ `island-link-popover pt-popover pt-tooltip ${ island.id }` }>
        <div className={ `${ island.theme } island-link-label pt-popover-content` }>
          <div className="island-link-title">
            <span className="pt-icon-standard pt-icon-lock" />
            { island.name }
          </div>
          { description ? <div className="island-link-description">{ island.description }</div> : null }
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
