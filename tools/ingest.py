#DEPRECATED / OUTDATED ingestion script - predates CMS. Used to ingest from google doc to db.

import pandas as pd
from sqlalchemy import create_engine
import os, math, json

lessons_url = 'https://docs.google.com/spreadsheets/d/19inRDZny2tFUgGoI5e94MT5dBUtnGx5eTlL2TXeKyA4/pub?output=csv&gid=0&chrome=false'
minilessons_url = 'https://docs.google.com/spreadsheets/d/19inRDZny2tFUgGoI5e94MT5dBUtnGx5eTlL2TXeKyA4/pub?output=csv&gid=1777054873&chrome=false'
slides_url = 'https://docs.google.com/spreadsheets/d/19inRDZny2tFUgGoI5e94MT5dBUtnGx5eTlL2TXeKyA4/pub?output=csv&gid=1392839100&chrome=false'

name = os.environ.get('CANON_DB_NAME')
pw = os.environ.get('CANON_DB_PW')
user = os.environ.get('CANON_DB_USER')
host = os.environ.get('CANON_DB_HOST')

link = 'postgresql://' + user + ":" + pw + "@" + host + "/" + name

engine = create_engine(link)

lessons_df = pd.read_csv(lessons_url)

minilessons_df = pd.read_csv(minilessons_url)

errors = 0
slides_df = pd.read_csv(slides_url)
for index, row in slides_df.iterrows():
  if type(row['quizjson']) == str:
    try: 
      json.loads(row['quizjson'])
    except:
      print("JSON error in " + row['id'])
      errors = errors + 1
  if type(row['rulejson']) == str:
    try: 
      json.loads(row['rulejson'])
    except:
      print("JSON error in " + row['id'])
      errors = errors + 1
  if type(row['pt_quizjson']) == str:
    try: 
      json.loads(row['pt_quizjson'])
    except:
      print("JSON error in " + row['id'])
      errors = errors + 1
  if type(row['pt_rulejson']) == str:
    try: 
      json.loads(row['pt_rulejson'])
    except:
      print("JSON error in " + row['id'])
      errors = errors + 1


if errors == 0:
  print("no errors detected, uploading")
  lessons_df.to_sql('lessons', con=engine, if_exists='replace')
  minilessons_df.to_sql('minilessons', con=engine, if_exists='replace')
  slides_df.to_sql('slides', con=engine, if_exists='replace')
else:
  print("\nTotal Errors: " + str(errors))
  print("\nPlease correct these before running ingest again")
    

