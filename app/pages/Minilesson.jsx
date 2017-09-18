import axios from "axios";
import {connect} from "react-redux";
import {browserHistory, Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent, Popover, Position, Tooltip, Collapse, PopoverInteractionKind} from "@blueprintjs/core";
import CodeBlock from "components/CodeBlock";
import CodeBlockCard from "components/CodeBlockCard";
import IslandLink from "components/IslandLink";

import "./Minilesson.css";

import gemIcon from "icons/gem.svg";

import Loading from "components/Loading";

class Minilesson extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minilessons: null,
      currentLesson: null,
      nextLesson: null,
      prevLesson: null,
      userProgress: null,
      mySnippets: null,
      likedSnippets: null,
      loading: false,
      unlikedSnippets: null,
      testOpen: false,
      winOpen: false,
      winMessage: "",
      firstWin: false,
      showMore: false
    };
  }

  loadFromDB() {
    const {params, t} = this.props;
    const {lid} = params;
    const mlget = axios.get(`/api/minilessons?lid=${lid}`);
    // const lget = axios.get(`/api/lessons?id=${lid}`);
    const lget = axios.get("/api/lessons");
    const uget = axios.get("/api/userprogress");
    const osget = axios.get(`/api/snippets/allbylid?lid=${lid}`);
    const lkget = axios.get("/api/likes");

    Promise.all([mlget, lget, uget, osget, lkget]).then(resp => {
      const minilessons = resp[0].data;
      const lessons = resp[1].data;
      const userProgress = resp[2].data;
      const allSnippets = resp[3].data;
      const likes = resp[4].data;

      const currentLesson = lessons.find(l => l.id === lid);
      // TODO: after august test, change this from index to a new ordering field
      // ALSO: add an exception for level 10.
      const nextOrdering = Number(currentLesson.index) + 1;
      const nextLesson = lessons.find(l => Number(l.index) === Number(nextOrdering));
      const prevOrdering = Number(currentLesson.index) - 1;
      const prevLesson = lessons.find(l => Number(l.index) === Number(prevOrdering));

      const mySnippets = [];
      const likedSnippets = [];
      const unlikedSnippets = [];

      currentLesson.snippet = null;

      minilessons.sort((a, b) => a.ordering - b.ordering);
      allSnippets.sort((a, b) => b.likes - a.likes || b.id - a.id);
      // Fold over snippets and separate them into mine and others
      for (const s of allSnippets) {
        s.likes = Number(s.likes);
        if (s.uid === this.props.auth.user.id) {
          s.username = t("you!");
          s.mine = true;
          currentLesson.snippet = s;
          if (likes.find(l => l.likeid === s.id)) s.liked = true;
          mySnippets.push(s);
        }
        else {
          // TODO: do this in a database join, not here.
          if (likes.find(l => l.likeid === s.id)) {
            s.liked = true;
            likedSnippets.push(s);
          }
          else {
            s.liked = false;
            unlikedSnippets.push(s);
          }
        }
      }

      this.setState({minilessons, currentLesson, nextLesson, prevLesson, userProgress, mySnippets, likedSnippets, unlikedSnippets, loading: false});
    });
  }

  componentDidUpdate() {
    const {location} = this.props;
    const {currentLesson, loading} = this.state;
    if (!loading && !currentLesson || currentLesson && currentLesson.id !== location.pathname.split("/")[2]) {
      this.setState({currentLesson: null, minilessons: null, userProgress: null, loading: true}, this.loadFromDB);
      // this.loadFromDB();
    }
  }

  componentDidMount() {
    this.forceUpdate();
  }

  toggleTest() {
    this.setState({testOpen: !this.state.testOpen});

    /*
    // If I'm about to close the test successfully for the first time
    if (this.state.testOpen && this.state.firstWin) {
      this.setState({winOpen: true, firstWin: false, testOpen: !this.state.testOpen});
    }
    else {
      this.setState({testOpen: !this.state.testOpen});
    }
    */

  }

  handleSave(newsnippet) {
    // TODO: i think i hate this.  when CodeBlock saves, I need to change the state of the snippet
    // so that subsequent opens will reflect the newly saved code.  In a perfect world, a CodeBlock save would
    // reload the updated snippet freshly from the database, but I also want to minimize db hits.  revisit this.
    const {currentLesson} = this.state;
    if (!currentLesson.snippet) currentLesson.snippet = newsnippet;
    this.setState(currentLesson);
  }

  onFirstCompletion() {
    // TODO: i'm reloading everything here because after the first completion, we need to
    // unlock all codeblocks AND show your brand-new written one at the top of the list.
    // perhaps revisit if this is on the heavy DB-interaction side?
    this.loadFromDB();
    const winMessage = this.state.currentLesson.victory;
    this.setState({firstWin: true, winMessage, testOpen: false, winOpen: true});
  }

  closeOverlay() {
    // this.setState({winOpen: false});
    // TODO: take out island 4 catcher after august
    if (this.state.nextLesson && this.state.nextLesson.id && this.state.nextLesson.id !== "island-4") {
      window.location = `/lesson/${this.state.nextLesson.id}`;
    }
    else {
      this.setState({winOpen: false});
    }
  }

  hasUserCompleted(milestone) {
    return this.state.userProgress.find(up => up.level === milestone) !== undefined;
  }

  reportLike(codeBlock) {
    const likedSnippets = this.state.likedSnippets.slice(0);
    const unlikedSnippets = this.state.unlikedSnippets.slice(0);
    if (codeBlock.mine) return;
    if (codeBlock.liked) {
      likedSnippets.push(codeBlock);
      unlikedSnippets.splice(unlikedSnippets.map(s => s.id).indexOf(codeBlock.id), 1);
    }
    else {
      unlikedSnippets.push(codeBlock);
      likedSnippets.splice(likedSnippets.map(s => s.id).indexOf(codeBlock.id), 1);
    }
    likedSnippets.sort((a, b) => b.likes - a.likes || b.id - a.id);
    unlikedSnippets.sort((a, b) => b.likes - a.likes || b.id - a.id);
    this.setState({likedSnippets, unlikedSnippets});
  }

  allMinilessonsBeaten() {
    const {minilessons} = this.state;
    let missedlessons = 0;
    for (const m of minilessons) {
      if (!this.hasUserCompleted(m.id)) missedlessons++;
    }
    return missedlessons === 0;
  }

  promptFinalTest() {
    return this.allMinilessonsBeaten() && !this.state.currentLesson.snippet;
  }

  showMore() {
    this.setState({showMore: !this.state.showMore});
  }

  buildWinPopover() {

    const {t} = this.props;
    const {id, name, theme} = this.state.currentLesson;

    return (
      <Dialog
        className={ theme }
        isOpen={this.state.winOpen}
        onClose={this.closeOverlay.bind(this)}
        title={ t("{{island}} Complete", {island: name}) }
      >
        <div className="pt-dialog-body">
          <div className="island-icon" style={{backgroundImage: `url('/islands/${id}-small.png')`}} />
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
    const {currentLesson} = this.state;
    let title = t("myCodeblock", {islandName: currentLesson.name});
    if (currentLesson.snippet) title = currentLesson.snippet.snippetname;

    if (!this.allMinilessonsBeaten()) {
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
        <Tooltip isOpen={ next ? true : undefined } position={ next ? Position.BOTTOM : Position.TOP } content={ next ? t("Earn your CodeBlock") : t("CodeBlock") } tooltipClassName={ currentLesson.theme }>
          <div className={ `code-block ${ next ? "next" : "done" }` } onClick={this.toggleTest.bind(this)}>
            <div className="side bottom"></div>
            <div className="side top"></div>
            <div className="side left"></div>
            <div className="side front"><span className={ `pt-icon-standard pt-icon-${ next ? "help" : "code-block" }` }></span></div>
          </div>
        </Tooltip>
        <Dialog
          className={ `codeBlock ${ currentLesson.theme }` }
          isOpen={this.state.testOpen}
          onClose={this.toggleTest.bind(this)}
          title={ title }
          style={{
            height: "80vh",
            maxHeight: "1000px",
            width: "90%"
          }}
        >
          <div className="pt-dialog-body">
            <CodeBlock
              lesson={currentLesson}
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
    const {minilessons, currentLesson, nextLesson, prevLesson, userProgress, mySnippets, likedSnippets, unlikedSnippets, showMore} = this.state;

    if (!auth.user) browserHistory.push("/login");
    if (!currentLesson || !minilessons || !userProgress) return <Loading />;

    const islandDone = this.hasUserCompleted(this.props.params.lid);
    const otherSnippets = mySnippets.concat(likedSnippets, unlikedSnippets);

    // Clone minilessons as to not mess with state
    const minilessonStatuses = minilessons.slice(0);
    for (let m = 0; m < minilessonStatuses.length; m++) {
      const done = this.hasUserCompleted(minilessonStatuses[m].id);
      minilessonStatuses[m].isDone = done;
      // If i'm the first lesson and i'm not done, i'm next lesson
      // If i'm past the first lesson and i'm not done but my previous one is, i'm the next lesson
      minilessonStatuses[m].isNext = m === 0 && !done || m > 0 && !done && minilessonStatuses[m - 1].isDone;
    }

    const otherSnippetItemsBeforeFold = [];
    const otherSnippetItemsAfterFold = [];
    let top = 4;
    for (const os of otherSnippets) {
      const cbc = <CodeBlockCard theme={currentLesson.theme} codeBlock={os} userProgress={userProgress} reportLike={this.reportLike.bind(this)}/>;
      top > 0 ? otherSnippetItemsBeforeFold.push(cbc) : otherSnippetItemsAfterFold.push(cbc);
      top--;
    }

    const minilessonItems = minilessonStatuses.map(minilesson => {
      const {lid} = this.props.params;
      if (minilesson.isDone) {
        const up = userProgress.find(p => p.level === minilesson.id);
        const gems = up ? up.gems : 0;
        // const gemCount = gems > 1 ? `${gems} Gems` : `${gems} Gem`;
        return <Popover
          interactionKind={PopoverInteractionKind.HOVER}
          popoverClassName={ `stepPopover pt-popover pt-tooltip ${ currentLesson.theme }` }
          position={Position.TOP}
        >
          <Link className="stop done" to={`/lesson/${lid}/${minilesson.id}`}></Link>
          <span>
            {minilesson.name}
            <div className="gems"><img src={gemIcon} />{t("Gems")}: {gems}</div>
          </span>
        </Popover>;
        // return <Tooltip position={ Position.TOP } content={ `${minilesson.name} - ${gemCount} ` } tooltipClassName={ currentLesson.id }>
        //   <Link className="stop done" to={`/lesson/${lid}/${minilesson.id}`}></Link>
        // </Tooltip>;
      }
      else if (minilesson.isNext) {
        return <Tooltip isOpen={true} position={ Position.BOTTOM } content={ minilesson.name } tooltipClassName={ currentLesson.theme }>
          <Link className="stop next" to={`/lesson/${lid}/${minilesson.id}`}></Link>
        </Tooltip>;
      }
      return <div className="stop"></div>;
    });

    return (
      <div id="island" className={ currentLesson.theme }>
        { this.buildWinPopover() }
        <div className="image">
          <h1 className="title">{ currentLesson.name }</h1>
          <p className="description">{ currentLesson.description }</p>
          <div id="path">
            { minilessonItems }
            { this.buildTestPopover() }
          </div>
        </div>
        { prevLesson ? <IslandLink done={true} width={250} lesson={prevLesson} description={false} /> : null}
        { /* TODO: RIP OUT THIS CRAPPY 3 BLOCKER AFTER AUGUST */}
        { nextLesson && Number(nextLesson.index) < 3  && this.hasUserCompleted(currentLesson.id) ? <IslandLink next={true} width={250} lesson={nextLesson} description={false} /> : null}
        { otherSnippets.length
        ? <div>
            <h2 className="title">
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
            <div className="snippets">{otherSnippetItemsBeforeFold}</div>
            { otherSnippetItemsAfterFold.length
            ? <Collapse isOpen={showMore}><div className="snippets snippets-more">{otherSnippetItemsAfterFold}</div></Collapse>
            : null }
            { otherSnippetItemsAfterFold.length
            ? <div className="toggle-show" onClick={this.showMore.bind(this)}><span className={ `pt-icon-standard pt-icon-double-chevron-${ showMore ? "up" : "down" }` } />
                { showMore ? t("Show Less") : t("Show {{x}} More", {x: otherSnippetItemsAfterFold.length}) }
              </div>
            : null }
          </div>
        : null }
      </div>
    );
  }
}

Minilesson = connect(state => ({
  auth: state.auth
}))(Minilesson);
Minilesson = translate()(Minilesson);
export default Minilesson;
