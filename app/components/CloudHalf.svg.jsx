import React, {Component} from "react";

class CloudHalf extends Component {
  render() {
    return (
      <svg className="cloud-half" width="640" height="340" viewBox="0 0 640 320" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
          <path d="M640 326.635h-640v-326.635c28.187 0 51.037 22.85 51.037 51.037 28.187 0 51.037 22.85 51.037 51.037 0 1.49-.064 2.965-.189 4.423 8.035-2.864 16.689-4.423 25.707-4.423 36.478 0 66.996 25.512 74.686 59.667 8.12-5.451 17.893-8.631 28.408-8.631 20.232 0 37.715 11.773 45.971 28.842 9.202-9.003 21.797-14.552 35.688-14.552 22.131 0 40.972 14.086 48.046 33.782 10.4-5.285 22.169-8.264 34.633-8.264 38.235 0 69.923 28.03 75.637 64.661 8.975-7.848 20.723-12.604 33.582-12.604 25.721 0 46.998 19.027 50.524 43.773 9.05-8.174 21.042-13.151 34.197-13.151 28.187 0 51.037 22.85 51.037 51.037z" id="b"/>
          <filter x="-3%" y="-9.6%" width="106.4%" height="112.9%" filterUnits="objectBoundingBox" id="a">
            <feOffset dx="1" dy="-11" in="SourceAlpha" result="shadowOffsetOuter1"/>
            <feGaussianBlur stdDeviation="5" in="shadowOffsetOuter1" result="shadowBlurOuter1"/>
            <feColorMatrix values="0 0 0 0 0.341176471 0 0 0 0 1 0 0 0 0 0.933333333 0 0 0 0.2 0" in="shadowBlurOuter1"/>
          </filter>
          <filter x="-3.4%" y="-10.3%" width="107%" height="114.1%" filterUnits="objectBoundingBox" id="c">
            <feGaussianBlur stdDeviation="6.5" in="SourceAlpha" result="shadowBlurInner1"/>
            <feOffset dx="-8" dy="12" in="shadowBlurInner1" result="shadowOffsetInner1"/>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"/>
            <feColorMatrix values="0 0 0 0 0.341176471 0 0 0 0 1 0 0 0 0 0.933333333 0 0 0 0.15 0" in="shadowInnerInner1"/>
          </filter>
        </defs>
        <g fill="none">
          <use fill="#000" filter="url(#a)" xlinkHref="#b"/>
          <use fill="#fff" xlinkHref="#b"/>
          <use fill="#000" filter="url(#c)" xlinkHref="#b"/>
        </g>
        {/* fallback/hack */}
        <image src="/clouds/cloud-half.png" xlinkHref="" />
      </svg>
    );
  }
}

export default CloudHalf;
