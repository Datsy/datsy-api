from time import time, sleep
import psycopg2
import re
import os, sys
import csv
# credentials = require('./dbconfig.json').db;
# conString = "postgres://"+credentials.user+":" +credentials.password+ "@" + credentials.localhost + "/" + credentials.dbname;

rowlimit = 500

table = {}
table['col_values'] = []

def queryDB(Qstring):
  try:
      con = psycopg2.connect("dbname='postgres' user='masterofdata' host='137.135.14.92' password='gj1h23gnbfsjdhfg234234kjhskdfjhsdfKJHsdf234' port='5432'")
  except:
      print "I am unable to connect to the database"
  cur = con.cursor()
  try:
      cur.execute(Qstring)
      con.commit()
  except psycopg2.DatabaseError, e:
      if con:
          con.rollback()
      print 'Error %s' % e
      sys.exit(1)
  finally:
      if con:
          con.close()

file = open('../../dataScrapper/sfGov/Map__Crime_Incidents_-_Previous_Three_Months_clean.csv')
fin = csv.reader(file, delimiter=',')
# each item in fin is an array,delimited by ','

# def timeconsumingfunc(list):
#   sleep(5)

def createQString():
  createQS = 'CREATE TABLE IF NOT EXISTS '+ table['tablename'] +' ('
  for i in xrange(table['num_col']):
    createQS += table['col_names'][i] + ' ' + table['col_types'][i]
    if i < table['num_col'] - 1: createQS += ','
  createQS += ');'
  queryDB(createQS)

def insertQString():
  insertQS = 'INSERT INTO ' + table['tablename'] + ' (' + ', '.join(table['col_names']) + ')' + ' VALUES '

  for i in xrange(len(table['col_values'])):
    insertQS += ' (\''
    items = table['col_values'][i]
    for item in items:
      item = re.sub('[^?!\w\-\.\",&:\s/]', '', item)
    insertQS += ('\',\'').join(items)
    insertQS += '\')';

    if i < len(table['col_values']) - 1:
      insertQS += ',';
  insertQS = re.sub('\'\'', 'null', insertQS);
  insertQS += ';'
  queryDB(insertQS)

# fin.readline()
count = 0
for line in fin:
  if count == 0:
    table['tablename'] = line[0].replace('\r\n', '')
  elif count == 1:
    table['col_names'] = line
  elif count == 2:
    table['col_types'] = line
    table['num_col'] = len(table['col_types'])
    createQString()
  else:
    table['col_values'].append(line)
  # print table
    if (count-3) % rowlimit == 0:
      print "INSERT STARTING FROM "  + str(count - 3)
      insertQString()
      # timeconsumingfunc(table['col_values'])
      table['col_values'] = []
  count += 1

if len(table['col_values']) > 0:
  print "INSERT STARTING FROM "  + str(count - 3 - len(table['col_values']))
  insertQString() # takes care of the extra n inserts

print 'DONE!!! total inserted ' + str(count-3) + ' rows'

