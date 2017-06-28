import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "components/App";
import Home from "pages/Home";
import Track from "pages/Track";
import Lesson from "pages/Lesson";
import Topic from "pages/Topic";
import Slide from "pages/Slide";
import Glossary from "pages/Glossary";
import Profile from "pages/Profile";
import Studio from "pages/Studio";
import {Login, SignUp} from "datawheel-canon";

export default function RouteCreate() {

  return (
    <Route path="/" history={browserHistory} component={App}>
      <IndexRoute component={Home} />
      <Route path="signup" component={SignUp} />
      <Route path="login" component={Login} />
      <Route path="track" component={Track} />
      <Route path="track/:trid" component={Topic} />
      <Route path="track/:trid/:tid" component={Lesson} />
      <Route path="track/:trid/:tid/:lid/:sid" component={Slide} />
      <Route path="glossary" component={Glossary} />
      <Route path="profile" component={Profile} />
      <Route path="studio" component={Studio} />
    </Route>
  );
}
