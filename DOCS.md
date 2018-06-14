## Classes

<dl>
<dt><a href="#CodeEditor">CodeEditor</a></dt>
<dd><p>CodeEditor is a two-panel rendering component for student code.
It uses AceEditor for the student panel (left), and a remote rendering iframe for the page preview (right).</p>
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

