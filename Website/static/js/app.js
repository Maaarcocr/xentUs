// define our app and dependencies (remember to include firebase!)
var app = angular.module("myApp", ["firebase", "ngStorage", "ngRoute", "lr.upload"]);
app.config(function($routeProvider){
    $routeProvider
    .when('/clicks', {
        templateUrl: 'static/templates/clicks.html',
        controller: 'getClicks'
    })
    .when('/feedback', {
        templateUrl: 'static/templates/feedback.html',
        controller: 'feedbackUsersCtrl'
    })
    .when('/files', {
        templateUrl: 'static/templates/files.html',
        controller: 'filesCtrl'
    })
    .when('/login', {
        templateUrl: 'static/templates/login.html',
        controller: 'AuthCtrl'
    })
	.when('/rawData', {
        templateUrl: 'static/templates/rawData.html',
        controller: 'raw'
    })
    .otherwise({
        templateUrl: 'static/templates/start.html',
        controller: 'start'
    })    
});
app.factory('Log', function($localStorage){
	return {
		loggedIn: () => {
			return $localStorage.state;
		},
		log_in: () => {
			$localStorage.state = true;
		},
		log_out: () => {
			$localStorage.state = false;
		}
	}
});
app.controller("start", ["$scope","$localStorage", "$location","Log", function($scope, $localStorage, $location, Log) {
  $scope.goToFeedback = function(){
	$location.path("/feedback");
  }
  $scope.goToFiles = function(){
  	$location.path("/files");
  }
  $scope.getLog = Log.loggedIn();
}])


app.controller("feedbackUsersCtrl", ["$scope", "$firebaseArray", "$localStorage","Log",
  function($scope, $firebaseArray, $localStorage, Log) {
  $scope.getLog = Log.loggedIn();
  var ref = new Firebase('FIREBASEURL/Feedback');
  var list = $firebaseArray(ref);
  list.$loaded().then(function() {
        $scope.users = list;
  })
  $scope.save = function(id){
      $localStorage.id = id;
  }
  $scope.delete = function(id){
	  list.$remove(list.$getRecord(id));
  }
}]);

app.controller("raw", ["$scope", "$firebaseArray", "$localStorage", "Log",
  function($scope, $firebaseArray, $localStorage, Log){
  $scope.getLog = Log.loggedIn();
  var id = $localStorage.id;
  var ref = new Firebase('FIREBASEURL/Feedback/');
  var data = $firebaseArray(ref);
  data.$loaded()
	.then(function(x){
		$scope.user = data.$getRecord(id);
		$scope.list = $scope.user.feedback;
	})
}])


app.controller("filesCtrl", ["$scope", "$firebaseArray", "upload", "Log", "$window","$http",
  function($scope, $firebaseArray, upload, Log, $window, $http) {
    var list = $firebaseArray(new Firebase('FIREBASEURL/Songs'));

    list.$loaded().then(function() {
        $scope.songs = list;
    })
    $scope.getLog = Log.loggedIn();
    $scope.onSuccess = function (response){
		list.$add(response.data);
	}
	$scope.delete = function(name, id) {
		var check = $window.confirm('Are you sure you want to delete this file?')
		if(check){
			list.$remove(list.$getRecord(id));
			$http.post('/delete', {name: name});
		}
	}
}]);

app.controller("getClicks", ["$scope", "$firebaseArray", "$localStorage","Log",
  function($scope, $firebaseArray, $localStorage,Log){
    $scope.getLog = Log.loggedIn();
	var id = $localStorage.id;
	var ref = new Firebase('FIREBASEURL/Feedback/');
    var data = $firebaseArray(ref);
	data.$loaded()
	.then(function(x){
		$scope.clicks = data.$getRecord(id).feedback;
	})
}])

app.controller('AuthCtrl', [
  '$scope', '$rootScope', '$firebaseAuth','$route', 'Log', function($scope, $rootScope, $firebaseAuth, $route, Log) {
    var ref = new Firebase('FIREBASEURL/');
    $scope.auth = $firebaseAuth(ref);
    $scope.getLog = Log.loggedIn();
    $scope.signIn = function() {
    ref.authWithPassword({
            email    : $scope.email,
            password : $scope.password
        }, function (error, authData) {
            if (error) {
				Log.log_out();
                $scope.error = true;
                $route.reload();
            } else {
                $scope.error = false;
				Log.log_in();
                $route.reload();
            }
        });

  }

    $scope.denyAccess = function(){
	  Log.log_out();
      $route.reload();
    }

}]);