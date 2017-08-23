import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "components/App";

import About from "pages/About";
import EditProfile from "pages/profile/EditProfile";
import Glossary from "pages/Glossary";
import Lesson from "pages/Lesson";
import Minilesson from "pages/Minilesson";
import Privacy from "pages/Privacy";
import Profile from "pages/profile/Profile";
import Share from "pages/Share";
import Slide from "pages/Slide";
import Splash from "pages/Splash";
import Studio from "pages/Studio";
import Survey from "pages/Survey";
import LevelEditor from "pages/leveleditor/LevelEditor";

export default function RouteCreate() {

  return (
    <Route path="/" component={App} history={browserHistory}>

      <IndexRoute component={Lesson} />

      <Route path="login" component={Splash} />

      <Route path="lesson" component={Lesson} />
      <Route path="lesson/:lid" component={Minilesson} />
      <Route path="lesson/:lid/:mlid(/:sid)" component={Slide} />

      <Route path="projects/:user(/:id)" component={Studio} />

      <Route path="profile/:username" component={Profile} />
      <Route path="profile/:username/edit" component={EditProfile} />

      <Route path="glossary" component={Glossary} />

      <Route path="survey" component={Survey} />

      <Route path="about" component={About} />

      <Route path="privacy" component={Privacy} />

      <Route path="share/:type/:id" component={Share} />

      <Route path="leveleditor" component={LevelEditor} />

    </Route>
  );
}
