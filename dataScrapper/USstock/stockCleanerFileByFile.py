# import urllib2
# fin = open('rawcsv/stockdata/stockdata.csv')
# fin.read()

#clean and merge data in one csv 
from os import listdir
from os.path import isfile, join
# mypath = './USstockHistory167Mb/'
mypath = './USstockHistory167Mb/'
onlyfiles = [ f for f in listdir(mypath) if isfile(join(mypath,f)) and f[-3:] == 'csv'  ]
# for f in onlyfiles:
# 	fin = open(mypath + f)

outputFolder = './USstockHistory167Mb_output/'

foutmeta = open(outputFolder + 'stockdatameta.csv', 'a')

def firstheader(line):
	start = line.index('[') + 1
	end = line.index(']')
	ticker = line[start:end]
	foutmeta.write(line) # get the stock ticker and description
	foutfinal.write('stockdata_84_06_eod' + '\n')
	return ticker

def secondheader(line):
	csvlist = line.replace('# ', '').split(' ')
	csvlist.insert(0, 'TICKER')
	csvlist.insert(3, 'CLOSE')
	csvline = ','.join(csvlist)
	foutfinal.write(csvline)
	foutmeta.write(csvline) # get column names
	foutfinal.write('VARCHAR(10),DATE')
	for i in xrange(len(csvlist) - 2):
		foutfinal.write(',FLOAT4')
	foutfinal.write('\n')

for f in onlyfiles:
  fin = open(mypath + f, 'r')
  lines = fin.readlines()
  fOutPath = outputFolder + f
  ticker = ''
  if isfile(fOutPath):
  	print fOutPath + 'exists!'
  else:
	  with open(fOutPath, 'a') as foutfinal:
		  for index,line in enumerate(lines):
		  	if index == 0:
		  		ticker = firstheader(line)
		  		print ticker
		  	elif index == 1:
		  		secondheader(line)
		  	else:
		  		if index == len(lines) - 1:
		  			foutfinal.write(ticker+','+line.rstrip('\n'))
		  		else:
			  		foutfinal.write(ticker+','+line)
  fin.close()
