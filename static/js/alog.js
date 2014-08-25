

var app = angular.module("alogApp",['ngRoute']);

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
		
		//	PAGER	
		$scope.isPreviousAllowed = getIsPreviousAllowed($scope.datemin,$scope.dateStart);
		$scope.isNextAllowed = getIsNextAllowed($scope.datemax,$scope.dateStart,$scope.daysnumber);

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

	function getIsPreviousAllowed(mindate,startdate){
		var dmin = new Date(mindate);
		var sd = new Date(startdate);
		if(dmin<sd)
			return true;
		return false;
	}

	function getIsNextAllowed(maxdate,startdate,daysnumber){
		var dmax = new Date(maxdate);
		var newdate = new Date(startdate);
		newdate.setDate(newdate.getDate()+daysnumber-1);
		if(dmax>newdate)
			return true;
		return false;
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

	$scope.addActivity = function(date,hour){;
		activityFactory.setAddActivityDateHour(date,hour);
	};

});

app.controller("editActivitiesController",function($scope, activityFactory){
	$scope.test = activityFactory.getAddActivityDateHour();
	$scope.add = function() {
		activityFactory.addActivity().success(function(data){
			$scope.output = data;
		});
	};
});


app.factory('activityFactory', function($http, $filter){
	var factory = {};

	var webServerAddress = "http://127.0.0.1:12345/";

	var d = "";
	var h = 0;
	
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
		
	factory.setAddActivityDateHour = function(date,hour){
		d=$filter('date')(date,"yyyy-MM-dd");
		h=hour;
	};

	factory.getAddActivityDateHour = function(){
		return {"date":d,"hour":h};
	};

	factory.addActivity = function() {
		return $http.post(webServerAddress+'activity/add/',
			{
				"date":"2014-08-25",
				"hour":12,
				"activities":["FD","WK","WKO"]
			});
	};

	return factory;

});