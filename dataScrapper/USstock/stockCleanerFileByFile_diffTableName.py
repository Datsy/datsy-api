# import urllib2
# fin = open('rawcsv/stockdata/stockdata.csv')
# fin.read()

#clean and transport stock raw data from multiple csv into respective multiple csv files 
from os import listdir
from os.path import isfile, join
mypath = './USstockHistory167Mb/'
onlyfiles = [ f for f in listdir(mypath) if isfile(join(mypath,f)) and f[-3:] == 'csv'  ]
# for f in onlyfiles:
# 	fin = open(mypath + f)

outputFolder = './USstockHistory167Mb_output_diffTableName1/'

foutmeta = open(outputFolder + 'stockdatameta.csv', 'a')

def firstheader(line, startDate, endDate):
	start = line.index('[') + 1
	end = line.index(']')
	ticker = line[start:end]
	 # get the stock ticker and description
	stockstart = line.index('#') + 2
	metadata = line[stockstart:line.index('[')-1]
	print metadata
	foutfinal.write('StockName_' + metadata + '__ticker_' + ticker + '__startDate_' + startDate + '__endDate_' + endDate + '__eod\n')
	return ticker

def secondheader(line):
	csvlist = line.replace('# ', '').split(' ')
	csvlist.insert(3, 'CLOSE')
	csvline = ','.join(csvlist)
	foutfinal.write(csvline)
	foutmeta.write(csvline) # get column names
	foutfinal.write('DATE')
	for i in xrange(len(csvlist) - 1):
		foutfinal.write(',FLOAT4')
	foutfinal.write('\n')

for f in onlyfiles:
  fin = open(mypath + f, 'r')
  lines = fin.readlines()
  startDate = lines[2].split(',')[0]
  endDate = lines[len(lines)-1].split(',')[0]
  fOutPath = outputFolder + f
  ticker = ''
  if isfile(fOutPath):
  	print fOutPath + 'exists!'
  else:
	  with open(fOutPath, 'a') as foutfinal:
		  for index,line in enumerate(lines):
		  	if index == 0:
		  		ticker = firstheader(line, startDate, endDate)
		  		print ticker
		  	elif index == 1:
		  		secondheader(line)
		  	elif line[0:4] != '0000':
		  		if index == len(lines) - 1:
		  			foutfinal.write(line.rstrip('\n'))
		  		else:
			  		foutfinal.write(line)
		  	else:
			  	continue
  fin.close()
