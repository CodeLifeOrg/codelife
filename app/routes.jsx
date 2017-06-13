import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "components/App";
import Home from "pages/Home";
import Lesson from "pages/Lesson";
import Topic from "pages/Topic";
import Slide from "pages/Slide";
import Glossary from "pages/Glossary";
import Profile from "pages/Profile";

export default function RouteCreate() {

  return (
    <Route path="/" history={browserHistory} component={App}>
      <IndexRoute component={Home} />
      <Route path="topic" component={Topic} />
      <Route path="topic/:tid" component={Lesson} />
      <Route path="topic/:tid/:lid/:sid" component={Slide} />
      <Route path="glossary" component={Glossary} />
      <Route path="profile" component={Profile} />
    </Route>
  );
}
