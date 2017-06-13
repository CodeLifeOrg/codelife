import React from "react";
import {Route, IndexRoute} from "react-router";

import App from "components/App";
import Home from "pages/Home";
import Lesson from "pages/Lesson";
import Topic from "pages/Topic";
import Glossary from "pages/Glossary";
import Profile from "pages/Profile";

export default function RouteCreate() {

  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="lesson" component={Lesson} />
      <Route path="lesson/:id" component={Topic} />
      <Route path="glossary" component={Glossary} />
      <Route path="profile" component={Profile} />
    </Route>
  );
}