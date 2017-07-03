### codelife db models

**users** - *logins from ig/fb*

| id | username | email | name | password | salt | twitter | facebook | instagram | createdAt | updatedAt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PK | | | | | | | | | | |

---

**snippets** - *user-created snippets. one per lesson per user*

| id | name | htmlcontent | lesson_id *(lessons.id)* | user_id *(users.id)* | 
| --- | --- | --- | --- | --- |
| PK | --- | --- | FK | FK |

---

**lessons** - *also known as islands. each lesson has several mini-lessons*

| id | name | description | 
| --- | --- | --- | 
| PK | --- | --- |

---

**minilessons** - *also known as moons. each minilesson has several slides*

| id | name | description | 
| --- | --- | --- | 
| PK | --- | --- |