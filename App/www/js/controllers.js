angular.module('starter.controllers', ['ngStorage', 'ngAudio'])
.factory("Songs", function($firebaseArray) {
    var itemsRef = new Firebase("FIREBASEURL/Songs");
    return $firebaseArray(itemsRef);
})
.controller('StartCtrl', function($scope, $localStorage) {
    $scope.submit = function() {
        var info = {
            name: $scope.name,
            lang: $scope.lang,
            city: $scope.city,
            audio: ""
        };
        $localStorage.info = info;
    };
})
.controller('SelectCtrl', function ($scope, Songs) {
    $scope.loading = true;
    $scope.tracks = Songs;
    $scope.out = function () {
        delete $localStorage.info;
    };
    $scope.tracks.$loaded()
    .then(function (x) {
        $scope.loading = false;
    })
})
.controller('PlayerCtrl', function ($scope, ngAudio, $stateParams, $ionicPopup, Songs, $localStorage, $state) {
    $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: 'Explanation',
            template: "You'll hear a speaker reading a short passage. Whenever you hear something, e.g., a sound or word, that makes you think they are from a particular place click on the red button as quickly as you can. You can click as many times as you like whilst the file is playing. When you've finished listening, you'll be able to review the places where you clicked and tell us why you clicked there."
        });

        alertPopup.then(function (res) {
            console.log('back');
        });
    };
    $scope.showAlert();
    var playing = false;
    var clicks = [];
    $scope.track = Songs.$getRecord($stateParams.title);
    $scope.disableClick = true;
    $scope.media = ngAudio.load($scope.track.url);
    $scope.recordPos = function () {
        clicks.push($scope.media.currentTime);
    }
    end = function () {
        setTimeout(function () {
            $scope.media.stop();
            $localStorage.clicks = clicks;
            $localStorage.info.audio = $scope.track.title;
            if (clicks.length > 0) {
                delete $localStorage.feedbacks;
                $state.go('feedback', { title: $scope.track.$id });
            }
            else {
                delete $localStorage.feedbacks;
                $localStorage.feedbacks = [];
                $state.go('comment');
            }
        },
            370);
    };
    $scope.$watch(function () {
        return $scope.media.progress;
    }, function (newValue) {
        if (newValue > 0 && !playing) {
            $scope.disableClick = false;
            playing = true;
        }
        else if (newValue >= 1) {
            $scope.disableClick = true;
            end();
        }
    })
})
.controller('FeedbackCtrl', function ($scope, $localStorage, ngAudio, $stateParams, $cordovaMedia, Songs, $state) {
    var track = Songs.$getRecord($stateParams.title);
    var media = ngAudio.load(track.url);
    var clicks = $localStorage.clicks;
    var feedbacks = [];
    $scope.playing = true;
    $scope.index = 1;
    $scope.position = media.currentTime;
    $scope.play = function () {
        media.currentTime = clicks[$scope.index-1] - 0.8;
        media.play();
    }
    $scope.$watch(function () {
        return media.currentTime;
    }, function (newValue) {
        if (newValue >= clicks[$scope.index-1] + 0.4) {
            media.stop();
        }
    })
    $scope.submitFeedback = function (t) {
        var feedback = {
            position: clicks[$scope.index-1],
            text: t
        }
        feedbacks.push(feedback);
        if ($scope.index < clicks.length) {
            $scope.index += 1;
            $scope.feedback = "";
        }
        else {
            $scope.playing = false;
            $localStorage.feedbacks = feedbacks;
            $state.go('comment');
        }
    }
})
.controller('FinalCommentCtrl', function($scope, $localStorage, $firebaseArray, $ionicPopup, $state){
    var feedbacks = $localStorage.feedbacks;
    var info = $localStorage.info;
    $scope.comment = {
        position: "Final",
        text: ""
    }
    $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: 'About the page',
            template: "Please tell us anything else you noticed about this speaker."
        });

        alertPopup.then(function (res) {
            console.log('back');
        });
    };
    $scope.submit = function () {
        feedbacks.push($scope.comment);
        finalSubmission = {
            name: info.name,
            language: info.lang,
            city: info.city,
            audio: info.audio,
            feedback: feedbacks
        }
        var itemsRef = new Firebase("FIREBASEURL/Feedback");
        var firebase = $firebaseArray(itemsRef);
        firebase.$add(finalSubmission);
    }
})