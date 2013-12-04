# import urllib2
# fin = open('rawcsv/stockdata/stockdata.csv')
# fin.read()

#clean and merge data in one csv 
from os import listdir
from os.path import isfile, join
mypath = './USstockHistory167Mb/'
onlyfiles = [ f for f in listdir(mypath) if isfile(join(mypath,f)) and f[-3:] == 'csv'  ]

# for f in onlyfiles:
# 	fin = open(mypath + f)

ticker = 'blh'

foutfinal = open('./USstockHistory167Mb_output/stockdata.csv', 'w')
foutmeta = open('./USstockHistory167Mb_output/stockdatameta.csv', 'w')

def firstheader(line):
	global ticker
	start = line.index('[') + 1
	end = line.index(']')
	ticker = line[start:end]
	foutmeta.write(line) # get the stock ticker and description
	foutfinal.write('stockdata_84_06_eod' + '\n')

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

def findTicker(line):
	global ticker
	start = line.index('[') + 1
	end = line.index(']')
	ticker = line[start:end]


for index,f in enumerate(onlyfiles):
	fin = open(mypath + onlyfiles[index], 'r')
	if index == 0:
		firstheader(fin.readline())
		secondheader(fin.readline())
	else:
		findTicker(fin.readline())
		fin.next()
	for line in fin:
		foutfinal.write(ticker + ',' + line)
	fin.close()





# fin = open()
# print onlyfiles
