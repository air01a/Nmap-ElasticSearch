#!/usr/bin/python
#Author : air01a@yahoo.fr

from elasticsearch import Elasticsearch
import nmap
import optparse
import json
import sys

ESHOST= ['host1','host2']
ports="5900,6667,5984,1352,873,993,995,1080,636,465,1521,1433,80,443,1443,1080,2443,2080,3443,3080,4443,4080,5443,5080,6443,6080,7443,7080,8443,8080,9443,9080,10443,10080,11443,11080,12443,12080,13443,13080,14443,14080,15443,15080,16443,16080,17443,17080,18443,18080,1521,3306,3389,5432,6667,389,110,53,23,25,22,21,3128"
nmops = "-O -sV -T4"


def callback_result(host, scan_result):
	print '------------------'
	print host, scan_result


if (len(sys.argv)!=2):
	print "Usage : %s subnet" % sys.argv[0]
	sys.exit(1)

range=sys.argv[1]

es = Elasticsearch(
    ESHOST,
    sniff_on_start=True,
    sniff_on_connection_fail=True,
    sniffer_timeout=60
)

nm = nmap.PortScanner()
nm.scan(hosts=range, ports=ports, arguments=nmops)
print "Executing command %s" % nm.command_line()

for host in nm.all_hosts():
	try:
		status=nm[host]['status']['state']
		ip=nm[host]['addresses']['ipv4']
		hostname=nm[host]['hostname']
		services=[]
		servicesAvailable=[]
		if ('tcp' in nm[host].keys()):
			for service in nm[host]['tcp']:
				line=nm[host]['tcp'][service]
				services.append(line['product'])
				servicesAvailable.append(service)
		if ('osmatch' in nm[host].keys()):
			osmatch=nm[host]['osmatch'][0]['name']
			osaccuracy=nm[host]['osmatch'][0]['accuracy']
		else:
			if 'osclass' in nm[host].keys():
				osmatch=nm[host]['osclass'][0]['vendor']+" "+nm[host]['osclass'][0]['osfamily']
				osaccuracy='50'
			else:
				osmatch="unknown"
				osaccuracy='0'

		output={'status':status,'ip':ip,'hostname':hostname,'services':services,'servicesAvailable':servicesAvailable,'os':osmatch,'osAccuracy':osaccuracy,'source':nm[host]}
		res = es.index(index="nmap_20141110",doc_type='hosts',id=host,body=json.dumps(output))
        	if (not res['created']):
			print "Error creating host : %s" % (host)
	except:
		print "Error with host %s" % host
