import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent, Popover, Position, Tooltip, Collapse, PopoverInteractionKind} from "@blueprintjs/core";
import CodeBlockEditor from "components/CodeBlockEditor";
import CodeBlockCard from "components/CodeBlockCard";
import Checkpoint from "components/Checkpoint";
import IslandLink from "components/IslandLink";

import ShareFacebookLink from "components/ShareFacebookLink";

import "./IslandLevel.css";

import LoadingSpinner from "components/LoadingSpinner";

/**
 * Main Level-viewing component (e.g., Jungle Island). It shows a list of the levels available as well as the ending codeblock test.
 * Codeblocks by other users are listed underneath the island
 */

class Level extends Component {

  constructor(props) {
    super(props);
    this.state = {
      levels: null,
      currentIsland: null,
      nextIsland: null,
      prevIsland: null,
      userProgress: null,
      myCodeBlocks: null,
      likedCodeBlocks: null,
      unlikedCodeBlocks: null,
      loading: false,
      testOpen: false,
      school: null,
      checkpointOpen: false,
      winOpen: false,
      canPostToFacebook: true,
      winMessage: "",
      showMore: false
    };
  }

  /**
   * On Mount, or Update (meaning the user switched islands) Load the necessary progress/codeblock data from the db.
   */
  loadFromDB() {
    const {params} = this.props;
    const {lid} = params;
    const uget = axios.get("/api/userprogress/mine");
    const cbget = axios.get(`/api/codeBlocks/all?lid=${lid}`);
    // This was written before realizing that the userprofile is passed in via props from canon - this could be refactored
    const pget = axios.get(`/api/profile/${this.props.auth.user.username}`);

    Promise.all([uget, cbget, pget]).then(resp => {
      const userProgress = resp[0].data.progress;
      const allCodeBlocks = resp[1].data;
      const profile = resp[2].data;

      // Islands and levels are retrieved from the redux store, which was populated in App.jsx's Mount
      const islands = this.props.islands.slice(0);
      const levels = this.props.levels.filter(l => l.lid === lid);

      const currentIsland = islands.find(i => i.id === lid);
      const nextIsland = islands.find(i => i.ordering === currentIsland.ordering + 1);
      const prevIsland = islands.find(i => i.ordering === currentIsland.ordering - 1);

      // If the user hasn't filled in their school, and they are on ANY island other than the first, prompt them to fill
      // it in via Checkpoint.jsx. 
      const checkpointOpen = profile.sid || currentIsland.id === "island-1" ? false : true;

      const myCodeBlocks = [];
      const likedCodeBlocks = [];
      const unlikedCodeBlocks = [];

      currentIsland.codeBlock = null;

      // Fold over snippets and separate them into mine and others
      for (const cb of allCodeBlocks) {
        if (cb.uid === this.props.auth.user.id) {
          currentIsland.codeBlock = cb;
          myCodeBlocks.push(cb);
        }
        else {
          cb.liked ? likedCodeBlocks.push(cb) : unlikedCodeBlocks.push(cb);
        }
      }

      this.setState({levels, checkpointOpen, currentIsland, nextIsland, prevIsland, userProgress, myCodeBlocks, likedCodeBlocks, unlikedCodeBlocks, loading: false}, this.maybeTriggerCodeblock.bind(this));
    });
  }

  /** 
   * The presence of `/show` in the URL is a permalink to open the codeblock. Was originally intended so that codeblockcards could directly link
   * to a user's own codeblock and automatically open it, but this feature was postponed.
   */ 
  maybeTriggerCodeblock() {
    const testOpen = location.pathname.includes("/show") && this.allLevelsBeaten();
    this.setState({testOpen});
  }

  /**
   * When the user changes pages, flush the state and reload from the database
   */
  componentDidUpdate() {
    const {location} = this.props.router;
    const {currentIsland, loading} = this.state;
    if (!loading && !currentIsland || currentIsland && currentIsland.id !== location.pathname.split("/")[1]) {
      this.setState({currentIsland: null, levels: null, userProgress: null, loading: true}, this.loadFromDB);
    }
  }

  /**
   * The code to load from DB already exists in ComponentDidUpdate, this dedupes that logic by just manually calling update on mount.
   */
  componentDidMount() {
    this.forceUpdate();
  }

  /**
   * A timeout is registered on Codeblock completion to process the screenshot, ensuring that it is complete before allowing fb sharing.
   * Clear this timeout if the user leaves the page
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  /**
   * Hide or Show the codeblock test popover. Adjust the URL accordingly
   */
  toggleTest() {
    const {browserHistory} = this.context;
    const {pathname} = this.props.router.location;
    const path = pathname.slice(-1) === "/" ? pathname.slice(0, -1) : pathname;
    const {testOpen} = this.state;
    if (testOpen) {
      this.setState({testOpen: false});
      const n = path.indexOf("/show");
      const url = `/${path.substring(0, n !== -1 ? n : path.length)}`;
      browserHistory.push(url);
    }
    else {
      this.setState({testOpen: true});
      browserHistory.push(`/${path}/show`);
    }
  }

  /**
   * Callback for CodeBlockEditor on save. The CodeBlockEditor passes its codeblock back out to Level so that its
   * Codeblock can be set.  
   */
  handleSave(newCodeBlock) {
    const {currentIsland} = this.state;
    if (!currentIsland.codeBlock) currentIsland.codeBlock = newCodeBlock;
    this.setState({currentIsland});
  }

  /**
   * Called when the user finishes an island for the first time. Calls a refresh on the data
   * to unlock codeblocks, shows the victory message, and invites the user to the next island.
   */
  onFirstCompletion() {
    // Upon beating the level, the user needs all codeblocks to unlock, as well as add theirs
    // to the top of the list. It's a little db-heavy to hit the db here, maybe revisit this.
    this.loadFromDB();
    const winMessage = this.state.currentIsland.victory;
    this.setState({winMessage, winOpen: true, canPostToFacebook: false}, this.toggleTest.bind(this));
    // As documented in codeblocksroute, screenshots take a bit of time to be processed.
    // This timeout ensures that the user doesn't share a picture before it's processed.
    this.timeout = setTimeout(() => this.setState({canPostToFacebook: true}), 6000);
  }

  /**
   * Upon Closing the winning pop-up, send the player to the next island. 
   */
  closeOverlay() {
    // TODO: take out island 4 catcher after august (completed)
    // TODO2: blocker added back in for november
    // TODO3: blocker incremented for december island
    // TODO4: DIDN'T update this blocker for January, because we don't have an island yet.  Update after new island is placed.
    // TODO5: Just updated this to the new space island now that they are added
    // 21a4 is space island.  If the next island is space island, DONT go to it
    if (this.state.nextIsland && this.state.nextIsland.id && this.state.nextIsland.id !== "island-21a4") {
      window.location = `/island/${this.state.nextIsland.id}`;
    }
    else {
      this.setState({winOpen: false});
    }
  }

  /**
   * Levels and Islands are mixed together in a single array - so this can be used to test if
   * a user has beaten a level (e.g. hello-world) or an entire island (e.g. island-1).
   */
  hasUserCompleted(milestone) {
    return this.state.userProgress.find(up => up.level === milestone);
  }

  /** 
   * The codeblocks underneath the island need to be informed via a callback when they are 
   * liked or unliked, as this affects the sorting.
   */ 
  reportLike(codeBlock) {
    let likedCodeBlocks = this.state.likedCodeBlocks.slice(0);
    let unlikedCodeBlocks = this.state.unlikedCodeBlocks.slice(0);
    if (codeBlock.uid === this.props.auth.user.id) return;
    if (codeBlock.liked) {
      likedCodeBlocks.push(codeBlock);
      unlikedCodeBlocks = unlikedCodeBlocks.filter(cb => cb.id !== codeBlock.id);
    }
    else {
      unlikedCodeBlocks.push(codeBlock);
      likedCodeBlocks = likedCodeBlocks.filter(cb => cb.id !== codeBlock.id);
    }
    likedCodeBlocks.sort((a, b) => b.likes - a.likes || b.id - a.id);
    unlikedCodeBlocks.sort((a, b) => b.likes - a.likes || b.id - a.id);
    this.setState({likedCodeBlocks, unlikedCodeBlocks});
  }

  /**
   * Used to determine if the final test should be shown.
   */
  allLevelsBeaten() {
    const {levels} = this.state;
    if (levels && levels.length) {
      let missedLevels = 0;
      for (const l of levels) {
        if (!this.hasUserCompleted(l.id)) missedLevels++;
      }
      return missedLevels === 0;
    }
    else {
      return false;
    }
  }

  /**
   * If a user has beaten all the levels on this island, but has NOT created a codeblock yet,
   * they are in the state were the codeblock need be prompted
   */
  promptFinalTest() {
    return this.allLevelsBeaten() && !this.state.currentIsland.codeBlock;
  }

  showMore() {
    this.setState({showMore: !this.state.showMore});
  }

  closeCheckpoint() {
    this.setState({checkpointOpen: false});
  }

  /**
   * Checkpoint is a pop-up that appears after level 1, asking the user to share their
   * school. This is the api callback to update their profile
   */
  saveCheckpoint() {
    if (this.state.school && this.state.school.id) {
      axios.post("/api/profile/update", {sid: this.state.school.id}).then(resp => {
        resp.status === 200 ? console.log("success") : console.log("error");
      });
    }
    this.setState({checkpointOpen: false});
  }

  /**
   * If the user elects not to provide their school, write a hard-coded -1 to their sid.
   * This saves the "prefer not to answer" choice and prevents future popups.
   */
  skipCheckpoint() {
    axios.post("/api/profile/update", {sid: -1}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
    });
    this.setState({checkpointOpen: false});
  }

  pickedSchool(school) {
    this.setState({school});
  }

  shareHook() {

  }

  /** 
   * This was written early in the project, before the Component nesting of React was 
   * fully put to use. This method encapsulates the checkpoint popover - but this should
   * obviously be moved to a component, not a method.
   */
  buildCheckpointPopover() {
    const {t} = this.props;
    const {theme} = this.state.currentIsland;
    return (
      <Dialog
        className="form-container checkpoint-form-container text-center"
        isOpen={this.state.checkpointOpen}
        onClose={this.closeCheckpoint.bind(this)}
        title={ t("Survey") }
        iconName=""
      >

        {/* heading */}
        <h2 className="checkpoint-heading u-text-center font-xl">{ t("Do you go to school in Minas Gerais?") }</h2>

        {/* basically just a SelectSchool component */}
        <Checkpoint completed={this.pickedSchool.bind(this)}/>

        {/* no thanks */}
        <div className="field-container pt-inline">
          <div className="checkbox-container">
            <label className="pt-control pt-checkbox font-xs u-margin-bottom-off">
              <input type="checkbox" onClick={this.skipCheckpoint.bind(this)} />
              <span className="pt-control-indicator" />
              {t("I'd rather not say")}
            </label>
          </div>
        </div>

        {/* save changes button */}
        <div className="field-container">
          {/* <button
            className="pt-button pt-intent-primary font-sm"
            onClick={this.skipCheckpoint.bind(this)} >
            {t("No")}
          </button> */}
          <button
            className="pt-button pt-intent-primary font-md"
            disabled={!this.state.school}
            onClick={this.saveCheckpoint.bind(this)} >
            {t("Save changes")}
          </button>
        </div>
      </Dialog>
    );
  }

  /** 
   * This was written early in the project, before the Component nesting of React was 
   * fully put to use. This method encapsulates the "You Win" popover - but this should
   * obviously be moved to a component, not a method.
   */
  buildWinPopover() {

    const {t} = this.props;
    const {currentIsland, canPostToFacebook} = this.state;
    const {name, theme} = currentIsland;
    const {origin} = this.props.location;
    const {username} = this.props.auth.user;
    let snippetname = "";
    // Slugs were not introduced until later in Codelife - if one doesn't exist, fall back to name
    if (currentIsland.codeBlock) {
      snippetname = currentIsland.codeBlock.slug ? currentIsland.codeBlock.slug : currentIsland.codeBlock.snippetname;
    }

    const shareLink = snippetname.length ? `${origin}/codeBlocks/${username}/${snippetname}` : origin;

    return (
      <Dialog
        className={ `share-dialog form-container u-text-center ${theme}` }
        isOpen={this.state.winOpen}
        onClose={this.closeOverlay.bind(this)} >

        <h2 className="share-heading font-xl">
          { t("{{island}} Complete", {island: name}) }
        </h2>

        <p className="share-body font-md u-margin-bottom-off">{this.state.winMessage}</p>

        <div className="share-button-group field-container">
          {/* facebook */}
          <ShareFacebookLink context="codeblock" shareLink={shareLink} screenshotReady={canPostToFacebook} />
          {/* TODO: replace with smarter text, check for next island */}
          <Button
            className="share-button pt-button pt-button-primary font-md"
            intent={Intent.PRIMARY}
            onClick={this.closeOverlay.bind(this)}
            text={t("Next island")}
          />
        </div>

        {/* <div className="island-icon" style={{backgroundImage: `url('/islands/${theme}-small.png')`}} /> */}

      </Dialog>
    );
  }

  /** 
   * This was written early in the project, before the Component nesting of React was 
   * fully put to use. This method encapsulates the test popover - but this should
   * obviously be moved to a component, not a method.
   */
  buildTestPopover() {
    const {t} = this.props;
    const {currentIsland} = this.state;
    let title = t("myCodeblock", {islandName: currentIsland.name});
    if (currentIsland.codeBlock) title = currentIsland.codeBlock.snippetname;

    if (!this.allLevelsBeaten()) {
      return (
        <div className="editor-popover">
          <button className="code-block u-unbutton" onClick={this.toggleTest.bind(this)}>
            <div className="side bottom"></div>
            <div className="side top"></div>
            <div className="side left"></div>
            <div className="side front"></div>
          </button>
        </div>
      );
    }

    const next = this.promptFinalTest();

    return (
      <div className="editor-popover">
        <Tooltip
          isOpen={ next ? true : undefined }
          position={ next ? Position.BOTTOM : Position.TOP }
          content={ next ? t("Earn your CodeBlock") : t("CodeBlock") }
          portalClassName={ `codeblock-tooltip-portal ${ next ? "is-below" : "is-above" }` }
          tooltipClassName={ currentIsland.theme }>
          <button className={ `u-unbutton code-block ${ next ? "is-next" : "is-done" }` } onClick={this.toggleTest.bind(this)}>
            <div className="side bottom"></div>
            <div className="side top"></div>
            <div className="side left"></div>
            <div className="side front"><span className={ `pt-icon-standard pt-icon-${ next ? "help" : "code-block" }` }></span></div>
          </button>
        </Tooltip>
        <Dialog
          className={ `codeblockeditor-dialog studio-inner ${ currentIsland.theme }` }
          isOpen={this.state.testOpen}
          onClose={this.toggleTest.bind(this)}
          title=""
        >
          <CodeBlockEditor
            island={ currentIsland }
            title={ title }
            handleSave={ this.handleSave.bind(this) }
            onFirstCompletion={ this.onFirstCompletion.bind(this) }
          />
        </Dialog>
      </div>
    );
  }

  render() {

    const {auth, t} = this.props;
    const {levels, currentIsland, nextIsland, prevIsland, checkpointOpen, userProgress, myCodeBlocks, likedCodeBlocks, unlikedCodeBlocks, showMore, canPostToFacebook} = this.state;
    const {browserHistory} = this.context;

    if (!auth.user) browserHistory.push("/");
    if (!currentIsland || !levels || !userProgress) return <LoadingSpinner />;

    const islandProgress = this.hasUserCompleted(this.props.params.lid);
    const islandDone = islandProgress && islandProgress.status === "completed";
    const otherCodeBlocks = myCodeBlocks.concat(likedCodeBlocks, unlikedCodeBlocks);

    const levelStatuses = levels;
    for (let l = 0; l < levelStatuses.length; l++) {
      const levelProgress = this.hasUserCompleted(levelStatuses[l].id);
      const skipped = levelProgress && levelProgress.status === "skipped";
      const done = levelProgress && levelProgress.status === "completed";
      levelStatuses[l].isDone = done;
      levelStatuses[l].isSkipped = skipped;
      // If i'm the first lesson and i'm not done, i'm next lesson
      // If i'm past the first lesson and i'm not done but my previous one is, i'm the next lesson
      levelStatuses[l].isNext = l === 0 && !done || l > 0 && !done && (levelStatuses[l - 1].isDone || levelStatuses[l - 1].isSkipped);
    }

    const otherCodeBlockItemsBeforeFold = [];
    const otherCodeBlockItemsAfterFold = [];
    let top = 3;
    for (const cb of otherCodeBlocks) {
      const cbc = <CodeBlockCard theme={currentIsland.theme} icon={currentIsland.icon} codeBlock={cb} userProgress={userProgress} reportLike={this.reportLike.bind(this)}/>;
      top > 0 ? otherCodeBlockItemsBeforeFold.push(cbc) : otherCodeBlockItemsAfterFold.push(cbc);
      top--;
    }

    const levelItems = levelStatuses.map(level => {
      const {lid} = this.props.params;
      if (level.isDone) {
        return <Popover
          interactionKind={PopoverInteractionKind.HOVER}
          popoverClassName={ `stop-popover pt-popover pt-tooltip ${ currentIsland.theme }` }
          position={Position.TOP}
          openOnTargetFocus={false}
          enforceFocus = {false}
        >
          <Link className="stop is-done" to={`/island/${lid}/${level.id}`}>
            {/* descriptive text for screen readers */}
            <span className="u-visually-hidden">
              { `${ t("Level")} ${level.ordering + 1}: ${level.name}` }
            </span>
          </Link>
          {level.name}
        </Popover>;
      }
      else if (level.isSkipped) {
        // New state incoming - How to visually indicate skip? TODO: DESIGN
        return <Popover
          interactionKind={PopoverInteractionKind.HOVER}
          popoverClassName={ `stop-popover pt-popover pt-tooltip ${ currentIsland.theme }` }
          position={Position.TOP}
          openOnTargetFocus={false}
          enforceFocus = {false}
        >
          <Link className="stop is-done is-incomplete" to={`/island/${lid}/${level.id}`}>
            {/* descriptive text for screen readers */}
            <span className="u-visually-hidden">
              { `${ t("Level")} ${level.ordering + 1}: ${level.name} (${ t("incomplete") })` }
            </span>
          </Link>
          {`${level.name} (${ t("incomplete") })`}
        </Popover>;
      }
      else if (level.isNext) {
        return <Tooltip
          isOpen={!checkpointOpen}
          position={ Position.BOTTOM }
          content={ level.name }
          tooltipClassName={ currentIsland.theme }
          openOnTargetFocus={false}
          enforceFocus = {false}
        >
          <Link className="stop is-next" to={`/island/${lid}/${level.id}`}>
            {/* descriptive text for screen readers */}
            <span className="u-visually-hidden">
              { `${ t("Level")} ${level.ordering + 1}: ${level.name} })` }
            </span>
          </Link>
        </Tooltip>;
      }
      return <div key={level.id} className="stop" />;
    });

    return (
      <div id="island" className={ `island ${currentIsland.theme}` }>

        { this.buildWinPopover() }
        { this.buildCheckpointPopover() }
        <div className="island-image image">
          <h1 className="island-title font-xl" id="title">
            { currentIsland.icon ? <span className={ `pt-icon-large ${currentIsland.icon}` } /> : null }
            { currentIsland.name }
          </h1>
          <div id="path" className="island-path path">
            { levelItems }
            { this.buildTestPopover() }
          </div>
        </div>
        { prevIsland && <h2 className="u-visually-hidden">{`${t("Previous island")}: `}</h2>}
        { prevIsland ? <IslandLink done={true} width={250} island={prevIsland} description={false} /> : null}
        { /* TODO: RIP OUT THIS CRAPPY 3 BLOCKER AFTER AUGUST (DONE) */}
        { /* TODO2: adding blocker back in for November Beta */}
        { /* TODO3: incremented blocker for December Island */}
        { /* TODO4: incremented blocker for January Island */}

        { nextIsland && Number(nextIsland.ordering) < 8  && this.hasUserCompleted(currentIsland.id) && <h2 className="u-visually-hidden">{`${t("Next island")}: `}</h2>}
        { nextIsland && Number(nextIsland.ordering) < 8  && this.hasUserCompleted(currentIsland.id) ? <IslandLink next={true} width={250} island={nextIsland} description={false} /> : null}
        { /* nextIsland && this.hasUserCompleted(currentIsland.id) ? <IslandLink next={true} width={250} island={nextIsland} description={false} /> : null */ }
        { otherCodeBlocks.length
          ? <div className="student-codeblocks-container">
            <h2 className="student-codeblocks-title u-margin-bottom-md">
              {t("Other Students' CodeBlocks")}&nbsp;
              { !islandDone
                ? <Popover
                  interactionKind={PopoverInteractionKind.HOVER}
                  popoverClassName="pt-popover-content-sizing user-popover"
                  position={Position.TOP}
                >
                  <span className="pt-icon pt-icon-lock"></span>
                  <div>
                    { t("Earn your Codeblock for this Island to unlock the ability to view the source code of other codeblocks!") }
                  </div>
                </Popover> : null }
            </h2>
            <div className="snippets card-list">{otherCodeBlockItemsBeforeFold}</div>
            { otherCodeBlockItemsAfterFold.length
              ? <Collapse isOpen={showMore}><div className="snippets card-list snippets-more">{otherCodeBlockItemsAfterFold}</div></Collapse>
              : null }
            { otherCodeBlockItemsAfterFold.length
              ? <button className="pt-button pt-intent-primary toggle-show u-margin-top-off" onClick={this.showMore.bind(this)}><span className={ `pt-icon-standard pt-icon-double-chevron-${ showMore ? "up" : "down" }` } />
                { showMore ? t("Show Less") : t("Show {{x}} More", {x: otherCodeBlockItemsAfterFold.length}) }
              </button>
              : null }
          </div>
          : null }
      </div>
    );
  }
}

Level.contextTypes = {
  browserHistory: PropTypes.object
};

const mapStateToProps = state => ({
  auth: state.auth,
  islands: state.islands,
  levels: state.levels,
  location: state.location
});

Level = connect(mapStateToProps)(Level);
export default translate()(Level);
