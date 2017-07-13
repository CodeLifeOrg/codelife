import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "components/App";
import Editor from "pages/Editor";
import Home from "pages/Home";
import Lesson from "pages/Lesson";
import Minilesson from "pages/Minilesson";
import Slide from "pages/Slide";
import Glossary from "pages/Glossary";
import Profile from "pages/Profile";
import Studio from "pages/Studio";
import ShareSnippet from "pages/ShareSnippet";
import {Login, SignUp} from "datawheel-canon";

export default function RouteCreate() {

  return (
    <Route path="/" history={browserHistory} component={App}>
      <IndexRoute component={Home} />
      <Route path="signup" component={SignUp} />
      <Route path="login" component={Login} />
      
      <Route path="lesson" component={Lesson} />
      <Route path="lesson/:lid" component={Minilesson} />
      <Route path="lesson/:lid/:mlid(/:sid)" component={Slide} />

      <Route path="editor/:lid" component={Editor} />

      <Route path="sharesnippet/:snid" component={ShareSnippet} />

      <Route path="glossary" component={Glossary} />
      <Route path="profile" component={Profile} />
      <Route path="studio" component={Studio} />
    </Route>
  );
}
