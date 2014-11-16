ElasticHost="/es/"
ElasticIndex="nmap/hosts/"
ElasticPath=ElasticHost + ElasticIndex

angular.module('nmap', ['ngDialog'])
	.controller('NmapCtrl', function($scope,$http, ngDialog) {
		$scope.search='';
		$scope.size=0;
		$scope.start=0;
		$scope.hosts=[];
		$scope.link=[];
		$scope.home=1;
		$scope.maxResult=1000;
		$scope.service=null;		

		$scope.resetLink = function() {
			$('#lHome').removeClass('current');
			$('#lList').removeClass('current');
		}

		$scope.setHome = function() {
			$scope.home=1;
			$scope.resetLink();
			$('#lHome').addClass('current');	
		}
		$scope.setList = function() {
			$scope.home=0;
                        $scope.resetLink();
                        $('#lList').addClass('current');
			if ($scope.service==null)
				$scope.getService();
		}
	
		$scope.getService = function() {
                        query={"fields" : ["services"],size:1000}

                        $http.post(ElasticPath+"_search",query)
                                .then(function(res) {
					$scope.services=[]
                                        console.log(res.data);
					size=res.data.hits.hits.length;
					for(var i=0;i<size;i++) {
						if (typeof res.data.hits.hits[i].fields!== 'undefined')
						{
							var srv=res.data.hits.hits[i].fields.services
							for(var j=0;j<srv.length;j++)
								if ($scope.services.indexOf(srv[j])==-1)
									$scope.services.push(srv[j]);
						}
					}
					console.log($scope.services);

                                });

		}

		$scope.exportCsv = function() {
			var csvRows=[];
                        for(var i=0; i<$scope.exportData.length;i++)
                        	csvRows.push($scope.exportData[i]._id+";"+$scope.exportData[i]._source.hostname)
                        var csvString = csvRows.join("<br />\n");
                        console.log(csvString);
                        var csvWin = window.open("","","");
                        csvWin.document.write('<meta name="content-type" content="text/csv">');
                        csvWin.document.write('<meta name="content-disposition" content="attachment;  filename=data.csv">  ');
                        csvWin.document.write(csvString);
		}

		$scope.exportSearch = function() {
			$scope.dialogid=ngDialog.open({ template: 'modalid',className: 'ngdialog-theme-default',scope:$scope });
			if ($scope.search!="") {
                        	query=  { "query": { "filtered": { "query": { "bool": { "should": [ { "query_string": { "query": $scope.search } } ] } } } }, size: 10000 }
                        	} else
                                	query={size:10000}

                        $http.post(ElasticPath+"_search",query)
                                .then(function(res) {
                                        $scope.exportSize=res.data.hits.total;
                                        $scope.exportData=res.data.hits.hits;

                                });
                }

		$scope.showDetail = function(id) {
			$scope.detailHostJSON=$scope.results[id]._source;
			$scope.dialogid=ngDialog.open({ template: 'modaliddetail',className: 'ngdialog-theme-default',scope:$scope });
		}

		$scope.searchService = function(search) {
			$scope.search='"'+search+'"';
			$scope.home=1;
			$scope.mkSearch();
		}

		$scope.actShowPage = function(page) {
			$scope.start=page;
			$scope.mkSearch(true);
		}

		$scope.previousPage = function(page) {
			$scope.start-=1
			if ($scope.start<0)
				$scope.start=0;
			$scope.mkSearch(true);
		}

		$scope.nextPage = function(page) {
			$scope.start+=1;
			if ($scope.start>$scope.size*$scope.maxResult)
				$scope.start-=1;
			$scope.mkSearch(true);
		}

		$scope.mkSearch = function (keep) {
			if (keep != true)
				$scope.start=0;
			if ($scope.search!="") {
			query=  { "query": { "filtered": { "query": { "bool": { "should": [ { "query_string": { "query": $scope.search } } ] } } } }, size: 1000, from: $scope.start * 1000 }
			} else
				query={size:$scope.maxResult, from: $scope.start * $scope.maxResult}

			$http.post(ElasticPath+"_search",query)
				.then(function(res) {
					$scope.size=res.data.hits.total;
					$scope.results=res.data.hits.hits;
                                        $scope.link=[];
                                        i=0;

                                        while(i*$scope.maxResult<$scope.size)
                                        {
                                                $scope.link.push({indice:i,selected:(i==$scope.start)});
                                                i+=1;
                                        }


				});
		}
	
		$scope.mkSearch($scope.search);
	});

	
