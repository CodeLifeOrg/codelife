import React, {Component} from "react";
import {translate} from "react-i18next";

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
        <p>{ t("Code School Brazil is a free online resource for high school students in Brazil to learn skills relevant to work in Brazil’s IT sector. The platform’s seed content will focus on teaching basic Javascript.") }</p>
        <p>{ t("Code School Brazil (CSB) aims to be a free web platform where students can learn a variety skills useful for work in Brazil’s IT sector (ex. frontend development, UI design, data visualization). Users of CSB will be able to learn independently from physical classrooms, in order to provide a resource for students who may not otherwise have adequate learning opportunities.") }</p>
        <p>{ t("The primary target audience of the platform MVP are students aged 14-18 in Brazilian public school. Testing will initially focus on students in Greater Belo Horizonte. At minimum all content will be created natively in Portuguese and English and the curriculum will be designed to complement the public education in Brazil") }</p>
        <p>{ t("The platform’s seed curriculum will cover dynamic web development and integrate Brazilian data using the DataViva API.") }</p>
        <p>{ t("In addition to working with students, school administration, teachers and government officials, the platform’s features will be designed with Brazilian businesses to connect students with potential employers.") }</p>
      </div>
    );
  }
}

export default translate()(About);
