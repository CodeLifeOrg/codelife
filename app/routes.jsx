import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "components/App";
import Editor from "pages/Editor";
import Lesson from "pages/Lesson";
import Minilesson from "pages/Minilesson";
import Slide from "pages/Slide";
import Glossary from "pages/Glossary";
import Profile from "pages/Profile";
import Studio from "pages/Studio";
import Share from "pages/Share";
import Ui from "pages/Ui";

export default function RouteCreate() {

  return (
    <Route path="/" history={browserHistory} component={App}>
      <IndexRoute component={Lesson} />

      <Route path="lesson" component={Lesson} />
      <Route path="lesson/:lid" component={Minilesson} />
      <Route path="lesson/:lid/:mlid(/:sid)" component={Slide} />

      <Route path="editor/:lid" component={Editor} />

      <Route path="share/:type/:id" component={Share} />

      <Route path="glossary" component={Glossary} />
      <Route path="profile/:username" component={Profile} />
      <Route path="studio/:user(/:id)" component={Studio} />

      <Route path="ui" component={Ui} />
    </Route>
  );
}
