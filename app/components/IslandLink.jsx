import React, {Component} from "react";
import {Link} from "react-router";
import "./IslandLink.css";

/**
 * IslandLink is the zoomed-out picture of the island used in the overworld map, lesson plan, etc
 */

class IslandLink extends Component {

  render() {

    const {description, done, heading, island, linkContext, next, small, standalone} = this.props;

    if (island.isNext || next || island.isDone || done || standalone === true) {

      // unlocked island link
      let unlockedClasses = `${ island.theme } island-link`;
      if (!(island.isNext || next)) unlockedClasses += " is-prev";
      if (island.isNext || next) unlockedClasses += " is-next";
      if (island.isDone || done) unlockedClasses += " is-done";

      return <Link to={`/${linkContext}/${island.id}`} className={ unlockedClasses } key={ island.id }>
        <div className={ small ? "island-link-image island-link-image-small" : "island-link-image" } />

        {/* hidden heading for accessiblity */}
        {heading && <h3 className="u-visually-hidden">{ island.name }</h3>}

        <div className="island-link-popover pt-popover pt-tooltip">
          <div className={ `${ island.theme } island-link-label pt-popover-content` }>
            <div className="island-link-title font-md">
              { island.icon ? <span className={ `pt-icon-standard ${island.icon}` } /> : null }
              { island.name }
            </div>
            { description ? <p className="island-link-description font-xs u-margin-top-off u-margin-bottom-off">{ island.description }</p> : null }
          </div>
        </div>
      </Link>;
    }

    // locked island link
    let lockedClasses = `${ island.theme } island-link is-locked`;
    if (small) lockedClasses += " island-link-small";

    return <div className={ lockedClasses } key={ island.id }>
      <div className={ small ? "island-link-image island-link-image-small" : "island-link-image" } />
      <div className={ `island-link-popover pt-popover pt-tooltip ${ island.id }` }>
        <div className={ `${ island.theme } island-link-label pt-popover-content` }>
          <div className="island-link-title font-md">
            <span className="pt-icon-standard pt-icon-lock" />
            { island.name }
          </div>
          { description ? <p className="island-link-description font-xs u-margin-top-off u-margin-bottom-off">{ island.description }</p> : null }
        </div>
      </div>
    </div>;
  }
}

IslandLink.defaultProps = {
  description: true,
  small: false,
  standalone: true,
  linkContext: "island",
  heading: true
};

export default IslandLink;
