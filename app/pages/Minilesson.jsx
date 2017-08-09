import axios from "axios";
import {connect} from "react-redux";
import {browserHistory, Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent, Popover, Position, Tooltip, Collapse, PopoverInteractionKind} from "@blueprintjs/core";
import CodeBlock from "components/CodeBlock";
import CodeBlockCard from "components/CodeBlockCard";

import "./Minilesson.css";

// import gemIcon from "icons/gem.svg";

import Loading from "components/Loading";

class Minilesson extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minilessons: null,
      currentLesson: null,
      userProgress: null,
      otherSnippets: null,
      currentFrame: null,
      testOpen: false,
      winOpen: false,
      winMessage: "",
      firstWin: false,
      showMore: false
    };
  }

  componentDidMount() {
    this.loadFromDB();
  }

  loadFromDB() {
    const {params, t} = this.props;
    const {lid} = params;
    const mlget = axios.get(`/api/minilessons?lid=${lid}`);
    const lget = axios.get(`/api/lessons?id=${lid}`);
    const uget = axios.get("/api/userprogress");
    const osget = axios.get(`/api/snippets/allbylid?lid=${lid}`);

    Promise.all([mlget, lget, uget, osget]).then(resp => {
      const minilessons = resp[0].data;
      const currentLesson = resp[1].data[0];
      const userProgress = resp[2].data;
      const allSnippets = resp[3].data;
      const otherSnippets = [];
      let mySnippet = null;
      // Fold over snippets and separate them into mine and others
      for (const s of allSnippets) {
        s.uid === this.props.auth.user.id ? mySnippet = s : otherSnippets.push(s);
      }
      otherSnippets.sort((a, b) => b.likes - a.likes);
      let top = 3;
      for (const os of otherSnippets) {
        os.starred = top > 0;
        top--;
      }
      if (mySnippet) {
        mySnippet.username = t("you!");
        otherSnippets.unshift(mySnippet);
      }
      currentLesson.snippet = mySnippet;

      minilessons.sort((a, b) => a.ordering - b.ordering);

      this.setState({minilessons, currentLesson, userProgress, otherSnippets});
    });
  }

  // TODO: I think iframes are dead and can be removed
  componentDidUpdate() {
    if (this.iframes && this.iframes[this.state.currentFrame] && !this.state.didInject) {
      const {otherSnippets} = this.state;
      const doc = this.iframes[this.state.currentFrame].contentWindow.document;
      doc.open();
      doc.write(otherSnippets[this.state.currentFrame].studentcontent);
      doc.close();
      this.setState({didInject: true});
    }
  }

  toggleTest() {
    // If I'm about to close the test successfully for the first time
    if (this.state.testOpen && this.state.firstWin) {
      this.setState({winOpen: true, firstWin: false, testOpen: !this.state.testOpen});
    }
    else {
      this.setState({testOpen: !this.state.testOpen});
    }

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
    this.setState({firstWin: true, winMessage});
  }

  closeOverlay() {
    this.setState({winOpen: false});
  }

  hasUserCompleted(milestone) {
    return this.state.userProgress.find(up => up.level === milestone) !== undefined;
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
    return (
      <Dialog
        iconName="endorsed"
        isOpen={this.state.winOpen}
        onClose={this.closeOverlay.bind(this)}
        title={t("Great Job!")}
      >
        <div className="pt-dialog-body">
          {this.state.winMessage}
        </div>
        <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
                <Button
                    intent={Intent.PRIMARY}
                    onClick={this.closeOverlay.bind(this)}
                    text={t("Great!")}
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

    if (!this.allMinilessonsBeaten()) return <div className="stop"></div>;

    return (
      <div className="editor-popover">
        <Tooltip content={t("Earn your Codeblock")} tooltipClassName={ currentLesson.id }>
          <div className="code-block" onClick={this.toggleTest.bind(this)}>
            <div className="side bottom"></div>
            <div className="side top" style={{backgroundColor: this.promptFinalTest() ? "yellow" : "grey"}}></div>
            <div className="side left" style={{backgroundColor: this.promptFinalTest() ? "yellow" : "grey"}}></div>
            <div className="side front"><span className="pt-icon-standard pt-icon-code-block"></span></div>
          </div>
        </Tooltip>
        <Dialog
          className={ `codeBlock ${ currentLesson.id }` }
          isOpen={this.state.testOpen}
          onClose={this.toggleTest.bind(this)}
          title={ title }
          style={{
            height: "80vh",
            maxHeight: "1000px",
            maxWidth: "1200px",
            width: "95%"
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
    const {minilessons, currentLesson, userProgress, otherSnippets} = this.state;

    if (!auth.user) browserHistory.push("/login");
    if (!currentLesson || !minilessons || !userProgress || !otherSnippets) return <Loading />;

    const islandDone = this.hasUserCompleted(this.props.params.lid);

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
    let top = 5;
    for (const os of otherSnippets) {
      const cbc = <CodeBlockCard codeBlock={os} userProgress={userProgress} />;
      top > 0 ? otherSnippetItemsBeforeFold.push(cbc) : otherSnippetItemsAfterFold.push(cbc);
      top--;
    }

    const minilessonItems = minilessonStatuses.map(minilesson => {
      const {lid} = this.props.params;
      if (minilesson.isDone) {
        const up = userProgress.find(p => p.level === minilesson.id);
        const gems = up ? up.gems : 0;
        const gemCount = gems > 1 ? `${gems} Gems` : `${gems} Gem`;
        return <Tooltip position={ Position.TOP } content={ `${minilesson.name} - ${gemCount} ` } tooltipClassName={ currentLesson.id }>
          <Link className="stop done" to={`/lesson/${lid}/${minilesson.id}`}></Link>
        </Tooltip>;
      }
      else if (minilesson.isNext) {
        return <Tooltip isOpen={true} position={ Position.BOTTOM } content={ minilesson.name } tooltipClassName={ currentLesson.id }>
          <Link className="stop next" to={`/lesson/${lid}/${minilesson.id}`}></Link>
        </Tooltip>;
      }
      return <div className="stop"></div>;
    });

    this.iframes = new Array(otherSnippets.length);

    return (
      <div id="island" className={ currentLesson.id }>
        { this.buildWinPopover() }
        <div className="image">
          <h1 className="title">{ currentLesson.name }</h1>
          <p className="description">{ currentLesson.description }</p>
          <div id="path">
            { minilessonItems }
            { this.buildTestPopover() }
          </div>
        </div>
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
            <div className="snippets">
              {otherSnippetItemsBeforeFold}
              <Button onClick={this.showMore.bind(this)}>{this.state.showMore ? t("Show Less") : t("Show More")}</Button>
              <Collapse isOpen={this.state.showMore}><div className="snippets">{otherSnippetItemsAfterFold}</div></Collapse>
            </div>
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
