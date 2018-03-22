DB Operations

The columns that Codelife Search uses depend on trigrams.  More information is available here:

https://www.postgresql.org/docs/9.1/static/pgtrgm.html

This enables search operations with the SQL command `LIKE` to be more performant.

First, enable the trigram extension:

```
CREATE EXTENSION pg_trgm;
```

Then, create an index on the column.  Here are two examples from what CodeLife currently searches: 

```
CREATE INDEX users_on_username_idx ON users USING GIN(username gin_trgm_ops);
```

```
CREATE INDEX projects_on_name_idx ON projects USING GIN(name gin_trgm_ops);
```