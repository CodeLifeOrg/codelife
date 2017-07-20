import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import Nav from "components/Nav";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";
import "./Minilesson.css";

class Minilesson extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      minilessons: null,
      currentLesson: null,
      userProgress: null,
      otherSnippets: null,
      currentFrame: null
    };
  }

  componentDidMount() {
    const {lid} = this.props.params;
    const mlget = axios.get(`/api/minilessons?lid=${lid}`);
    const lget = axios.get(`/api/lessons?id=${lid}`);
    const uget = axios.get("/api/userprogress");
    const osget = axios.get(`/api/snippets/othersbylid?lid=${lid}`);

    Promise.all([mlget, lget, uget, osget]).then(resp => {
      this.setState({minilessons: resp[0].data, currentLesson: resp[1].data[0], userProgress: resp[2].data, otherSnippets: resp[3].data});
    });
  }

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

  displaySnippet(snippet) {
    alert(`Make a modal box with: \n\n${snippet.studentcontent}`);
  }

  toggleDialog(i) {
    const k = `isOpen_${i}`;  
    let currentFrame = null;
    if (!this.state[k]) currentFrame = i;
    this.setState({[k]: !this.state[k], didInject: false, currentFrame});
  }

  buildButton(snippet, i) {
    return (
      <div>
        <Button onClick={this.toggleDialog.bind(this, i)} text={`${snippet.username}: ${snippet.snippetname}`} />
        <Dialog
          iconName="inbox"
          isOpen={this.state[`isOpen_${i}`]}
          onClose={this.toggleDialog.bind(this, i)}
          title={`${snippet.username}: ${snippet.snippetname}`}
          lazy={false}
          inline={true}
        >
          <div className="pt-dialog-body">{snippet ? <iframe className="snippetrender" ref={ comp => this.iframes[i] = comp } /> : null}</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button 
                text="Other Button" 
              />
              <Button
                intent={Intent.PRIMARY}
                onClick={this.toggleDialog.bind(this, i)}
                text="Close"
              />
            </div>
          </div>
        </Dialog>   
      </div>
    );
  }

  render() {
    
    const {t} = this.props;
    const {lid} = this.props.params;
    const {minilessons, currentLesson, userProgress, otherSnippets} = this.state;

    if (!currentLesson || !minilessons || !userProgress || !otherSnippets) return <h1>Loading...</h1>;

    const minilessonItems = minilessons.map(minilesson => 
      <li key={minilesson.id}><Link className={userProgress.find(up => up.level === minilesson.id) !== undefined ? "ml_link completed" : "ml_link"} to={`/lesson/${lid}/${minilesson.id}`}>{ minilesson.name }</Link></li>);

    const otherSnippetItems = otherSnippets.map((os, i) => 
      <li>{this.buildButton.bind(this)(os, i)}</li>);

    this.iframes = new Array(otherSnippets.length);

    console.log(this.state.otherSnippets);

    return (
      <div>
        <h1>{currentLesson.name}</h1>
        <p>{currentLesson.description}</p>
        <ul>{minilessonItems}</ul>
        <Link className="editor-link" to={`/editor/${lid}`}>Go to my editor (My Snippet)</Link>
        <br/><br/>
        <strong>Other Snippets</strong>
        <ul>{otherSnippetItems}</ul>
        <Nav />
      </div>
    );
  }
}

Minilesson = connect(state => ({
  user: state.auth.user
}))(Minilesson);
Minilesson = translate()(Minilesson);
export default Minilesson;
