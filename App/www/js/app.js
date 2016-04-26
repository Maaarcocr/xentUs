// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var myApp = angular.module('starter', ['ionic', 'starter.controllers', 'ngStorage', 'ngCordova', 'firebase', 'ngAudio']);

myApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
myApp.config(function ($stateProvider, $urlRouterProvider, $localStorageProvider){
    $stateProvider
    .state('select', {
        cache: false,
        url: '/select',
        templateUrl: 'templates/SelectView.html',
        controller: 'SelectCtrl'
    })
    .state('start', {
        cache: false,
        url: '/',
        templateUrl: 'templates/StartView.html',
        controller: 'StartCtrl'
    })
    .state('audioPlayer', {
        cache: false,
        url: '/item/:title',
        templateUrl: 'templates/PlayerView.html',
        controller: 'PlayerCtrl'
    })
    .state('feedback', {
        cache: false,
        url: '/item/feedback/:title',
        templateUrl: 'templates/FeedbackView.html',
        controller: 'FeedbackCtrl'
    })
    .state('comment', {
        cache: false,
        url: '/comment',
        templateUrl: 'templates/CommentView.html',
        controller: 'FinalCommentCtrl'
    })
    var infos = $localStorageProvider.get('info');
    if (!infos){
        $urlRouterProvider.otherwise('/');  
    }
    else {
        $urlRouterProvider.otherwise('/select'); 
    }
})
