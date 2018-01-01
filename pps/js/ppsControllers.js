
//INSTANTIATE ANGULAR APPLICATION   
var myApp = angular.module("pps", ['ui.bootstrap']);


//SERVICE STORES SELECTED PLAYER AND NOTIFIES(broadcasts) OTHER CONTROLLERS WHEN PLAYERS CHANGES(watches)
myApp.factory('serv',['$rootScope', function($rootScope){
  var result = { 'key':0 };
  $rootScope.$watch(function() 
    { return result.key; }, function(newValue, oldValue, scope) 
    { $rootScope.$broadcast('aFactory:keyChanged', newValue); }, true);
    return result;
}]);


//SPLASH CONTAINER(screen) CONTROLLER THAT WATCHES FACTORY SERVICE TO DETERMINE WHEN TO SHOW OR HIDE SPLASH
myApp.controller('splashContCtrl',['$scope','$rootScope', function ($scope,$rootScope){
  //INIT PLAYERID FOR INITIAL LOAD
  $scope.playerid = '0';

  $rootScope.$on('aFactory:keyChanged', function playerChanged(event, value) {
    //GET NEW VALUE SENT FROM FACTORY       
    $scope.playerid = value;

    //HANDLES NG-SHOW/HIDE OF THE SPLASH CONTAINER
    $scope.isStart = function(value){
      if (value != '0')
         {
          //SELECTED PLAYER HAD CHANGED/HIDE SPLASH CONTAINER
          return false;
         }
         else
         {
          //SELECTED PLAYER HAS NOT CHANGED SO DO NOT HIDE SPLASH CONTAINER
          return true;
         }          
    }
  });
}]);


//PLAYER CONTAINER(screen) CONTROLLER THAT WATCHES FACTORY SERVICE TO DETERMINE WHEN TO SHOW OR HIDE PLAYER CONTAINER
myApp.controller('playerContCtrl',['$scope','$rootScope', function ($scope,$rootScope){
  //INIT VARS FOR FOOTER TOTALS AS THESE CHANGE WHEN PLAYER CHANGES
  $scope.compReg = 0; 
  $scope.attReg = 0; 
  $scope.ydsReg = 0; 
  $scope.tdReg = 0; 
  $scope.intReg = 0; 
  $scope.qbrReg = 0;
  $scope.compPost = 0;
  $scope.attPost = 0; 
  $scope.ydsPost = 0; 
  $scope.tdPost = 0; 
  $scope.intPost = 0; 
  $scope.qbrPost = 0;

  $rootScope.$on('aFactory:keyChanged', function playerChanged(event, value) {
    //GET NEW VALUE SENT FROM FACTORY
    $scope.playerid = value;

    //HANDLES NG-SHOW/HIDE OF THE PLAYER CONTAINER
    $scope.isPlayer = function(value){
      if (value != '0')
         {
          //PLAYER HAS NOT CHANGED DO NOT HIDE PLAYER CONTAINER
          return true;
         }
         else
         {
          //PLAYER HAS CHANGED HIDE THE PLAYER CONTAINER
          return false;
         }          
    }
  });
}]);


//LIST OF PLAYERS DROPDOWN 
myApp.controller('DropdownCtrl', ['$scope','$http','serv', function ($scope,$http,serv,$log) {

  //ARRAY TO HOLD PLAYERS FOR THE DDOWN
  $scope.players = [];

  //MANAGE THE BOOTSTRAP DROPDOWN CONTROL
  $scope.status = {isopen: false};
 
  $scope.toggled = function(open) {
    $log.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

  $scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));

  //GET PLAYER SELECTED
  $scope.dropboxitemselected = function (item) {
    $scope.selectedItem = item;
    
    //NOTIFY THE FACTORY SERVICE THAT SOMETHING HAS BEEN SELECTED/CHANGED
    serv.key = $scope.selectedItem;
  }

  //ASYNC CALL TO PLAYERS DATASET
  $http.get('data/quarterbacks.json').then(successCallback, errorCallback);
    function successCallback(response)
    {
      //LOAD PLAYERS ARRAY WITH PLAYERS
      $scope.players = response.data.players;
    }
    function errorCallback(error)
    {
      //PROBLEM ACCESSING DATASET
      $scope.players = (error,'Can Not Access Data');
    }
}]);


//PLAYER INFO CONTROLLER
myApp.controller("playersInfoCtrl",['$scope','$rootScope','$http', function ($scope,$rootScope,$http) {
  $rootScope.$on('aFactory:keyChanged', function playerChanged(event, value) {
    //GET THE CURRENT SELECTED PLAYER ID
    $scope.selectedPlayerID = value;
    //ARRAY TO HOLD PLAYER REGULAR SEASON STATS
    $scope.arrPlayerStatsReg = [];
    //ARRAY TO HOLD PLAYER POST SEASON STATS
    $scope.arrPlayerStatsPost = [];

    //ASYNC LOAD OF PLAYER BIO INFO AND THEN PLAYER STAT INFO
    $http.get('data/quarterbacks.json').then(bioSuccessCallback, bioErrorCallback);
      function bioSuccessCallback(response)
      {
        //POPULATE THE PLAYER BIO INFO
        for(var i=0;i<response.data.players.length;i++)
        {
          if (response.data.players[i].player_id == $scope.selectedPlayerID)
             { $scope.first_name = response.data.players[i].first_name;
               $scope.last_name = response.data.players[i].last_name;
               $scope.drafted_by = response.data.players[i].drafted_by;
               $scope.draft_type = response.data.players[i].draft_type;
               $scope.draft_season = response.data.players[i].draft_season;
               $scope.draft_round = response.data.players[i].draft_round;
               $scope.draft_pick = response.data.players[i].draft_pick;
               //CALL UTILITES TO FORMAT THE DOB
               $scope.date_of_birth = calcDOB(response.data.players[i].date_of_birth);
             }
        }

        //LOAD APPROPRIATE PLAYER/TEAM IMAGE FILES
        if ($scope.selectedPlayerID != '0')
        {
          $scope.hdShot = "img/" + $scope.selectedPlayerID + ".png";
          $scope.tmLogo = "img/" + $scope.selectedPlayerID + "tmLogo.png";
        }

        //GET THE PLAYER STAT INFO AND CALCULATE QBR AND TOTALS
        $http.get('data/quarterbacks.json').then(statSuccessCallback, statErrorCallback);
          function statSuccessCallback(response)
          {
            //INIT TOTALS 
            var compReg = 0;
            var attReg = 0;
            var ydsReg = 0;
            var tdReg = 0;
            var intReg = 0;
            var compPost = 0;
            var attPost = 0;
            var ydsPost = 0;
            var tdPost = 0;
            var intPost = 0;
            
            //ITERATE THROUGH DATASET AND DETERMINE REGULAR SEASON OR POST SEASON
            for(var j=0;j<response.data.statistics.length;j++)
            {
              if (response.data.statistics[j].player_id == $scope.selectedPlayerID)
                 { 
                   if (parseInt(response.data.statistics[j].week) <= 17)
                      {
                        //SUM REGULAR SEASON TOTALS(VALUES WILL BE LOADED TO FOOTER)
                        compReg += parseInt(response.data.statistics[j].completions);
                        attReg += parseInt(response.data.statistics[j].attempts);
                        ydsReg += parseInt(response.data.statistics[j].yards);
                        tdReg += parseInt(response.data.statistics[j].touchdowns);
                        intReg += parseInt(response.data.statistics[j].interceptions);
                        //CALL UTILITIES TO CALCULATE QBR AND ADD QBR TO THE DATASET
                        response.data.statistics[j].qbr = calcQBR(response.data.statistics[j].completions,response.data.statistics[j].attempts,response.data.statistics[j].yards,response.data.statistics[j].touchdowns,response.data.statistics[j].interceptions);
                        //LOAD THE DATASET INTO ARRAY(VALUES WILL BE LOADED TO TABLE)
                        $scope.arrPlayerStatsReg.push(response.data.statistics[j]);
                      }
                   else
                      {
                        //SUM POST SEASON TOTALS(VALUES WILL BE LOADED TO FOOTER)
                        compPost += parseInt(response.data.statistics[j].completions);
                        attPost += parseInt(response.data.statistics[j].attempts);
                        ydsPost += parseInt(response.data.statistics[j].yards);
                        tdPost += parseInt(response.data.statistics[j].touchdowns);
                        intPost += parseInt(response.data.statistics[j].interceptions);
                        //CALL UTILITIES TO CALCULATE QBR AND ADD QBR TO THE DATASET
                        response.data.statistics[j].qbr = calcQBR(response.data.statistics[j].completions,response.data.statistics[j].attempts,response.data.statistics[j].yards,response.data.statistics[j].touchdowns,response.data.statistics[j].interceptions);
                        //LOAD THE DATASET INTO ARRAY(VALUES WILL BE LOADED TO TABLE)
                        $scope.arrPlayerStatsPost.push(response.data.statistics[j]);
                      } 
               }
            }

            //POPUATE FOOTER TOTALS FOR REGULAR SEASON
            $scope.$parent.compReg = compReg;
            $scope.$parent.attReg = attReg;
            $scope.$parent.ydsReg = ydsReg;
            $scope.$parent.tdReg = tdReg;
            $scope.$parent.intReg = intReg;
            $scope.$parent.qbrReg = calcQBR(compReg,attReg,ydsReg,tdReg,intReg);

            //POPUATE FOOTER TOTALS FOR POST SEASON
            $scope.$parent.compPost = compPost;
            $scope.$parent.attPost = attPost;
            $scope.$parent.ydsPost = ydsPost;
            $scope.$parent.tdPost = tdPost;
            $scope.$parent.intPost = intPost;
            $scope.$parent.qbrPost = calcQBR(compPost,attPost,ydsPost,tdPost,intPost);
          }
          function statErrorCallback(error)
          {
            //PROBLEM ACCESSING DATASET
            $scope.arrPlayersStatsReg = (error,'Can Not Access Data');
          }
      }
      function bioErrorCallback(error)
      {
        //PROBLEM ACCESSING DATASET
        $scope.arrPlayers = (error,'Can Not Access Data');
      }

  });
}]);