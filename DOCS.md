## Classes

<dl>
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
On mount, fetch the codeblocks and progress for the currently logged in user.

**Kind**: instance method of [<code>Island</code>](#Island)  

* * *

<a name="Island+hasUserCompleted"></a>

### island.hasUserCompleted(milestone) ⇒ <code>Boolean</code>
On mount, fetch the codeblocks and progress for the currently logged in user.

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
    * [.componentWillMount()](#Profile+componentWillMount)
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

<a name="Profile+componentWillMount"></a>

### profile.componentWillMount()
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

