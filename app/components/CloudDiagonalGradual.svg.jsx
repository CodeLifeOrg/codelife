import React, {Component} from "react";

class CloudDiagonalGradual extends Component {
  render() {
    return (
      <svg className="cloud-diagonal-gradual" width="1280" height="295" viewBox="0 0 1280 295" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <path d="M-8 1411.786c24.443-4.31 47.891 9.503 56.557 31.786 7.395-8.349 17.559-14.35 29.396-16.438 16.201-2.857 31.965 2.248 43.277 12.504 9.621-7.574 21.198-12.949 34.101-15.224 36.06-6.358 70.675 13.578 84.174 46.036 7.094-6.887 16.255-11.795 26.725-13.642 19.931-3.514 39.2 5.021 50.333 20.372 7.52-10.384 18.927-17.97 32.55-20.372 21.898-3.861 42.996 6.822 53.383 25.11 9.44-7.208 20.7-12.324 33.204-14.529 37.483-6.609 73.403 15.192 85.671 49.934 7.463-8.922 17.992-15.361 30.344-17.539 25.376-4.474 49.677 10.583 57.483 34.372 7.513-9.69 18.513-16.726 31.539-19.023 23.954-4.224 46.952 8.957 56.019 30.459 11.259-14.291 27.613-24.655 46.94-28.063 36.06-6.358 70.675 13.578 84.174 46.036 7.094-6.887 16.255-11.795 26.725-13.642 19.931-3.514 39.2 5.021 50.333 20.372 7.52-10.384 18.927-17.97 32.55-20.372 21.682-3.823 42.58 6.613 53.073 24.572 9.292-6.924 20.3-11.841 32.49-13.991 37.798-6.665 74.007 15.56 85.975 50.813 7.498-9.377 18.309-16.169 31.063-18.418 25.633-4.52 50.17 10.89 57.715 35.098 7.507-9.536 18.414-16.453 31.307-18.726 27.827-4.907 54.362 13.674 59.269 41.501.836 4.74.843 23.047.022 54.921h-1296.39v-293.908z" id="a"/>
          <filter x="-1%" y="-4.2%" width="101.9%" height="108.5%" filterUnits="objectBoundingBox" id="b">
            <feGaussianBlur stdDeviation="6.5" in="SourceAlpha" result="shadowBlurInner1" />
            <feOffset dy="12" in="shadowBlurInner1" result="shadowOffsetInner1"/>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"/>
            <feColorMatrix values="0 0 0 0 0.341176471 0 0 0 0 1 0 0 0 0 0.933333333 0 0 0 0.15 0" in="shadowInnerInner1"/>
          </filter>
        </defs>
        <g transform="translate(0 -1411)" fill="none">
          <use fill="#fff" xlinkHref="#a"/>
          <use fill="#000" filter="url(#b)" xlinkHref="#a"/>
        </g>
        {/* fallback/hack */}
        <image src="/clouds/cloud-diagonal-gradual.png" xlinkHref="" />
      </svg>
    );
  }
}

export default CloudDiagonalGradual;
