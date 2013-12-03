# still cannot handle removing the last empty line 
#this file remove the last column from csv, and format the timestamp column as the same as the stock data time.
import os
import csv
import re

def fromTimeStampToTime(str):
  dates = str.split(' ')[0].split('/')
  return '-'.join([dates[2],dates[0],dates[1]])

fInPath = './Map__Crime_Incidents_-_Previous_Three_Months.csv'
fOutPath = './Map__Crime_Incidents_-_Previous_Three_Months_clean.csv'

fIn = open(fInPath, 'r')
lines = csv.reader(fIn, delimiter=',')
if os.path.isfile(fOutPath):
  print fOutPath + 'exists!'
else:
  with open(fOutPath, 'a') as fOut:
    csvOut = csv.writer(fOut, delimiter=',')
    for index,line in enumerate(lines):
      if (line[0] != '\n'):
        if index == 0:
          csvOut.writerow(line)
        else:
          newRow = line[0:11]
          if index > 2:
            newRow[4] = fromTimeStampToTime(newRow[4])
          csvOut.writerow(newRow)

fIn.close()