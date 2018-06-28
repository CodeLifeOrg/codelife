## Classes

<dl>
<dt><a href="#AuthForm">AuthForm</a></dt>
<dd><p>AuthForm is a wrapper component that switches between LoginForm and Signup Form
It can be primed with a default via the initialMode prop.</p>
</dd>
<dt><a href="#Browser">Browser</a></dt>
<dd><p>Browser is a drop-down menu embedded in Nav that lets the user jump to any
level or island that they have beaten in the past</p>
</dd>
<dt><a href="#Checkpoint">Checkpoint</a></dt>
<dd><p>Checkpoint is a one-time pop-up that asks the user to fill in his or her school/location
Originally intended to be a more generic &quot;Checkpoint&quot; system that would support arbitrary 
banners/messages, it is currently only used for gathering school info</p>
</dd>
<dt><a href="#CodeBlockCard">CodeBlockCard</a></dt>
<dd><p>CodeBlockCards appear throughout the site as a way of previewing a student&#39;s codeblock
It contains both the small clickable card with preview image AND the dialog box that pops
up over the page and shows the full screen code editor.</p>
</dd>
<dt><a href="#CodeBlockEditor">CodeBlockEditor</a></dt>
<dd><p>CodeBlockEditor is the popover that comes up for the final test of an island.
It is mostly a wrapper around CodeEditor that provides the student with the test prompt,
cheat sheet, and db routes to save their progress when they pass the test</p>
</dd>
<dt><a href="#CodeBlockList">CodeBlockList</a></dt>
<dd><p>CodeBlockList is used by Projects to display codeblocks to draw inspiration from.</p>
</dd>
<dt><a href="#CodeEditor">CodeEditor</a></dt>
<dd><p>CodeEditor is a two-panel rendering component for student code.
It uses AceEditor for the student panel (left), and a remote rendering iframe for the page preview (right).</p>
</dd>
<dt><a href="#CollabList">CollabList</a></dt>
<dd><p>Provides a list of Collaborators for a project provided by props.</p>
</dd>
<dt><a href="#CollabSearch">CollabSearch</a></dt>
<dd><p>Popover window so that project owners can find and add new users to collaborate on a given project</p>
</dd>
<dt><a href="#Comment">Comment</a></dt>
<dd><p>Comments belong to Threads. Note that there is no text editor here - all posting is handled by Thread.jsx.
This component is for displaying only.</p>
</dd>
<dt><a href="#ContestSignup">ContestSignup</a></dt>
<dd><p>Signup page for (currently postponed) project contest. Signing up simply enters the user in the contest,
users still must go to the ContestSubmit page to select a project and finalize the procedure.</p>
</dd>
<dt><a href="#ContestSubmit">ContestSubmit</a></dt>
<dd><p>User selects a project for the contest and submits their entry.</p>
</dd>
<dt><a href="#CTA">CTA</a></dt>
<dd><p>Call To Action Component, encourage users to sign up after visiting SEO-enable page</p>
</dd>
<dt><a href="#Discussion">Discussion</a></dt>
<dd><p>Discussion Board wraps a list of threads (which in turn hosts a list of comments). Discussion boards 
currently only apply to slides, but they are designed to be able to apply to anything (projects, codeblocks, etc)</p>
</dd>
<dt><a href="#IslandLink">IslandLink</a></dt>
<dd><p>IslandLink is the zoomed-out picture of the island used in the overworld map, lesson plan, etc</p>
</dd>
<dt><a href="#Loading">Loading</a></dt>
<dd><p>Loading is explicitly used by CANON itself for any page that has canon &quot;needs&quot;, which is why this
is a full container page with <clouds>. The LoadingSpinner component was separated out for embedded use (no clouds)</p>
</dd>
<dt><a href="#LoadingSpinner">LoadingSpinner</a></dt>
<dd><p>Loading spinner for a huge number of components in Codelife, mostly used in render cycles while 
waiting for axios to return with data</p>
</dd>
<dt><a href="#LoginForm">LoginForm</a></dt>
<dd><p>Works alongside SignUpForm to log users in. Essentially a wrapper for the canon &quot;login&quot; action</p>
</dd>
<dt><a href="#Nav">Nav</a></dt>
<dd><p>Nav Component is the header of the page - containing login controls and the Island Browser</p>
</dd>
<dt><a href="#PasswordReset">PasswordReset</a></dt>
<dd><p>Wrapper Component for the reset password dispatch action of canon</p>
</dd>
<dt><a href="#ProjectCard">ProjectCard</a></dt>
<dd><p>ProjectCard, similar to CodeBlockCard, is a small visual container with a Dialog popover to showcase projects.
It is used on the Homepage as well as in User Profiles to list their projects</p>
</dd>
<dt><a href="#ReportBox">ReportBox</a></dt>
<dd><p>ReportBox is a reusable component for reporting threads, comments, projects, and codeblocks for 
inappropriate content. As with many data structures in codelife, it uses a SINGLE reports table, 
with a &quot;type&quot; column that designates which table the report_id refers to.</p>
</dd>
<dt><a href="#InputCode">InputCode</a></dt>
<dd><p>InputCode is a slide type that requires the student to complete a coding test
The CodeEditor component is embedded with a series of rules, and the slide will 
not unblock until the student submits a passing code section. It is mostly a wrapper
for CodeEditor, with some controls to execute controls or unblock a slide.</p>
</dd>
<dt><a href="#Quiz">Quiz</a></dt>
<dd><p>Quiz is a blocking multiple-choice question, powered by the quizjson column in the slides db</p>
</dd>
<dt><a href="#RenderCode">RenderCode</a></dt>
<dd><p>RenderCode is similar to InputCode, but the CodeEditor is in readonly mode
For showing code examples with explanations.</p>
</dd>
<dt><a href="#TextImage">TextImage</a></dt>
<dd><p>TextImage is text left, image right. Images are stored in /slide_images/{id}.jpg
Images are uploaded through the CMS and a translated version is chosen here via locales</p>
</dd>
<dt><a href="#Island">Island</a></dt>
<dd><p>Displays all available islands</p>
</dd>
<dt><a href="#Profile">Profile</a></dt>
<dd><p>Class component for a user profile.
This is a public page and meant to be shared.
If a user is logged in AND this is their profile, show an
edit button allowing them to edit it.</p>
</dd>
<dt><a href="#UserCodeBlocks">UserCodeBlocks</a></dt>
<dd><p>Class component for displaying lists of user&#39;s snippets.
This is shown on the public profile for a user and requires sending
1 prop: a ref to the user</p>
</dd>
<dt><a href="#UserProjects">UserProjects</a></dt>
<dd><p>Class component for displaying lists of user&#39;s projects.
This is shown on the public profile for a user and requires sending
1 prop: a ref to the user</p>
</dd>
<dt><a href="#UsersList">UsersList</a></dt>
<dd><p>Class component for displaying lists of user&#39;s snippets.
This is shown on the public profile for a user and requires sending
1 prop: a ref to the user</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#threadInclude">threadInclude</a></dt>
<dd><p>threadsRoute is used for retrieving threads and their associated comments.
Unlike islands, likes, and many of the other earlier data structures in development,
threads make better use of Sequelize associations, implicitly including comments in the
thread payloads they belong to. This is distinctly different from islands/levels/slides,
which get entire lists from the tables and then compile them client side. Going forward,
the hierarchical/sequelize-association method of delivering API data (without flattening)
is the more correct one.
Threads have entity_ids and types. Currently the only two types are comments and threads,
however the intention was that discussions could expand to encompass projects/codeblocks or more</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#flattenCodeBlock">flattenCodeBlock(user, cb)</a> ⇒ <code>Object</code></dt>
<dd><p>Given the logged-in user and a codeblock, this function &quot;flattens&quot; the object by reaching
into the associated tables queries (such as reports and likes) and bubbling them up to a top-level prop
This type of function is really only used here and in projectsRoute.  As codelife development progressed,
the pattern shifted more to expect the nested nature of sequelize queries, meaning flattening wasn&#39;t necessary.</p>
</dd>
<dt><a href="#strip">strip()</a></dt>
<dd><p>This route is specifically for the canon &quot;needs&quot; version of the glossary
It has a lang switch because the glossary needs to be rendered server side
for SEO optimization.</p>
</dd>
<dt><a href="#flattenProfile">flattenProfile(user, p)</a></dt>
<dd><p>Similar to codeblocksroute, earlier in the project a lot of work was done to keep 
the payloads returned by APIs as flat objects. Later routes trended more towards trusting
sequelize to form the hierarchy via associations. This helper function bubbles up associations
into top-level properties.</p>
</dd>
<dt><a href="#flattenProject">flattenProject(user, p)</a> ⇒ <code>Object</code></dt>
<dd><p>Given the logged-in user and a project, this function &quot;flattens&quot; the object by reaching
into the associated tables queries (such as reports and likes) and bubbling them up to a top-level prop
This type of function is really only used here and in codeblocksroute.  As codelife development progressed,
the pattern shifted more to expect the nested nature of sequelize queries, meaning flattening wasn&#39;t necessary.</p>
</dd>
<dt><a href="#pruneThread">pruneThread(user, t)</a> ⇒ <code>Object</code></dt>
<dd><p>Given a user and a thread, prepare the thread to be returned to the requester.
This involves a number of operations, including collating likes and reports, rewriting
banned content, and deleting certain sensitive keys so they don&#39;t leak out through the API</p>
</dd>
</dl>

<a name="AuthForm"></a>

## AuthForm
AuthForm is a wrapper component that switches between LoginForm and Signup Form
It can be primed with a default via the initialMode prop.

**Kind**: global class  

* * *

<a name="Browser"></a>

## Browser
Browser is a drop-down menu embedded in Nav that lets the user jump to any
level or island that they have beaten in the past

**Kind**: global class  

* [Browser](#Browser)
    * [.componentDidMount()](#Browser+componentDidMount)
    * [.buildTree()](#Browser+buildTree)
    * [.initFromProps(nodeFromProps)](#Browser+initFromProps)
    * [.fixNulls(obj)](#Browser+fixNulls) ⇒ <code>Object</code>
    * [.reloadProgress()](#Browser+reloadProgress)
    * [.selectNodeFromProps()](#Browser+selectNodeFromProps)
    * [.handleNodeClick(node)](#Browser+handleNodeClick)


* * *

<a name="Browser+componentDidMount"></a>

### browser.componentDidMount()
On mount, fetch all islands/levels/slides, sort them, and arrange them 
hierarchically for use in the Blueprint Tree. Also grab the logged in user's progress
so that the browser can lock unbeaten levels.

**Kind**: instance method of [<code>Browser</code>](#Browser)  

* * *

<a name="Browser+buildTree"></a>

### browser.buildTree()
Builds the "nodes" object that will be used to populate the blueprint tree.
The Blueprint Tree component requires lots of metadata and nesting, so a fair
amount of crawling must be done to populate it properly
Note: This is borrowed heavily from the tree in the CMS. Someday they should be merged

**Kind**: instance method of [<code>Browser</code>](#Browser)  

* * *

<a name="Browser+initFromProps"></a>

### browser.initFromProps(nodeFromProps)
Given a blueprint tree node, saved during the buildTree function, expand and select
the appropriate node to match the location

**Kind**: instance method of [<code>Browser</code>](#Browser)  

| Param | Type | Description |
| --- | --- | --- |
| nodeFromProps | <code>Object</code> | A Blueprint Tree node |


* * *

<a name="Browser+fixNulls"></a>

### browser.fixNulls(obj) ⇒ <code>Object</code>
Helper function to avoid errors from accessing non-existent properties
Longer term, database defaults values should be established to avoid this

**Kind**: instance method of [<code>Browser</code>](#Browser)  
**Returns**: <code>Object</code> - an object whose null/undefined params are changed to ""  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | the object to prune |


* * *

<a name="Browser+reloadProgress"></a>

### browser.reloadProgress()
As the user beats new levels, they are written to the db, but no redux-level store
is updated. This public-facing function is invoked by Nav.jsx when the Browser is opened,
resulting in a short loading screen while the latest progress is retrieved.
See Nav.jsx for more details.

**Kind**: instance method of [<code>Browser</code>](#Browser)  

* * *

<a name="Browser+selectNodeFromProps"></a>

### browser.selectNodeFromProps()
Similar to initNodeFromProps which expands the Blueprint Tree, this function selects
the node that matches the LinkObj provided by Nav.

**Kind**: instance method of [<code>Browser</code>](#Browser)  

* * *

<a name="Browser+handleNodeClick"></a>

### browser.handleNodeClick(node)
Callback for clicking a node. Uses browserhistory to navigate the user to the new page

**Kind**: instance method of [<code>Browser</code>](#Browser)  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Object</code> | The blueprint node that was clicked |


* * *

<a name="Checkpoint"></a>

## Checkpoint
Checkpoint is a one-time pop-up that asks the user to fill in his or her school/location
Originally intended to be a more generic "Checkpoint" system that would support arbitrary 
banners/messages, it is currently only used for gathering school info

**Kind**: global class  

* * *

<a name="CodeBlockCard"></a>

## CodeBlockCard
CodeBlockCards appear throughout the site as a way of previewing a student's codeblock
It contains both the small clickable card with preview image AND the dialog box that pops
up over the page and shows the full screen code editor.

**Kind**: global class  

* [CodeBlockCard](#CodeBlockCard)
    * [.saveLikeStatus()](#CodeBlockCard+saveLikeStatus)
    * [.generateScreenshot()](#CodeBlockCard+generateScreenshot)
    * [.selectFork()](#CodeBlockCard+selectFork)
    * [.toggleFeature()](#CodeBlockCard+toggleFeature)
    * [.toggleFork()](#CodeBlockCard+toggleFork)
    * [.toggleLike()](#CodeBlockCard+toggleLike)
    * [.directLike()](#CodeBlockCard+directLike)
    * [.componentDidMount()](#CodeBlockCard+componentDidMount)
    * [.componentDidUpdate()](#CodeBlockCard+componentDidUpdate)
    * [.handleReport()](#CodeBlockCard+handleReport)


* * *

<a name="CodeBlockCard+saveLikeStatus"></a>

### codeBlockCard.saveLikeStatus()
Write the current like status of this codeblock to the db.
CodeBlockList must be informed when this happens so it can reorder the codeblocks
(liked codeblocks come first) so props.reportLike on return.

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+generateScreenshot"></a>

### codeBlockCard.generateScreenshot()
Admin-only button callback that pings an API route to manually generate a screenshot
for this codeblock (usually only happens when codeblock owner saves file)

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+selectFork"></a>

### codeBlockCard.selectFork()
When the forking sub-menu is opened, highlight and select the text for easy editing

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+toggleFeature"></a>

### codeBlockCard.toggleFeature()
Admin-only button callback that sets a codeblock as featured or not (featured codeblocks
show up on the homepage)

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+toggleFork"></a>

### codeBlockCard.toggleFork()
Codeblocks can be forked into projects, so students may remix another student's work.
This function creates that new project and populates it with the codeblock data

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+toggleLike"></a>

### codeBlockCard.toggleLike()
Switch that functions a like on and off. Note that this is front-end only
and does not update the backend.

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+directLike"></a>

### codeBlockCard.directLike()
Toggles the like visually (toggleLike) and saves it to the db (saveLikeStatus)

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+componentDidMount"></a>

### codeBlockCard.componentDidMount()
On mount, grab the codeblock from props and create a unique placeholder fork name via epoch time

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+componentDidUpdate"></a>

### codeBlockCard.componentDidUpdate()
On Update, if new props have been loaded in, load the new codeblock into state and update fork title

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockCard+handleReport"></a>

### codeBlockCard.handleReport()
This method is passed down as a callback to ReportBox. When reportBox signals a report,
it calls this function, which updates the embedded codeblock itself and forces a refresh

**Kind**: instance method of [<code>CodeBlockCard</code>](#CodeBlockCard)  

* * *

<a name="CodeBlockEditor"></a>

## CodeBlockEditor
CodeBlockEditor is the popover that comes up for the final test of an island.
It is mostly a wrapper around CodeEditor that provides the student with the test prompt,
cheat sheet, and db routes to save their progress when they pass the test

**Kind**: global class  

* [CodeBlockEditor](#CodeBlockEditor)
    * [.componentDidMount()](#CodeBlockEditor+componentDidMount)
    * [.onFirstCompletion()](#CodeBlockEditor+onFirstCompletion)
    * [.setExecState()](#CodeBlockEditor+setExecState)
    * [.saveProgress()](#CodeBlockEditor+saveProgress)
    * [.onChangeText()](#CodeBlockEditor+onChangeText)
    * [.resetCodeBlock()](#CodeBlockEditor+resetCodeBlock)
    * [.attemptReset()](#CodeBlockEditor+attemptReset)
    * [.executeCode()](#CodeBlockEditor+executeCode)
    * [.changeCodeblockName()](#CodeBlockEditor+changeCodeblockName)
    * [.clickSave()](#CodeBlockEditor+clickSave)
    * [.verifyAndSaveCode()](#CodeBlockEditor+verifyAndSaveCode)


* * *

<a name="CodeBlockEditor+componentDidMount"></a>

### codeBlockEditor.componentDidMount()
On Mount, parse various props passed down and add them to state.

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+onFirstCompletion"></a>

### codeBlockEditor.onFirstCompletion()
When a user passes a codeblock for the first time, the parent Island component
must be informed so it can close the popover and show a the "next island" dialog.
Pass this callback down to codeeditor to enable that

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+setExecState"></a>

### codeBlockEditor.setExecState()
Callback passed to CodeEditor so that CodeEditor can report when the user is using
a script tag (therefore show an execute button in here in CodeBlockEditor)

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+saveProgress"></a>

### codeBlockEditor.saveProgress()
Write progress to db when codeblock is passed

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+onChangeText"></a>

### codeBlockEditor.onChangeText()
Callback passed down to the CodeEditor, allowing this parent component to respond
to text changes if desired.

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+resetCodeBlock"></a>

### codeBlockEditor.resetCodeBlock()
Set codeblock back to original test prompt state

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+attemptReset"></a>

### codeBlockEditor.attemptReset()
Show popup warning (Are you sure?)

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+executeCode"></a>

### codeBlockEditor.executeCode()
Show popup warning (Are you sure?)

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+changeCodeblockName"></a>

### codeBlockEditor.changeCodeblockName()
Change codeblock name in place. Note that this doesn't save it to the db yet

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+clickSave"></a>

### codeBlockEditor.clickSave()
Intermediary function that blocks some editing functions until the save is complete
This gets around a known bug where clicking save twice can write two copies to the db

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockEditor+verifyAndSaveCode"></a>

### codeBlockEditor.verifyAndSaveCode()
When the user clicks save & submit, make sure the internal CodeEditor has verified that
their code is passing. If so, write the codeblock and progress to the db, and update the 
in-state version to reflect the new code

**Kind**: instance method of [<code>CodeBlockEditor</code>](#CodeBlockEditor)  

* * *

<a name="CodeBlockList"></a>

## CodeBlockList
CodeBlockList is used by Projects to display codeblocks to draw inspiration from.

**Kind**: global class  

* [CodeBlockList](#CodeBlockList)
    * [.componentDidMount()](#CodeBlockList+componentDidMount)
    * [.reportLike()](#CodeBlockList+reportLike)
    * [.handleFork()](#CodeBlockList+handleFork)


* * *

<a name="CodeBlockList+componentDidMount"></a>

### codeBlockList.componentDidMount()
On Mount, fetch all codeblocks, sort them by island, then separate into liked, unliked, and "mine" (logged in user's)
Also fetch user progress so that unbeaten island codeblocks show as greyed out

**Kind**: instance method of [<code>CodeBlockList</code>](#CodeBlockList)  

* * *

<a name="CodeBlockList+reportLike"></a>

### codeBlockList.reportLike()
Because a like can occur in a nested component (in this case, CodeBlockCard), this container component
needs a callback function that can rearrange the items that exist in state.

**Kind**: instance method of [<code>CodeBlockList</code>](#CodeBlockList)  

* * *

<a name="CodeBlockList+handleFork"></a>

### codeBlockList.handleFork()
Codeblocks have the ability to "fork" into a new project. For most embeddings of CodeBlockCards, this is as simple
as creating the new project and using browserHistory to navigate the user to that page. However, as the user is 
ALREADY ON the Projects page, a callback is required to tell the parent component (Projects.jsx) to make a new project
and update itself accordingly

**Kind**: instance method of [<code>CodeBlockList</code>](#CodeBlockList)  

* * *

<a name="CodeEditor"></a>

## CodeEditor
CodeEditor is a two-panel rendering component for student code.
It uses AceEditor for the student panel (left), and a remote rendering iframe for the page preview (right).

**Kind**: global class  

* [CodeEditor](#CodeEditor)
    * [.componentDidMount()](#CodeEditor+componentDidMount)
    * [.componentWillUnmount()](#CodeEditor+componentWillUnmount)
    * [.pingRemote()](#CodeEditor+pingRemote)
    * [.componentDidUpdate()](#CodeEditor+componentDidUpdate)
    * [.getBaseRules()](#CodeEditor+getBaseRules) ⇒ <code>Array</code>
    * [.receiveMessage(event)](#CodeEditor+receiveMessage)
    * [.getTitleText(theText)](#CodeEditor+getTitleText) ⇒ <code>String</code>
    * [.stripJS(json)](#CodeEditor+stripJS) ⇒ <code>Array</code>
    * [.checkForErrors()](#CodeEditor+checkForErrors)
    * [.writeToIFrame(theText)](#CodeEditor+writeToIFrame)
    * [.hasJS(theText)](#CodeEditor+hasJS)
    * [.renderText(executeJS)](#CodeEditor+renderText)
    * [.iFrameLoaded()](#CodeEditor+iFrameLoaded)
    * [.onChangeText(theText)](#CodeEditor+onChangeText)
    * [.myCatch(e)](#CodeEditor+myCatch)
    * [.myLog()](#CodeEditor+myLog)
    * [.evalType(value)](#CodeEditor+evalType) ⇒ <code>String</code>
    * [.handlePost()](#CodeEditor+handlePost)
    * [.checkJVMState(needle, value)](#CodeEditor+checkJVMState)
    * [.reverse(s)](#CodeEditor+reverse) ⇒ <code>String</code>
    * [.internalRender()](#CodeEditor+internalRender)
    * [.setEntireContents(theText)](#CodeEditor+setEntireContents)
    * [.getEntireContents()](#CodeEditor+getEntireContents) ⇒ <code>String</code>
    * [.isPassing()](#CodeEditor+isPassing) ⇒ <code>Boolean</code>
    * [.changesMade()](#CodeEditor+changesMade) ⇒ <code>Boolean</code>
    * [.setChangeStatus(changesMade)](#CodeEditor+setChangeStatus)
    * [.executeCode()](#CodeEditor+executeCode)
    * [.toggleDrawer()](#CodeEditor+toggleDrawer)
    * [.fullscreenEditorToggle()](#CodeEditor+fullscreenEditorToggle)


* * *

<a name="CodeEditor+componentDidMount"></a>

### codeEditor.componentDidMount()
When CodeEditor mounts, add an EventListener that listens for postMessage events from the sandbox.
Also, initiate a ping that checks with the sandbox page until it is ready to render.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+componentWillUnmount"></a>

### codeEditor.componentWillUnmount()
Before CodeEditor unmounts, remove the EventListener that listens for postMessage events from the sandbox.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+pingRemote"></a>

### codeEditor.pingRemote()
On a set interval, ping the remote sandbox until we receive a postMessage indicating that it's ready.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+componentDidUpdate"></a>

### codeEditor.componentDidUpdate()
On update, detect the state change of hasJS to inform the parent component whether or not to show an "Execute" button.
If the rules in the props have changed, the parent component has changed (e.g., changing slides), necessitating state change of rules.
Additionally, if the code content in the props have changed, clear any execution timeouts and reset the editor state.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+getBaseRules"></a>

### codeEditor.getBaseRules() ⇒ <code>Array</code>
Generates a base state of HTML rules that will always be true for a well-formed page.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  
**Returns**: <code>Array</code> - Array of basic HTML rules in JSON format  

* * *

<a name="CodeEditor+receiveMessage"></a>

### codeEditor.receiveMessage(event)
Listens for events from postMessage, generated by the embedded iframe sandbox on codelife.tech.
If the message didn't come from codelife.tech, automatically return.
If the message is a special wakeup message, clear the ping intervals and set the iframe as ready for use.
For all other messages, forward them to the handlePost function.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>String</code> | A postMessage event. |


* * *

<a name="CodeEditor+getTitleText"></a>

### codeEditor.getTitleText(theText) ⇒ <code>String</code>
Given the current text in the editor, if the HTML has a properly formatted <title> field, extract and return it.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  
**Returns**: <code>String</code> - The extracted text between <title> and </title>  

| Param | Type | Description |
| --- | --- | --- |
| theText | <code>String</code> | The current text contents of the editor |


* * *

<a name="CodeEditor+stripJS"></a>

### codeEditor.stripJS(json) ⇒ <code>Array</code>
Given a parsed JSON representation of the current code, recursively find and remove the contents of anything between <script> tags.
This is important because we re-render the page on each keystroke, so firing JavaScript executions for each key is not ideal.
Save the stripped-out JS into state, so we can determine from its prescence there if we should show an execute button or not.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  
**Returns**: <code>Array</code> - A rebuilt (minus JavaScript) JSON object that himalaya can parse back into HTML.  

| Param | Type | Description |
| --- | --- | --- |
| json | <code>Object</code> | A JSON Representation of the current text, as parsed by the himalaya library |


* * *

<a name="CodeEditor+checkForErrors"></a>

### codeEditor.checkForErrors()
Grabs the current editor text from state, and prepare an array of true/false tests to be applied to it.
Based on the results of those testing rules, set state variables that provide completion % feedback to the student.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+writeToIFrame"></a>

### codeEditor.writeToIFrame(theText)
Given the text currently in the editor, send a postMessage containing that source to the sandbox for rendering.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| theText | <code>String</code> | The text to be rendered in the sandbox |


* * *

<a name="CodeEditor+hasJS"></a>

### codeEditor.hasJS(theText)
Given the text currently in the editor, determine if it has open and closing script tags.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| theText | <code>String</code> | The current editor text |


* * *

<a name="CodeEditor+renderText"></a>

### codeEditor.renderText(executeJS)
Called explictly after state updates that change the text. Using the helper function stripJS, this function prepares
the code to be shipped to the sandbox via writeToIFrame. If it is the first time we are rendering, such as in a slide example,
execute the JavaScript after a short delay.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| executeJS | <code>Boolean</code> | If set to true, this function will execute any included JavaScript after a short delay. |


* * *

<a name="CodeEditor+iFrameLoaded"></a>

### codeEditor.iFrameLoaded()
Called after "awake" message is received from sandbox, indicating that the iFrame is loaded and ready for postMessage events.
Fetches rule text from API. On completion, set the prop-given initial text in state and invoke the onChangeText callback, so any
componenent that embeds CodeEdtior may subscribes to this callback may be notified that the text has changed.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+onChangeText"></a>

### codeEditor.onChangeText(theText)
Callback for the embedded AceEditor component. Used to bubble up text change events to this object's state and to the parent.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| theText | <code>String</code> | The current state of the text in the code editor. |


* * *

<a name="CodeEditor+myCatch"></a>

### codeEditor.myCatch(e)
Invoked by handlePost when an error is caught by the sandbox. Concatenates the error message to the console.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>String</code> | The error string retrieved from the sandbox |


* * *

<a name="CodeEditor+myLog"></a>

### codeEditor.myLog()
Invoked by handlePost when an log message is returned by the sandbox. Concatenates the log message to the console.
Because console.log can take multiple comma-separated arguments, extract the list using Array.from(arguments)

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+evalType"></a>

### codeEditor.evalType(value) ⇒ <code>String</code>
Helper function to determine argument type for syntax highlighting in emulated console.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  
**Returns**: <code>String</code> - A String representing the type of the provided object  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | Value of any type |


* * *

<a name="CodeEditor+handlePost"></a>

### codeEditor.handlePost()
Called by receiveMessage when postMessage events arrive from the sandbox. The first argument will always be a type
designator that describes the following arguments so they can be routed for processing. A type of "completed" means
the JavaScript has completed execution in the remote sandbox and error checking can begin.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+checkJVMState"></a>

### codeEditor.checkJVMState(needle, value)
Called by handlePost to process postMessage events of type "rule". Iterates over list of rules in state and sets
each rule's passing state based on whether the given argument matches type and value restrictions.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| needle | <code>String</code> | The keyword rulename this value belongs to, typically a variable or function name |
| value | <code>\*</code> | The actual, remote-sandbox determined value to check against. |


* * *

<a name="CodeEditor+reverse"></a>

### codeEditor.reverse(s) ⇒ <code>String</code>
Reverses a string.  Used by internalRender() to assist with regex.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  
**Returns**: <code>String</code> - The reversed string  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>String</code> | The string to be reversed |


* * *

<a name="CodeEditor+internalRender"></a>

### codeEditor.internalRender()
One of the more complex functions in CodeLife, internalRender is invoked when an "execute code" button is pressed.
This function is responsible for sending a specially prepared version of the student's source code to a remote sandbox for execution.
The remote sandbox has an iFrame of its own, where the code is being injected. References to the "parent" of this iFrame
refer to functions in the sandbox responsible for sending information back to Codelife.com via postMessage.
To prepare the code for remote execution, several steps must be taken:
- replace console.log with parent.myPost("console"...) to intercept console statements.
- prepend JavaScript code with initialization functions that "zero out" any rule variables the student must set correctly.
- append JavaScript code with parent.myPost("rule"...) methods that send variable state back to Codelife.com
- further append JavaScript code with parent.myPost("completed"...) to indicate that the run has completed.
- take ALL of that code, wrap it into a string literal that eval()s the code and catches any runtime errors.
- take the student's current code and replace its JavaScript with the prepared JavaScript
- invoke writeToIFrame, which sends the entire payload to the remote sandbox for execution.
The sandbox then injects the prepared code into the iFrame, which calls its parent functions, and reports back here via postMessage.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+setEntireContents"></a>

### codeEditor.setEntireContents(theText)
Externally available method that components can use to set the contents of the Code Editor functionally (as opposed to via props)

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| theText | <code>String</code> | The string to set as the editor contents. |


* * *

<a name="CodeEditor+getEntireContents"></a>

### codeEditor.getEntireContents() ⇒ <code>String</code>
Externally available method that components can use to get the contents of the Code Editor functionally (as opposed to via props)

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  
**Returns**: <code>String</code> - The current contents of the editor  

* * *

<a name="CodeEditor+isPassing"></a>

### codeEditor.isPassing() ⇒ <code>Boolean</code>
Externally available method that components can use to fetch passing state

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  
**Returns**: <code>Boolean</code> - Whether the code is in a passing state  

* * *

<a name="CodeEditor+changesMade"></a>

### codeEditor.changesMade() ⇒ <code>Boolean</code>
Externally available method that components can use to determine whether the editor is "dirty," i.e., changes made that require saving

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  
**Returns**: <code>Boolean</code> - Whether changes have been made to the code since its initial state or last save  

* * *

<a name="CodeEditor+setChangeStatus"></a>

### codeEditor.setChangeStatus(changesMade)
Externally available method that components can use to set the editor as "dirty/clean" i.e., changes made.
This is a necessary callback for operations like Saving Content - embedding components need to set changesMade to false.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

| Param | Type | Description |
| --- | --- | --- |
| changesMade | <code>Boolean</code> | Boolean value to set "dirty/clean" status in editor. |


* * *

<a name="CodeEditor+executeCode"></a>

### codeEditor.executeCode()
Externally available method that components can use to execute the JavaScript contents of the editor.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+toggleDrawer"></a>

### codeEditor.toggleDrawer()
Externally available method that components can use to set drawer visibility state.

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CodeEditor+fullscreenEditorToggle"></a>

### codeEditor.fullscreenEditorToggle()
toggle fullscreen state

**Kind**: instance method of [<code>CodeEditor</code>](#CodeEditor)  

* * *

<a name="CollabList"></a>

## CollabList
Provides a list of Collaborators for a project provided by props.

**Kind**: global class  

* * *

<a name="CollabSearch"></a>

## CollabSearch
Popover window so that project owners can find and add new users to collaborate on a given project

**Kind**: global class  

* [CollabSearch](#CollabSearch)
    * [.handleChange()](#CollabSearch+handleChange)
    * [.addCollaborator()](#CollabSearch+addCollaborator)
    * [.removeCollaborator()](#CollabSearch+removeCollaborator)


* * *

<a name="CollabSearch+handleChange"></a>

### collabSearch.handleChange()
Don't start hitting the database until the query is more than 2 characters long

**Kind**: instance method of [<code>CollabSearch</code>](#CollabSearch)  

* * *

<a name="CollabSearch+addCollaborator"></a>

### collabSearch.addCollaborator()
Given a clicked collaborator, if the constraints are met, post it to userprofiles_profiles (collab table)

**Kind**: instance method of [<code>CollabSearch</code>](#CollabSearch)  

* * *

<a name="CollabSearch+removeCollaborator"></a>

### collabSearch.removeCollaborator()
Given a uid and the pid of the current project, remove the matching row from userprofiles_profiles

**Kind**: instance method of [<code>CollabSearch</code>](#CollabSearch)  

* * *

<a name="Comment"></a>

## Comment
Comments belong to Threads. Note that there is no text editor here - all posting is handled by Thread.jsx.
This component is for displaying only.

**Kind**: global class  

* [Comment](#Comment)
    * [.componentDidMount()](#Comment+componentDidMount)
    * [.toggleLike()](#Comment+toggleLike)
    * [.handleReport()](#Comment+handleReport)


* * *

<a name="Comment+componentDidMount"></a>

### comment.componentDidMount()
The comment itself is passed in via props. Put it in state

**Kind**: instance method of [<code>Comment</code>](#Comment)  

* * *

<a name="Comment+toggleLike"></a>

### comment.toggleLike()
Handle Liking and Unliking of comments

**Kind**: instance method of [<code>Comment</code>](#Comment)  

* * *

<a name="Comment+handleReport"></a>

### comment.handleReport()
When the nested ReportBox component processes a report, This commment module needs to update the button to 
reflect the new state. This callback handles that.

**Kind**: instance method of [<code>Comment</code>](#Comment)  

* * *

<a name="ContestSignup"></a>

## ContestSignup
Signup page for (currently postponed) project contest. Signing up simply enters the user in the contest,
users still must go to the ContestSubmit page to select a project and finalize the procedure.

**Kind**: global class  

* [ContestSignup](#ContestSignup)
    * [.componentWillMount()](#ContestSignup+componentWillMount)
    * [.formatCPF()](#ContestSignup+formatCPF)
    * [.enterContest()](#ContestSignup+enterContest)


* * *

<a name="ContestSignup+componentWillMount"></a>

### contestSignup.componentWillMount()
On Mount, fetch the profile of the logged in user.

**Kind**: instance method of [<code>ContestSignup</code>](#ContestSignup)  

* * *

<a name="ContestSignup+formatCPF"></a>

### contestSignup.formatCPF()
Formatting rules for Cadastro de Pessoas Físicas

**Kind**: instance method of [<code>ContestSignup</code>](#ContestSignup)  

* * *

<a name="ContestSignup+enterContest"></a>

### contestSignup.enterContest()
Onclick handler that prepares entry payloads to various endpoints. Note that setting school id/ geo id in this
contest entry page also updates the actual profile of the user.

**Kind**: instance method of [<code>ContestSignup</code>](#ContestSignup)  

* * *

<a name="ContestSubmit"></a>

## ContestSubmit
User selects a project for the contest and submits their entry.

**Kind**: global class  

* [ContestSubmit](#ContestSubmit)
    * [.componentDidMount()](#ContestSubmit+componentDidMount)
    * [.submit()](#ContestSubmit+submit)


* * *

<a name="ContestSubmit+componentDidMount"></a>

### contestSubmit.componentDidMount()
On Mount, fetch all the projects of the currently logged-in user, as well as their entry status

**Kind**: instance method of [<code>ContestSubmit</code>](#ContestSubmit)  

* * *

<a name="ContestSubmit+submit"></a>

### contestSubmit.submit()
On Click, prepare contest payload and post it to the endpoint

**Kind**: instance method of [<code>ContestSubmit</code>](#ContestSubmit)  

* * *

<a name="CTA"></a>

## CTA
Call To Action Component, encourage users to sign up after visiting SEO-enable page

**Kind**: global class  

* * *

<a name="Discussion"></a>

## Discussion
Discussion Board wraps a list of threads (which in turn hosts a list of comments). Discussion boards 
currently only apply to slides, but they are designed to be able to apply to anything (projects, codeblocks, etc)

**Kind**: global class  

* [Discussion](#Discussion)
    * [.componentDidUpdate()](#Discussion+componentDidUpdate)
    * [.newThread()](#Discussion+newThread)
    * [.selectSort()](#Discussion+selectSort)


* * *

<a name="Discussion+componentDidUpdate"></a>

### discussion.componentDidUpdate()
When the user changes slides, hit the API endpoind and fetch the new thread data

**Kind**: instance method of [<code>Discussion</code>](#Discussion)  

* * *

<a name="Discussion+newThread"></a>

### discussion.newThread()
Prepare payload and post a new thread to the db

**Kind**: instance method of [<code>Discussion</code>](#Discussion)  

* * *

<a name="Discussion+selectSort"></a>

### discussion.selectSort()
On sort selection, sort the threads in state

**Kind**: instance method of [<code>Discussion</code>](#Discussion)  

* * *

<a name="IslandLink"></a>

## IslandLink
IslandLink is the zoomed-out picture of the island used in the overworld map, lesson plan, etc

**Kind**: global class  

* * *

<a name="Loading"></a>

## Loading
Loading is explicitly used by CANON itself for any page that has canon "needs", which is why this
is a full container page with <clouds>. The LoadingSpinner component was separated out for embedded use (no clouds)

**Kind**: global class  

* * *

<a name="LoadingSpinner"></a>

## LoadingSpinner
Loading spinner for a huge number of components in Codelife, mostly used in render cycles while 
waiting for axios to return with data

**Kind**: global class  

* * *

<a name="LoginForm"></a>

## LoginForm
Works alongside SignUpForm to log users in. Essentially a wrapper for the canon "login" action

**Kind**: global class  

* * *

<a name="LoginForm+onSubmit"></a>

### loginForm.onSubmit()
The login dispatch is mapped to props and called here

**Kind**: instance method of [<code>LoginForm</code>](#LoginForm)  

* * *

<a name="Nav"></a>

## Nav
Nav Component is the header of the page - containing login controls and the Island Browser

**Kind**: global class  

* [Nav](#Nav)
    * [.componentDidMount()](#Nav+componentDidMount)
    * [.reportClick()](#Nav+reportClick)


* * *

<a name="Nav+componentDidMount"></a>

### nav.componentDidMount()
When Nav Mounts, it is almost always because the page/app is being loaded from scratch, either because 
the user is visiting for the first time, OR a login has been attempted, and the result must be handled.
As such, there is a fairly length decision tree here so that feedback can be shown.

**Kind**: instance method of [<code>Nav</code>](#Nav)  

* * *

<a name="Nav+reportClick"></a>

### nav.reportClick()
When the user clicks an island/location in the embedded Browser component, they have chosen to navigate to a
new page. This callback is needed so the Browser's wrapping component (this one) can hide the Browser.

**Kind**: instance method of [<code>Nav</code>](#Nav)  

* * *

<a name="PasswordReset"></a>

## PasswordReset
Wrapper Component for the reset password dispatch action of canon

**Kind**: global class  

* [PasswordReset](#PasswordReset)
    * [.componentDidMount()](#PasswordReset+componentDidMount)
    * [.changePassword()](#PasswordReset+changePassword)
    * [.componentDidUpdate()](#PasswordReset+componentDidUpdate)


* * *

<a name="PasswordReset+componentDidMount"></a>

### passwordReset.componentDidMount()
On Mount, access the URL information from router and grab the token if it is there.

**Kind**: instance method of [<code>PasswordReset</code>](#PasswordReset)  

* * *

<a name="PasswordReset+changePassword"></a>

### passwordReset.changePassword()
Password field change handler, ensure passwords match before submitting dispatch

**Kind**: instance method of [<code>PasswordReset</code>](#PasswordReset)  

* * *

<a name="PasswordReset+componentDidUpdate"></a>

### passwordReset.componentDidUpdate()
Listen for changes to this.props.auth, and show a Toast message that reflects its state

**Kind**: instance method of [<code>PasswordReset</code>](#PasswordReset)  

* * *

<a name="ProjectCard"></a>

## ProjectCard
ProjectCard, similar to CodeBlockCard, is a small visual container with a Dialog popover to showcase projects.
It is used on the Homepage as well as in User Profiles to list their projects

**Kind**: global class  

* [ProjectCard](#ProjectCard)
    * [.toggleDialog()](#ProjectCard+toggleDialog)
    * [.toggleFeature()](#ProjectCard+toggleFeature)
    * [.generateScreenshot()](#ProjectCard+generateScreenshot)
    * [.handleReport()](#ProjectCard+handleReport)


* * *

<a name="ProjectCard+toggleDialog"></a>

### projectCard.toggleDialog()
Project Cards, though small visually, are responsible for containing and controlling their own Dialog
Popover that shows the entirety of the project and its code

**Kind**: instance method of [<code>ProjectCard</code>](#ProjectCard)  

* * *

<a name="ProjectCard+toggleFeature"></a>

### projectCard.toggleFeature()
Admin Only function to promote the given project to featured

**Kind**: instance method of [<code>ProjectCard</code>](#ProjectCard)  

* * *

<a name="ProjectCard+generateScreenshot"></a>

### projectCard.generateScreenshot()
Admin only function to generate a screenshot for this project (usually so it can be featured on the homepage)

**Kind**: instance method of [<code>ProjectCard</code>](#ProjectCard)  

* * *

<a name="ProjectCard+handleReport"></a>

### projectCard.handleReport()
Projects embed a ReportBox to allow for flagging. If a user uses that box to report the content, this
callback notifies its parent (this component) that the project has been reported, so state can be updated

**Kind**: instance method of [<code>ProjectCard</code>](#ProjectCard)  

* * *

<a name="ReportBox"></a>

## ReportBox
ReportBox is a reusable component for reporting threads, comments, projects, and codeblocks for 
inappropriate content. As with many data structures in codelife, it uses a SINGLE reports table, 
with a "type" column that designates which table the report_id refers to.

**Kind**: global class  

* * *

<a name="InputCode"></a>

## InputCode
InputCode is a slide type that requires the student to complete a coding test
The CodeEditor component is embedded with a series of rules, and the slide will 
not unblock until the student submits a passing code section. It is mostly a wrapper
for CodeEditor, with some controls to execute controls or unblock a slide.

**Kind**: global class  

* [InputCode](#InputCode)
    * [.componentDidMount()](#InputCode+componentDidMount)
    * [.componentDidUpdate()](#InputCode+componentDidUpdate)
    * [.setExecState()](#InputCode+setExecState)
    * [.submitAnswer()](#InputCode+submitAnswer)
    * [.resetAnswer()](#InputCode+resetAnswer)
    * [.attemptReset()](#InputCode+attemptReset)
    * [.executeCode()](#InputCode+executeCode)


* * *

<a name="InputCode+componentDidMount"></a>

### inputCode.componentDidMount()
Retrieve the rules and starting code from props and put them into state

**Kind**: instance method of [<code>InputCode</code>](#InputCode)  

* * *

<a name="InputCode+componentDidUpdate"></a>

### inputCode.componentDidUpdate()
If the user changes slides, update the rules

**Kind**: instance method of [<code>InputCode</code>](#InputCode)  

* * *

<a name="InputCode+setExecState"></a>

### inputCode.setExecState()
The Embedded CodeEditor itself knows whether the student has written any javascript
in the editor window. Dynamically show and hide an "execute" button based on this
callback function

**Kind**: instance method of [<code>InputCode</code>](#InputCode)  

* * *

<a name="InputCode+submitAnswer"></a>

### inputCode.submitAnswer()
Attempt to submit the current code state on click. Requires reaching into the 
wrapped CodeEditor instance itself to call a public function, isPassing,
which is managed by the CodeEditor. If the student passes, inform the parent 
Slide component that this slide is unblocked and the student can continue

**Kind**: instance method of [<code>InputCode</code>](#InputCode)  

* * *

<a name="InputCode+resetAnswer"></a>

### inputCode.resetAnswer()
Reset CodeEditor to original testing state, again by reaching into the CodeEditor 
instance itself and setting contents via a public method.

**Kind**: instance method of [<code>InputCode</code>](#InputCode)  

* * *

<a name="InputCode+attemptReset"></a>

### inputCode.attemptReset()
Display Are you sure? Dialog

**Kind**: instance method of [<code>InputCode</code>](#InputCode)  

* * *

<a name="InputCode+executeCode"></a>

### inputCode.executeCode()
Reach into the codeEditor and trigger javascript execution.

**Kind**: instance method of [<code>InputCode</code>](#InputCode)  

* * *

<a name="Quiz"></a>

## Quiz
Quiz is a blocking multiple-choice question, powered by the quizjson column in the slides db

**Kind**: global class  

* [Quiz](#Quiz)
    * [.onChooseAnswer()](#Quiz+onChooseAnswer)
    * [.componentDidMount()](#Quiz+componentDidMount)
    * [.componentDidUpdate()](#Quiz+componentDidUpdate)


* * *

<a name="Quiz+onChooseAnswer"></a>

### quiz.onChooseAnswer()
Callback for clicking an answer. Check ths JSON, and unblock the parent Slide if correct

**Kind**: instance method of [<code>Quiz</code>](#Quiz)  

* * *

<a name="Quiz+componentDidMount"></a>

### quiz.componentDidMount()
On Mount, populate the quiz prompt from props

**Kind**: instance method of [<code>Quiz</code>](#Quiz)  

* * *

<a name="Quiz+componentDidUpdate"></a>

### quiz.componentDidUpdate()
When the user changes slides, update the quizjson in state.

**Kind**: instance method of [<code>Quiz</code>](#Quiz)  

* * *

<a name="RenderCode"></a>

## RenderCode
RenderCode is similar to InputCode, but the CodeEditor is in readonly mode
For showing code examples with explanations.

**Kind**: global class  

* [RenderCode](#RenderCode)
    * [.setExecState()](#RenderCode+setExecState)
    * [.executeCode()](#RenderCode+executeCode)


* * *

<a name="RenderCode+setExecState"></a>

### renderCode.setExecState()
Callback for CodeEditor, when it reports that the student is using javascript,
show an exec button on this slide.

**Kind**: instance method of [<code>RenderCode</code>](#RenderCode)  

* * *

<a name="RenderCode+executeCode"></a>

### renderCode.executeCode()
When the execute button is clicked, pass the command down to the public method in CodeEditor

**Kind**: instance method of [<code>RenderCode</code>](#RenderCode)  

* * *

<a name="TextImage"></a>

## TextImage
TextImage is text left, image right. Images are stored in /slide_images/{id}.jpg
Images are uploaded through the CMS and a translated version is chosen here via locales

**Kind**: global class  

* * *

<a name="Island"></a>

## Island
Displays all available islands

**Kind**: global class  

* [Island](#Island)
    * [.componentDidMount()](#Island+componentDidMount)
    * [.hasUserCompleted(milestone)](#Island+hasUserCompleted) ⇒ <code>Boolean</code>


* * *

<a name="Island+componentDidMount"></a>

### island.componentDidMount()
On mount, fetch the progress for the currently logged in user.

**Kind**: instance method of [<code>Island</code>](#Island)  

* * *

<a name="Island+hasUserCompleted"></a>

### island.hasUserCompleted(milestone) ⇒ <code>Boolean</code>
On mount, fetch the progress for the currently logged in user.

**Kind**: instance method of [<code>Island</code>](#Island)  
**Returns**: <code>Boolean</code> - Returns a boolean whether or not the user has completed the provided island ID.  

| Param | Type | Description |
| --- | --- | --- |
| milestone | <code>String</code> | An island ID. |


* * *

<a name="Profile"></a>

## Profile
Class component for a user profile.
This is a public page and meant to be shared.
If a user is logged in AND this is their profile, show an
edit button allowing them to edit it.

**Kind**: global class  

* [Profile](#Profile)
    * [new Profile(loading, error, profileUser)](#new_Profile_new)
    * [.componentDidMount()](#Profile+componentDidMount)
    * [.render()](#Profile+render)


* * *

<a name="new_Profile_new"></a>

### new Profile(loading, error, profileUser)
Creates the Profile component with its initial state.


| Param | Type | Description |
| --- | --- | --- |
| loading | <code>boolean</code> | true by defaults gets flipped post AJAX. |
| error | <code>string</code> | Gets set if no username matches username URL param. |
| profileUser | <code>object</code> | Gets set to full user object from DB. |


* * *

<a name="Profile+componentDidMount"></a>

### profile.componentDidMount()
Grabs username from URL param, makes AJAX call to server and sets error
state (if no user is found) or profileUser (if one is).

**Kind**: instance method of [<code>Profile</code>](#Profile)  

* * *

<a name="Profile+render"></a>

### profile.render()
3 render states:
case (loading)
 - show loading
case (error)
 - show error msg from server
case (user found)
 - user info

**Kind**: instance method of [<code>Profile</code>](#Profile)  

* * *

<a name="UserCodeBlocks"></a>

## UserCodeBlocks
Class component for displaying lists of user's snippets.
This is shown on the public profile for a user and requires sending
1 prop: a ref to the user

**Kind**: global class  

* [UserCodeBlocks](#UserCodeBlocks)
    * [new UserCodeBlocks(loading, snippets)](#new_UserCodeBlocks_new)
    * [.componentDidMount()](#UserCodeBlocks+componentDidMount)


* * *

<a name="new_UserCodeBlocks_new"></a>

### new UserCodeBlocks(loading, snippets)
Creates the UserSnippets component with initial state.


| Param | Type | Description |
| --- | --- | --- |
| loading | <code>boolean</code> | true by defaults gets flipped post AJAX. |
| snippets | <code>array</code> | Gets set by AJAX call from DB call. |


* * *

<a name="UserCodeBlocks+componentDidMount"></a>

### userCodeBlocks.componentDidMount()
Grabs user id from user prop, makes AJAX call to server and returns
the list of snippets.

**Kind**: instance method of [<code>UserCodeBlocks</code>](#UserCodeBlocks)  

* * *

<a name="UserProjects"></a>

## UserProjects
Class component for displaying lists of user's projects.
This is shown on the public profile for a user and requires sending
1 prop: a ref to the user

**Kind**: global class  

* [UserProjects](#UserProjects)
    * [new UserProjects(loading, projects)](#new_UserProjects_new)
    * [.componentDidMount()](#UserProjects+componentDidMount)


* * *

<a name="new_UserProjects_new"></a>

### new UserProjects(loading, projects)
Creates the UserProjects component with initial state.


| Param | Type | Description |
| --- | --- | --- |
| loading | <code>boolean</code> | true by defaults gets flipped post AJAX. |
| projects | <code>array</code> | Gets set by AJAX call from DB call. |


* * *

<a name="UserProjects+componentDidMount"></a>

### userProjects.componentDidMount()
Grabs user id from user prop, makes AJAX call to server and returns
the list of projects.

**Kind**: instance method of [<code>UserProjects</code>](#UserProjects)  

* * *

<a name="UsersList"></a>

## UsersList
Class component for displaying lists of user's snippets.
This is shown on the public profile for a user and requires sending
1 prop: a ref to the user

**Kind**: global class  

* [UsersList](#UsersList)
    * [new UsersList(loading, snippets)](#new_UsersList_new)
    * [.componentDidMount()](#UsersList+componentDidMount)


* * *

<a name="new_UsersList_new"></a>

### new UsersList(loading, snippets)
Creates the UserSnippets component with initial state.


| Param | Type | Description |
| --- | --- | --- |
| loading | <code>boolean</code> | true by defaults gets flipped post AJAX. |
| snippets | <code>array</code> | Gets set by AJAX call from DB call. |


* * *

<a name="UsersList+componentDidMount"></a>

### usersList.componentDidMount()
Grabs user id from user prop, makes AJAX call to server and returns
the list of snippets.

**Kind**: instance method of [<code>UsersList</code>](#UsersList)  

* * *

<a name="threadInclude"></a>

## threadInclude
threadsRoute is used for retrieving threads and their associated comments.
Unlike islands, likes, and many of the other earlier data structures in development,
threads make better use of Sequelize associations, implicitly including comments in the
thread payloads they belong to. This is distinctly different from islands/levels/slides,
which get entire lists from the tables and then compile them client side. Going forward,
the hierarchical/sequelize-association method of delivering API data (without flattening)
is the more correct one.
Threads have entity_ids and types. Currently the only two types are comments and threads,
however the intention was that discussions could expand to encompass projects/codeblocks or more

**Kind**: global constant  

* * *

<a name="flattenCodeBlock"></a>

## flattenCodeBlock(user, cb) ⇒ <code>Object</code>
Given the logged-in user and a codeblock, this function "flattens" the object by reaching
into the associated tables queries (such as reports and likes) and bubbling them up to a top-level prop
This type of function is really only used here and in projectsRoute.  As codelife development progressed,
the pattern shifted more to expect the nested nature of sequelize queries, meaning flattening wasn't necessary.

**Kind**: global function  
**Returns**: <code>Object</code> - The "flattened" codeblock, ready to be returned to the requester  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>string</code> | The currently logged in user, as specified by datawheel-canon |
| cb | <code>Object</code> | The codeblock to flatten |


* * *

<a name="strip"></a>

## strip()
This route is specifically for the canon "needs" version of the glossary
It has a lang switch because the glossary needs to be rendered server side
for SEO optimization.

**Kind**: global function  

* * *

<a name="flattenProfile"></a>

## flattenProfile(user, p)
Similar to codeblocksroute, earlier in the project a lot of work was done to keep 
the payloads returned by APIs as flat objects. Later routes trended more towards trusting
sequelize to form the hierarchy via associations. This helper function bubbles up associations
into top-level properties.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | The logged in user |
| p | <code>Object</code> | the profile to flatten |


* * *

<a name="flattenProject"></a>

## flattenProject(user, p) ⇒ <code>Object</code>
Given the logged-in user and a project, this function "flattens" the object by reaching
into the associated tables queries (such as reports and likes) and bubbling them up to a top-level prop
This type of function is really only used here and in codeblocksroute.  As codelife development progressed,
the pattern shifted more to expect the nested nature of sequelize queries, meaning flattening wasn't necessary.

**Kind**: global function  
**Returns**: <code>Object</code> - The "flattened" project, ready to be returned to the requester  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>string</code> | The currently logged in user, as specified by datawheel-canon |
| p | <code>Object</code> | The project to flatten |


* * *

<a name="pruneThread"></a>

## pruneThread(user, t) ⇒ <code>Object</code>
Given a user and a thread, prepare the thread to be returned to the requester.
This involves a number of operations, including collating likes and reports, rewriting
banned content, and deleting certain sensitive keys so they don't leak out through the API

**Kind**: global function  
**Returns**: <code>Object</code> - the pruned thread  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | The logged-in user |
| t | <code>Object</code> | the Thread to be pruned |


* * *

