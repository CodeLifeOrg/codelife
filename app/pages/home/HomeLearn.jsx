import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import "./HomeLearn.css";

class HomeLearn extends Component {

  render() {
    const {t} = this.props;

    return (
      <figure className="content-section learn-section">

        <div className="learn-figure">
          <img className="learn-img"
            src="/home/what-youll-learn.png"
            srcSet="/home/what-youll-learn.png 1x,
                    /home/what-youll-learn@2x.png 2x"
            alt=""/>
        </div>

        <figcaption className="learn-caption">
          <h2 className="learn-heading font-xl">{ t("Home.LearnHeading") }</h2>

          <ul className="learn-list font-md">
            <li className="learn-list-item">{ t("Home.LearnItem1") }</li>
            <li className="learn-list-item">{ t("Home.LearnItem2") }</li>
            <li className="learn-list-item">{ t("Home.LearnItem3") }</li>
            <li className="learn-list-item">{ t("Home.LearnItem4") }</li>
            <li className="learn-list-item">{ t("Home.LearnItem5") }</li>
          </ul>

          {/* lessonplan link */}
          <Link to="lessonplan" className="authform-button pt-button pt-intent-primary font-md">
            {t("Lesson plan")}
          </Link>
        </figcaption>
      </figure>
    );
  }
}

export default translate()(HomeLearn);
