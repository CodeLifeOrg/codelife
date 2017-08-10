import React, {Component} from "react";
import {translate} from "react-i18next";

class Privacy extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {t} = this.props;

    return (
      <div id="about-container">
        <h1>{ t("Privacy Policy") }</h1>
        <section>
          <p>{ t("privacy.notice.p1") }</p>
          <ol>
            <li>{ t("privacy.notice.li1") }</li>
            <li>{ t("privacy.notice.li2") }</li>
            <li>{ t("privacy.notice.li3") }</li>
            <li>{ t("privacy.notice.li4") }</li>
          </ol>
        </section>
        <section>
          <h2>{ t("privacy.info.title") }</h2>
          <p>{ t("privacy.info.p1") }</p>
          <p>{ t("privacy.info.p2") }</p>
          <p>{ t("privacy.info.p3") }</p>
        </section>
        <section>
          <h2>{ t("privacy.access.title") }</h2>
          <p>{ t("privacy.access.p1") }</p>
          <ul>
            <li>{ t("privacy.access.li1") }</li>
            <li>{ t("privacy.access.li2") }</li>
            <li>{ t("privacy.access.li3") }</li>
            <li>{ t("privacy.access.li4") }</li>
          </ul>
        </section>
        <section>
          <h2>{ t("privacy.security.title") }</h2>
          <p>{ t("privacy.security.p1") }</p>
          <p>{ t("privacy.security.p2") }</p>
          <p>{ t("privacy.security.p3") }</p>
        </section>
        <section>
          <h2>{ t("privacy.registration.title") }</h2>
          <p>{ t("privacy.registration.p1") }</p>
        </section>
        <section>
          <h2>{ t("privacy.cookies.title") }</h2>
          <p>{ t("privacy.cookies.p1") }</p>
        </section>
        <section>
          <h2>{ t("privacy.links.title") }</h2>
          <p>{ t("privacy.links.p1") }</p>
        </section>
        <section>
          <p><strong>{ t("privacy.footer.p1") }</strong></p>
        </section>
      </div>
    );
  }
}

export default translate()(Privacy);
