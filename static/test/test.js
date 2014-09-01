var app = angular.module('app',[]);
app.controller('controller',function($scope){
	$scope.hours= [6,7,8,9,10];
	$scope.dates = ["2014-08-31","2014-09-01"];
});

app.directive('test',function(){
	return {
		controller:function($scope,$http){
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
					"date":$scope.date,
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
		templateUrl:"test/test.html",
		restrict:"E",
		scope:{
			date:"=",
			hour:"="
		}
	};
});