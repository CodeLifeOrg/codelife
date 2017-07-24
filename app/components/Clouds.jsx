import React, {Component} from "react";
import {prefix} from "d3plus-common";
import {scaleLinear} from "d3-scale";
import "./Clouds.css";

export default class Clouds extends Component {

  componentDidMount() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const p = prefix();

    const backX = scaleLinear().domain([0, w]).range([4, -4]);
    const backY = scaleLinear().domain([0, h]).range([3, -3]);

    const midX = scaleLinear().domain([0, w]).range([6, -6]);
    const midY = scaleLinear().domain([0, h]).range([6, -6]);

    const frontX = scaleLinear().domain([0, w]).range([8, -8]);
    const frontY = scaleLinear().domain([0, h]).range([9, -9]);

    document.body.addEventListener("mousemove", e => {

      const sX = e.clientX;
      const sY = e.clientY;

      if (this.cloud8) {

        this.cloud8.style[`${p}transform`] = `translate3d(${backX(sX)}px, ${backY(sY)}px, 0px)`;
        this.cloud7.style[`${p}transform`] = `translate3d(${backX(sX)}px, ${backY(sY)}px, 0px)`;
        this.cloud4.style[`${p}transform`] = `translate3d(${backX(sX)}px, ${backY(sY)}px, 0px)`;

        this.cloud1.style[`${p}transform`] = `translate3d(${midX(sX)}px, ${midY(sY)}px, 0px)`;
        this.cloud5.style[`${p}transform`] = `translate3d(${midX(sX)}px, ${midY(sY)}px, 0px)`;

        this.cloud2.style[`${p}transform`] = `translate3d(${frontX(sX)}px, ${frontY(sY)}px, 0px)`;
        this.cloud3.style[`${p}transform`] = `translate3d(${frontX(sX)}px, ${frontY(sY)}px, 0px)`;
        this.cloud6.style[`${p}transform`] = `translate3d(${frontX(sX)}px, ${frontY(sY)}px, 0px)`;

      }

    });

  }

  render() {

    return (
      <div id="clouds">
        <div className="cloud" ref={ comp => this.cloud8 = comp } id="cloud8"></div>
        <div className="cloud" ref={ comp => this.cloud7 = comp } id="cloud7"></div>
        <div className="cloud" ref={ comp => this.cloud4 = comp } id="cloud4"></div>

        <div className="cloud" ref={ comp => this.cloud1 = comp } id="cloud1"></div>
        <div className="cloud" ref={ comp => this.cloud5 = comp } id="cloud5"></div>

        <div className="cloud" ref={ comp => this.cloud2 = comp } id="cloud2"></div>
        <div className="cloud" ref={ comp => this.cloud3 = comp } id="cloud3"></div>
        <div className="cloud" ref={ comp => this.cloud6 = comp } id="cloud6"></div>

      </div>
    );
  }
}
