import React, {Component} from "react";

class CloudDiagonalExponential extends Component {
  render() {
    return (
      <svg className="cloud-diagonal-exponential" width="1280" height="616" viewBox="0 0 1280 616" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <path d="M-42 807h1364v565.52c0 27.82-22.553 50.373-50.373 50.373-27.82 0-50.373-22.553-50.373-50.373-27.82 0-50.373-22.553-50.373-50.373 0-1.471.063-2.927.187-4.366-7.93 2.827-16.472 4.366-25.373 4.366-36.003 0-66.125-25.181-73.715-58.891-8.015 5.38-17.66 8.518-28.038 8.518-19.969 0-37.224-11.62-45.373-28.467-9.083 8.885-21.513 14.363-35.223 14.363-21.843 0-40.439-13.903-47.421-33.342-10.265 5.216-21.88 8.156-34.183 8.156-37.737 0-69.013-27.665-74.653-63.82-8.858 7.746-20.453 12.44-33.145 12.44-25.386 0-46.386-18.779-49.866-43.203-8.932 8.067-20.769 12.98-33.752 12.98-27.474 0-49.811-21.995-50.362-49.337-4.823 2.32-10.101 3.905-15.709 4.594-27.613 3.39-52.746-16.246-56.136-43.858-27.613 3.39-52.746-16.246-56.136-43.858-.179-1.46-.294-2.913-.347-4.356-7.527 3.772-15.817 6.341-24.652 7.425-35.735 4.388-68.701-16.934-80.342-49.469-7.299 6.316-16.49 10.607-26.791 11.872-19.82 2.434-38.363-6.997-48.504-22.725-7.932 9.926-19.603 16.877-33.21 18.548-21.68 2.662-41.832-8.871-51.131-27.315-9.552 6.428-20.723 10.762-32.934 12.261-37.456 4.599-71.87-19.048-81.874-54.247-7.848 8.768-18.785 14.84-31.382 16.387-25.197 3.094-48.329-12.986-54.76-36.804-7.882 9.096-19.032 15.414-31.919 16.996-27.613 3.39-52.746-16.246-56.136-43.858v-56.136z" id="a" />
          <filter x="-.9%" y="-2%" width="101.8%" height="104.1%" filterUnits="objectBoundingBox" id="b">
            <feGaussianBlur stdDeviation="6.5" in="SourceAlpha" result="shadowBlurInner1"/>
            <feOffset dy="-12" in="shadowBlurInner1" result="shadowOffsetInner1"/>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"/>
            <feColorMatrix values="0 0 0 0 0.341176471 0 0 0 0 1 0 0 0 0 0.933333333 0 0 0 0.15 0" in="shadowInnerInner1"/>
          </filter>
        </defs>
        <g transform="translate(0 -807)" fill="none">
          <use fill="#fff" xlinkHref="#a" />
          <use fill="#000" filter="url(#b)" xlinkHref="#a"/>
        </g>
        {/* fallback/hack */}
        <image src="/clouds/cloud-diagonal-exponential.png" xlinkHref="" />
      </svg>
    );
  }
}

export default CloudDiagonalExponential;
