import axios from "axios";
import {connect} from "react-redux";
import {browserHistory, Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent, Popover, Position, Tooltip, Collapse, PopoverInteractionKind} from "@blueprintjs/core";
import CodeBlock from "components/CodeBlock";
import CodeBlockCard from "components/CodeBlockCard";
import Checkpoint from "components/Checkpoint";
import IslandLink from "components/IslandLink";

import "./Level.css";

import Loading from "components/Loading";

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
      winMessage: "",
      showMore: false
    };
  }

  // TODO: Merge this with the one in CodeBlockList, they do the same thing.
  loadFromDB() {
    const {params} = this.props;
    const {lid} = params;
    const uget = axios.get("/api/userprogress/mine");
    const cbget = axios.get(`/api/codeBlocks/all?lid=${lid}`);
    const pget = axios.get(`/api/profile/${this.props.auth.user.username}`);

    Promise.all([uget, cbget, pget]).then(resp => {
      const userProgress = resp[0].data.progress;
      const allCodeBlocks = resp[1].data;
      const profile = resp[2].data;

      const islands = this.props.islands.slice(0);
      const levels = this.props.levels.filter(l => l.lid === lid);

      const currentIsland = islands.find(i => i.id === lid);
      // TODO: add an exception for level 10.
      const nextIsland = islands.find(i => i.ordering === currentIsland.ordering + 1);
      const prevIsland = islands.find(i => i.ordering === currentIsland.ordering - 1);

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

      this.setState({levels, checkpointOpen, currentIsland, nextIsland, prevIsland, userProgress, myCodeBlocks, likedCodeBlocks, unlikedCodeBlocks, loading: false});
    });
  }

  componentDidUpdate() {
    const {location} = this.props;
    const {currentIsland, loading} = this.state;
    if (!loading && !currentIsland || currentIsland && currentIsland.id !== location.pathname.split("/")[2]) {
      this.setState({currentIsland: null, levels: null, userProgress: null, loading: true}, this.loadFromDB);
    }
  }

  componentDidMount() {
    this.forceUpdate();
  }

  toggleTest() {
    this.setState({testOpen: !this.state.testOpen});
  }

  handleSave(newCodeBlock) {
    // TODO: i think i hate this.  when CodeBlock saves, I need to change the state of the snippet
    // so that subsequent opens will reflect the newly saved code.  In a perfect world, a CodeBlock save would
    // reload the updated snippet freshly from the database, but I also want to minimize db hits.  revisit this.
    const {currentIsland} = this.state;
    if (!currentIsland.codeBlock) currentIsland.codeBlock = newCodeBlock;
    this.setState({currentIsland});
  }

  onFirstCompletion() {
    // TODO: i'm reloading everything here because after the first completion, we need to
    // unlock all codeblocks AND show your brand-new written one at the top of the list.
    // perhaps revisit if this is on the heavy DB-interaction side?
    this.loadFromDB();
    const winMessage = this.state.currentIsland.victory;
    this.setState({winMessage, testOpen: false, winOpen: true});
  }

  closeOverlay() {
    // TODO: take out island 4 catcher after august (completed)
    // TODO2: blocker added back in for november
    // TODO3: blocker incremented for december island
    // TODO4: DIDN'T update this blocker for January, because we don't have an island yet.  Update after new island is placed.
    // TODO5: Just updated this to the new space island now that they are added
    if (this.state.nextIsland && this.state.nextIsland.id && this.state.nextIsland.id !== "island-21a4") {
      window.location = `/island/${this.state.nextIsland.id}`;
    }
    else {
      this.setState({winOpen: false});
    }
  }

  hasUserCompleted(milestone) {
    return this.state.userProgress.find(up => up.level === milestone);
  }

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

  allLevelsBeaten() {
    const {levels} = this.state;
    let missedLevels = 0;
    for (const l of levels) {
      if (!this.hasUserCompleted(l.id)) missedLevels++;
    }
    return missedLevels === 0;
  }

  promptFinalTest() {
    return this.allLevelsBeaten() && !this.state.currentIsland.codeBlock;
  }

  showMore() {
    this.setState({showMore: !this.state.showMore});
  }

  closeCheckpoint() {
    this.setState({checkpointOpen: false});
  }

  saveCheckpoint() {
    if (this.state.school && this.state.school.id) {
      axios.post("/api/profile/update", {sid: this.state.school.id}).then(resp => {
        resp.status === 200 ? console.log("success") : console.log("error");
      });
    }
    this.setState({checkpointOpen: false});
  }

  skipCheckpoint() {
    axios.post("/api/profile/update", {sid: -1}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
    });
    this.setState({checkpointOpen: false});
  }

  pickedSchool(school) {
    this.setState({school});
  }

  buildCheckpointPopover() {
    const {t} = this.props;
    const {theme} = this.state.currentIsland;
    return (
      <Dialog
        className={ theme }
        isOpen={this.state.checkpointOpen}
        onClose={this.closeCheckpoint.bind(this)}
        title={ t("Survey") }
        canEscapeClose={false}
        canOutsideClickClose={false}
        isCloseButtonShown={false}
        iconName="clipboard"
      >
        <div className="pt-dialog-body">
          <Checkpoint completed={this.pickedSchool.bind(this)}/>
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button
              intent={Intent.DANGER}
              onClick={this.skipCheckpoint.bind(this)}
              text={t("No")}
            />
            <Button
              intent={Intent.WARNING}
              onClick={this.skipCheckpoint.bind(this)}
              text={t("I'd rather not say")}
            />
            <Button
              intent={Intent.SUCCESS}
              disabled={!this.state.school}
              onClick={this.saveCheckpoint.bind(this)}
              text={t("Save")}
            />

          </div>
        </div>
      </Dialog>
    );
  }

  buildWinPopover() {

    const {t} = this.props;
    const {name, theme} = this.state.currentIsland;

    return (
      <Dialog
        className={ theme }
        isOpen={this.state.winOpen}
        onClose={this.closeOverlay.bind(this)}
        title={ t("{{island}} Complete", {island: name}) }
      >
        <div className="pt-dialog-body">
          <div className="island-icon" style={{backgroundImage: `url('/islands/${theme}-small.png')`}} />
          {this.state.winMessage}
        </div>
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <Button
              className="pt-fill"
              intent={Intent.PRIMARY}
              onClick={this.closeOverlay.bind(this)}
              text={t("Keep Exploring")}
            />
          </div>
        </div>
      </Dialog>
    );
  }

  buildTestPopover() {
    const {t} = this.props;
    const {currentIsland} = this.state;
    let title = t("myCodeblock", {islandName: currentIsland.name});
    if (currentIsland.codeBlock) title = currentIsland.codeBlock.snippetname;

    if (!this.allLevelsBeaten()) {
      return (
        <div className="editor-popover">
          <div className="code-block" onClick={this.toggleTest.bind(this)}>
            <div className="side bottom"></div>
            <div className="side top"></div>
            <div className="side left"></div>
            <div className="side front"></div>
          </div>
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
          tooltipClassName={ currentIsland.theme }>
          <div className={ `code-block ${ next ? "is-next" : "is-done" }` } onClick={this.toggleTest.bind(this)}>
            <div className="side bottom"></div>
            <div className="side top"></div>
            <div className="side left"></div>
            <div className="side front"><span className={ `pt-icon-standard pt-icon-${ next ? "help" : "code-block" }` }></span></div>
          </div>
        </Tooltip>
        <Dialog
          className={ `codeBlock ${ currentIsland.theme }` }
          isOpen={this.state.testOpen}
          onClose={this.toggleTest.bind(this)}
          title={ title }
        >
          <div className="pt-dialog-body">
            <CodeBlock
              island={currentIsland}
              handleSave={this.handleSave.bind(this)}
              onFirstCompletion={this.onFirstCompletion.bind(this)}
            />
          </div>
        </Dialog>
      </div>
    );
  }

  render() {

    const {auth, t} = this.props;
    const {levels, currentIsland, nextIsland, prevIsland, checkpointOpen, userProgress, myCodeBlocks, likedCodeBlocks, unlikedCodeBlocks, showMore} = this.state;

    if (!auth.user) browserHistory.push("/");
    if (!currentIsland || !levels || !userProgress) return <Loading />;

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
    let top = 4;
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
        >
          <Link className="stop is-done" to={`/island/${lid}/${level.id}`}></Link>
          <span>
            {level.name}
          </span>
        </Popover>;
      }
      else if (level.isSkipped) {
        // New state incoming - How to visually indicate skip? TODO: DESIGN
        return <Popover
          interactionKind={PopoverInteractionKind.HOVER}
          popoverClassName={ `stop-popover pt-popover pt-tooltip ${ currentIsland.theme }` }
          position={Position.TOP}
        >
          <Link className="stop is-done is-incomplete" to={`/island/${lid}/${level.id}`}></Link>
          <span>
            {`${level.name} (incomplete)`}
          </span>
        </Popover>;
      }
      else if (level.isNext) {
        return <Tooltip isOpen={!checkpointOpen} position={ Position.BOTTOM } content={ level.name } tooltipClassName={ currentIsland.theme }>
          <Link className="stop is-next" to={`/island/${lid}/${level.id}`}></Link>
        </Tooltip>;
      }
      return <div key={level.id} className="stop"></div>;
    });

    return (
      <div id="island" className={ `island ${currentIsland.theme}` }>
        { this.buildWinPopover() }
        { this.buildCheckpointPopover() }
        <div className="island-image image">
          <h1 className="island-title title" id="title">
            { currentIsland.icon ? <span className={ `pt-icon-large ${currentIsland.icon}` } /> : null }
            { currentIsland.name }
          </h1>
          <div id="path" className="island-path path">
            { levelItems }
            { this.buildTestPopover() }
          </div>
        </div>
        { prevIsland ? <IslandLink done={true} width={250} island={prevIsland} description={false} /> : null}
        { /* TODO: RIP OUT THIS CRAPPY 3 BLOCKER AFTER AUGUST (DONE) */}
        { /* TODO2: adding blocker back in for November Beta */}
        { /* TODO3: incremented blocker for December Island */}
        { /* TODO4: incremented blocker for January Island */}

        { nextIsland && Number(nextIsland.ordering) < 8  && this.hasUserCompleted(currentIsland.id) ? <IslandLink next={true} width={250} island={nextIsland} description={false} /> : null}
        { /* nextIsland && this.hasUserCompleted(currentIsland.id) ? <IslandLink next={true} width={250} island={nextIsland} description={false} /> : null */ }
        { otherCodeBlocks.length
          ? <div className="student-codeblocks-container">
            <h2 className="student-codeblocks-title">
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
            <div className="snippets">{otherCodeBlockItemsBeforeFold}</div>
            { otherCodeBlockItemsAfterFold.length
              ? <Collapse isOpen={showMore}><div className="snippets snippets-more">{otherCodeBlockItemsAfterFold}</div></Collapse>
              : null }
            { otherCodeBlockItemsAfterFold.length
              ? <button className="pt-button toggle-show" onClick={this.showMore.bind(this)}><span className={ `pt-icon-standard pt-icon-double-chevron-${ showMore ? "up" : "down" }` } />
                { showMore ? t("Show Less") : t("Show {{x}} More", {x: otherCodeBlockItemsAfterFold.length}) }
              </button>
              : null }
          </div>
          : null }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  islands: state.islands,
  levels: state.levels
});

Level = connect(mapStateToProps)(Level);
export default translate()(Level);
