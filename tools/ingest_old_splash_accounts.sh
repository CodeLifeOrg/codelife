# The following are a set of commands to run in the terminal to pipe
# data from the previous DB (splash page) to the current live DB

# Output user data to a users.sql file
psql codelife -h $CANON_DB_HOST -U $CANON_DB_USER -c \
"\copy (SELECT id, username, email, name, password, salt, twitter, facebook, instagram, \"createdAt\", \"updatedAt\" FROM \"Users\") TO STDOUT" > users.csv

# Ingest users.sql to format of live DB users table
psql codelife -h $CANON_DB_HOST -U $CANON_DB_USER -c "\copy users (id, username, email, name, password, salt, twitter, facebook, instagram, \"createdAt\", \"updatedAt\") FROM 'users.csv' DELIMITER E'\t'"

# Output user data to a userprofiles.sql file
psql codelife -h $CANON_DB_HOST -U $CANON_DB_USER -c \
"\copy (SELECT id, profile->>'about' as bio, CASE gender::text WHEN 'male' THEN 'MALE' WHEN 'female' THEN 'FEMALE' WHEN 'na' THEN 'OTHER' ELSE NULL END as gender, survey, \"getInvolved\" as getinvolved, profile->>'homeGeo' as gid, profile->>'school' as sid, dob, profile->>'cpf' as cpf FROM \"Users\") TO STDOUT" > userprofiles.csv

# Ingest userprofiles.sql to format of live DB userprofiles table
psql codelife -h $CANON_DB_HOST -U $CANON_DB_USER -c "\copy userprofiles (uid, bio, gender, survey, getinvolved, gid, sid, dob, cpf) FROM 'userprofiles.csv' DELIMITER E'\t'"
