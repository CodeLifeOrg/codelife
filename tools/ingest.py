import pandas as pd
from sqlalchemy import create_engine

lessons_url = 'https://docs.google.com/spreadsheets/d/19inRDZny2tFUgGoI5e94MT5dBUtnGx5eTlL2TXeKyA4/pub?output=csv&gid=0&chrome=false'
minilessons_url = 'https://docs.google.com/spreadsheets/d/19inRDZny2tFUgGoI5e94MT5dBUtnGx5eTlL2TXeKyA4/pub?output=csv&gid=1777054873&chrome=false'
slides_url = 'https://docs.google.com/spreadsheets/d/19inRDZny2tFUgGoI5e94MT5dBUtnGx5eTlL2TXeKyA4/pub?output=csv&gid=1392839100&chrome=false'

engine = create_engine('postgresql://localhost/jimmy')

lessons_df = pd.read_csv(lessons_url)
lessons_df.to_sql('lessons', con=engine, if_exists='replace')

minilessons_df = pd.read_csv(minilessons_url)
minilessons_df.to_sql('minilessons', con=engine, if_exists='replace')

slides_df = pd.read_csv(slides_url)
slides_df.to_sql('slides', con=engine, if_exists='replace')