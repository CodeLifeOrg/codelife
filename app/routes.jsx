import React from "react";
import {Route, Redirect, IndexRoute, browserHistory} from "react-router";

import App from "./App";

import About from "pages/About";
import EditProfile from "pages/profile/EditProfile";
import Glossary from "pages/Glossary";
import Home from "pages/Home";
import Island from "pages/Island";
import Level from "pages/Level";
import Privacy from "pages/Privacy";
import Profile from "pages/profile/Profile";
import Share from "pages/Share";
import Slide from "pages/Slide";
import Studio from "pages/Studio";
import Survey from "pages/Survey";
import LearnMore from "pages/LearnMore";
import AdminPanel from "pages/admin/AdminPanel";
import ResetPw from "pages/ResetPw";
import Contest from "pages/Contest";
import Error from "pages/Error";


export default function RouteCreate() {

  return (
    <Route path="/" component={App} history={browserHistory}>

      <IndexRoute component={Home} />

      <Route path="island" component={Island} />
      <Route path="island/:lid" component={Level} />
      <Route path="island/:lid/:mlid(/:sid)" component={Slide} />

      <Route path="projects/:username" component={Studio} />
      <Route path="projects/:username/:filename" component={Share} />
      <Route path="projects/:user/:filename/edit" component={Studio} />

      <Route path="profile/:username" component={Profile} />
      <Route path="profile/:username/edit" component={EditProfile} />

      <Route path="glossary" component={Glossary} />

      <Route path="survey" component={Survey} />

      <Route path="about" component={About} />

      <Route path="privacy" component={Privacy} />

      <Route path="codeBlocks/:username/:filename" component={Share} />

      <Route path="admin" component={AdminPanel} />
      <Route path="admin/:tab" component={AdminPanel} />
      <Route path="admin/:tab/:island" component={AdminPanel} />
      <Route path="admin/:tab/:island/:level" component={AdminPanel} />
      <Route path="admin/:tab/:island/:level/:slide" component={AdminPanel} />

      <Route path="learnmore" component={LearnMore} />

      <Route path="contest" component={Contest} />

      <Route path="reset" component={ResetPw} />
      <Redirect from="login" to="/" />

      <Route path="*" component={Error} />

    </Route>
  );
}
