

var app = angular.module("alogApp",['ngRoute','ui.bootstrap']);

app.config(function($routeProvider){
	$routeProvider.when('/',{
		controller:"viewGridController",
		templateUrl:"views/view.html"
	})
	.when('/activity',{
		controller:'editActivitiesController',
		templateUrl:'views/add.html'
	});
});


//	FILTERS ACTIVITY
//	INEFFECTIVE METHOD
app.filter('datehour', function($filter){
	return function(items, date, hour){
		output = [];
		date = $filter('date')(date,"yyyy-MM-dd");
		angular.forEach(items,function(activity){
			if(activity.date == date && activity.hour == hour)
				output.push(activity);
		});
		return output;
	};
});

app.controller("viewGridController", function($scope, activityFactory, $filter) {

	//	HOURS TO FILTER
	$scope.hours= [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
	//	NUMBER OF DAYS TO DISPLAY
	$scope.daysnumber = 7;

	//	MIN MAX DATES FOR DATE PICKER
	function setDateRange(){
		activityFactory.getDateRange().success(function(data){
			$scope.datemin = data.min;
			$scope.datemax = data.max;
		});
	}

	//	RUNS ON PAGE START
	setDateRange();

	//	SELECT DATE TO LOAD ACTIVITIES
	//	STARTING ROUTINE
	//	IS CALLED AFTER DATESTART IS SET
	$scope.change = function(){

		init();
	};

	//	NEEDS DATESTART
	//
	//	LOADS ACTIVITIES OF NUMBER OF DAYS FROM START DATE ON SCREEN
	//	MUST FILL DATES TOO SO THAT BOTH ARE USED BY PRESENTATION
	function init(){
		
		//	ACTIVITIES
		var d = new Date($scope.dateStart);
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();

		activityFactory.getActivities(year,month,day,$scope.daysnumber).success(function(data){
			$scope.data = data;
			$scope.activities = getPreparedActivities($scope.data, $scope.hours,$scope.dates,$filter('datehour'));
		});

		//	DATES TO FILTER
		$scope.dates = getDates($scope.dateStart,$scope.daysnumber);
		
	}

	function getDates(startdate,daysnumber){
		dates = [];
		var i=0;
		while(i<daysnumber){
			var d = new Date(startdate);
			d.setDate(d.getDate()+i);
			dates.push(d);
			i++;
		}
		return dates;
	}

	function getPreparedActivities(data, hours, dates, datehourfilter){
		var activities=[];
		angular.forEach(hours, function(h){
			var a = []
			angular.forEach(dates, function(d){
				var acell = datehourfilter(data,d,h);
				c = [];
				angular.forEach(acell, function(b){
					c.push(b);
				});
				var isEmpty=false;
				if(c.length==0){
					isEmpty=true;
				}
				a.push({
					"isEmpty":isEmpty,
					"cells":c
				});
			});
			activities.push(a);
		});
		return activities;
	}

	$scope.nextPage = function(){
		d = new Date($scope.dateStart);
		d.setDate(d.getDate()+$scope.daysnumber);
		$scope.dateStart = d;
		init();
	};

	$scope.previousPage = function(){
		d = new Date($scope.dateStart);
		d.setDate(d.getDate()-$scope.daysnumber);
		$scope.dateStart = d;
		init();
	};

});


app.directive("graph",function(){
	return {
		controller:function($scope){
			$scope.val=50;
			$scope.colors = {
				Food:"Gold",
				Work:"red",
				Social:"green",
				Workout:"ForestGreen",
				Leisure:"Aqua",
				Hygiene:"DarkGreen",
				Doctor:"DarkRed",
				Travel:"DarkGray"
			};
		},
		templateUrl:"views/graph.html",
		scope:{
			activity:"=",
			code:"="
		},
		restrict:"E"
	}
});

app.directive('insert',function(){
	return {
		controller:function($scope,$http,$filter){
			$scope.codes = [
				{display:"Food",id:"FD"},
				{display:"Work",id:"WK"},
				{display:"Work Out",id:"WO"},
				{display:"Social",id:"SO"},
				{display:"Leisure",id:"LE"},
				{display:"Hygiene",id:"HY"},
				{display:"Doctor",id:"DC"},
				{display:"Travel",id:"TR"},
			];
			$scope.myCode = $scope.codes[0];
			$scope.stage=1;

			$scope.save = function(){
				$scope.test = $scope.myCode;

				requestdata = {
					"date":$filter("date")($scope.date,"yyyy-MM-dd"),
					"hour":$scope.hour,
					"activities":[$scope.myCode.id]
				}

				$http.post('http://127.0.0.1:12345/activity/add/',requestdata).success(function(data){
					$scope.stage=3;
					$scope.msg = data.rawsAffected;
				}).error(function(){
					$scope.stage=4;
				});
			};
		},
		templateUrl:"views/insert.html",
		restrict:"E",
		scope:{
			date:"=",
			hour:"="
		}
	};
});

app.factory('activityFactory', function($http, $filter){
	var factory = {};

	var webServerAddress = "http://127.0.0.1:12345/";
	
	// GET NUMBER OF DAYS OF ACTIVITIES
	factory.getActivities = function(year,month,day,daysnumber) {
		return $http.get(
				webServerAddress+'activity/activities/'+
				year+'/'+month+'/'+day+'/'+daysnumber+'/rows.json'
			);
	};

	//	GET DATE RANGE
	factory.getDateRange = function(){
		return $http.get(webServerAddress+'activity/activities/daterange.json');
	};
		

	factory.addActivity = function(requestdata) {
		return $http.post(webServerAddress+'activity/add/',requestdata);
	};

	return factory;

});