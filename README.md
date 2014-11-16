Nmap-ElasticSearch
==================

Frontend to import Nmap Scan in ES, and frontend to make search 


Scanner: 
========

Python script to run nmap and import in ElasticSearch. 
Initial conf : edit scanner.py

1. Configure elasticsearch host
ESHOST= ['host1','host2'] 
2. Configure elasticSearch index name
ESINDEX="nmap"
3. set port to scan
ports="5900,6667,5984,1352,873,993,995,1080,636,465,1521,1433,80,443,1443,1080,2443,2080,3443,3080,4443,4080,5443,5080,6443,6080,7443,7080,8443,8080,9443,9080,10443,10080,11443,11080,12443,12080,13443,13080,14443,14080,15443,15080,16443,16080,17443,17080,18443,18080,1521,3306,3389,5432,6667,389,110,53,23,25,22,21,3128"
4. Configure Nmap options
nmops = "-O -sV -T4"

Now, put all subnet to scan in the file subnet.ip :
10.0.0.0/24
192.168.0.0/28
...

And run ./scan

Frontend:
=========

Edit js/app.js: 
1. Set Elastic Host (complete path if the script is hosted on another server than ES)
ElasticHost="/es/"
2. Set index / type
ElasticIndex="nmap/hosts/"

You can install this frontend where you want, it only uses JS (angularJS).

For my own purpose, I use a nginx web server hosting the frontend, and with a proxy pass that redirects every ES request to the ES cluster. 
Then, I securize the all by an HTTP authentication. 
   
    location / {
        index  index.html index.htm;
        auth_basic "Restricted";
        auth_basic_user_file /var/nginx/.htpasswd;

    }

    location /es/ {
        proxy_pass http://ESHOST:9200/;
        auth_basic "Restricted";
        auth_basic_user_file /var/nginx/.htpasswd;
    }






