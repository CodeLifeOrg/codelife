import React, {Component} from "react";
import {translate} from "react-i18next";
import {Tab2, Tabs2} from "@blueprintjs/core";
import "./About.css";

import PhotoSlide from "components/PhotoSlide";

const schools = [
  {name: "TANCREDO DE ALMEIDA NEVES", location: "Santa Luzia, MG", slug: "tancredo-de-almeida-neves", photos: ["1", "5", "3", "4", "2"]},
  {name: "ENGENHEIRO PRADO LOPES", location: "Belo Horizonte, MG", slug: "engenheiro-prado-lopes", photos: ["2", "1", "5", "4", "3"]},
  {name: "JOSE BRANDAO", location: "Caeté, MG", slug: "jose-brandao", photos: ["1", "2", "3", "4", "5"]},
  {name: "SANTA QUITERIA", location: "Esmeraldas, MG", slug: "santa-quiteria", photos: ["1", "2", "3", "4", "5"]},
  {name: "PROFESSOR HELVECIO DAHE", location: "Ribeirão das Neves, MG", slug: "professor-helvecio-dahe", photos: ["1", "2"]},
  {name: "ROMUALDO JOSÉ DA COSTA", location: "Ribeirão das Neves, MG", slug: "romualdo-jose-da-costa", photos: ["1", "2", "3", "4", "5"]},
  {name: "GERALDO TEIXERIA DA COSTA", location: "Santa Luzia, MG", slug: "geraldo-teixeria-da-costa", photos: ["1"]},
  {name: "ANTONIO MIGUEL CERQUEIRA NETO", location: "Ribeirão das Neves, MG", slug: "antonio-miguel-cerqueira-neto", photos: ["1"]},
  {name: "CELSO MACHADO", location: "Belo Horizonte, MG", slug: "celso-machado", photos: ["1"]}
];

class About extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTabId: "tancredo-de-almeida-neves"
    };
  }

  handleTabChange(activeTabId) {
    this.setState({activeTabId});
  }

  render() {
    const {t} = this.props;
    const {activeTabId} = this.state;

    const showStudents = false;

    return (
      <div id="about-container">

        <h1>{ t("About") }</h1>

        <p>{ t("splashP1") }</p>
        <p>{ t("aboutP1") }</p>
        <p>{ t("aboutP2") }</p>
        <p>{ t("aboutP3") }</p>
        <p>{ t("aboutP4") }</p>
        <p>{ t("aboutP5") }</p>
        <p>{ t("splashP2") }</p>

        { showStudents ? <Tabs2 className="about-photos" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
          { schools.map((s, i) => <Tab2 key={i} id={ s.slug } title={ i + 1 } panel={ <PhotoSlide {...s} /> } />) }
        </Tabs2> : null }
      </div>
    );
  }
}

export default translate()(About);
