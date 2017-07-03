# codelife db models

## main tables

Anything with a ? means I'm considering whether it's better to:
- Store relationships in JSON directly in a DB Column (seen here in ? columns)
- Store relationships in RDBMS relational tables (seen below under relational tables)

**users** - *logins from ig/fb*

| id | username | email | name | password | salt | twitter | facebook | instagram | createdAt | updatedAt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PK | | | | | | | | | | | |

---

**userprofiles** - *holds user profiles and progress*

| id | bio | picblob | currentlesson | *completed_list (?)* | user_id *(users.id)* |
| --- | --- | --- | --- | --- | --- |
| PK | | |  | JSON object (?) | FK |

---

**metadata** - *top-level table for introductory text and site-wide copy*

*__note__: we could also bake this in to the top-level html*

| id | name | htmlcontent |
| --- | --- | --- |
| PK | | |

---

**snippets** - *user-created snippets. one per lesson/island per user*

| id | name | htmlcontent | previewblob | lesson_id *(lessons.id)* | user_id *(users.id)* |
| --- | --- | --- | --- | --- | --- |
| PK | | | rendered on save | FK | FK |

---

**lessons** - *also known as islands. each lesson has several mini-lessons*

| id | name | description | *minilesson_list (?) * |
| --- | --- | --- | --- |
| PK | | |  JSON object (?) |

---

**minilessons** - *also known as moons. each minilesson has several slides*

| id | name | description | *slide_list (?)*
| --- | --- | --- |  --- |
| PK | | | JSON object (?) |

---

**slides** - *minilessons have slides, which can be text, mult choice, quiz, etc*

| id | type | title | htmlcontent | imgblob | quizjson | rulejson |
| --- | --- | --- | --- | --- | --- | --- |
| PK |  | | | | JSON object | JSON object |

---

**projects** - *final projects, one per user*

| id | name | htmlcontent | previewblob | user_id *(users.id)* |
| --- | --- | --- | --- | --- |
| PK | | | generated on save | FK |

---

## relational tables
Thoughts here - There are two ways to do this
- use the "list" option above (minilesson_list, slide_list) to manage relations
  - pro: easier to quickly edit JSON in place to manage ownership and ordering
  - con: not exactly correct from a RDBMS standpoint
- use relational tables
  - pro: queries like "this slide belongs to which lesson" is easy
  - con: more complex to maintain, requires relational tables (below)

**lessons_minilessons** - *one lesson has many minilessons*

| id | lid *(lessons.id)* | mlid *(minilessons.id)* |
| --- | --- | --- |
| PK | FK | FK |

**minilessons_slides** - *one minilesson has many slides*

| id | mlid *(minilessons.id)* | sid *(slides.id)* |
| --- | --- | --- |
| PK | FK | FK |

**user_completedlessons** - *one user has many completed minilessons*

| id | user_id *(users.id)* | mlid *(minilessons.id)* |
| --- | --- | --- |
| PK | FK | FK |
