import React, {Component} from "react";
import {translate} from "react-i18next";
import "./About.css";

class About extends Component {
  constructor(props) {
    super(props);
    this.pilotSchools = [
      {name: "TANCREDO DE ALMEIDA NEVES", location: "Santa Luzia, MG", slug: "tancredo-de-almeida-neves", imgs: ["1", "5", "3", "4", "2"]},
      {name: "ENGENHEIRO PRADO LOPES", location: "Belo Horizonte, MG", slug: "engenheiro-prado-lopes", imgs: ["2", "1", "5", "4", "3"]},
      {name: "JOSE BRANDAO", location: "Caeté, MG", slug: "jose-brandao", imgs: ["1", "2", "3", "4", "5"]},
      {name: "SANTA QUITERIA", location: "Esmeraldas, MG", slug: "santa-quiteria", imgs: ["1", "2", "3", "4", "5"]},
      {name: "PROFESSOR HELVECIO DAHE", location: "Ribeirão das Neves, MG", slug: "professor-helvecio-dahe", imgs: ["1", "2"]},
      {name: "ROMUALDO JOSÉ DA COSTA", location: "Ribeirão das Neves, MG", slug: "romualdo-jose-da-costa", imgs: ["1", "2", "3", "4", "5"]},
      {name: "GERALDO TEIXERIA DA COSTA", location: "Santa Luzia, MG", slug: "geraldo-teixeria-da-costa", imgs: ["1"]},
      {name: "ANTONIO MIGUEL CERQUEIRA NETO", location: "Ribeirão das Neves, MG", slug: "antonio-miguel-cerqueira-neto", imgs: ["1"]},
      {name: "CELSO MACHADO", location: "Belo Horizonte, MG", slug: "celso-machado", imgs: ["1"]}
    ];
  }

  render() {
    const {t} = this.props;

    return (
      <div id="about-container">
        <h1>{ t("About") }</h1>
        <p>{ t("aboutP1") }</p>
        <p>{ t("aboutP2") }</p>
        <p>{ t("aboutP3") }</p>
        <p>{ t("aboutP4") }</p>
        <p>{ t("aboutP5") }</p>
      </div>
    );
  }
}

export default translate()(About);
