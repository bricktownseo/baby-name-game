var app = angular.module('BabyNameApp',['ngAudio','ui-notification','timer','firebase'])
.config(function(NotificationProvider) {
      NotificationProvider.setOptions({
          delay: 3000,
          startTop: 20,
          startRight: 10,
          verticalSpacing: 20,
          horizontalSpacing: 20,
          positionX: 'center',
          positionY: 'bottom'
      });
})
.filter('seconds', function() {
  return function(millis) {
    return millis/1000.0;
  };
});

app.controller('NameCtrl',function($scope, ngAudio, Notification, $firebaseArray){

    var bng = localStorage.getItem("babyNameGame");

    console.log(bng);

    var ref = new Firebase("https://babynamegame.firebaseio.com/stats");
   // download the data into a local object
   //$scope.data = $firebaseObject(ref);

   $scope.stats = $firebaseArray(ref);

   // create a query for the most recent 25 messages on the server
   var query = ref.orderByChild("time");
   $scope.stats = $firebaseArray(query);

  $scope.stage = {
    now: 'start',
    guesses: 0,
    time: '',
    played: false
  };

  if(bng != null){
    $scope.stage.played = true;
  }

  $scope.firstNames = new Swiper ('.first-name', {
    // Optional parameters
    direction: 'vertical',
    // If we need pagination
    pagination: '.swiper-pagination'
  });

  $scope.middleNames = new Swiper ('.middle-name', {
    // Optional parameters
    direction: 'vertical',
    // If we need pagination
    pagination: '.swiper-pagination'
  });

  // Add handler that will be executed only once
  $scope.firstNames.on('onSlideChangeEnd', function () {
      console.log('slider moved');
      $scope.swipe.play();
  });

  // Add handler that will be executed only once
  $scope.middleNames.on('onSlideChangeEnd', function () {
      console.log('slider moved');
      $scope.swipe.play();
  });

  $scope.names = [
    'Curtis','Grady','Hayden','James','Jane','Kathryn','Nolan','Patrick','Remy','Thea','Tucker','Willa'
  ];

  for(var i = 0; i < $scope.names.length; i++){
    $scope.firstNames.appendSlide('<div class="swiper-slide">' + ($scope.names[i]) + '</div>');
    $scope.middleNames.appendSlide('<div class="swiper-slide">' + ($scope.names[i]) + '</div>');
  }

  $scope.firstNames.slideTo(0, 0, false);
  $scope.middleNames.slideTo(0, 0, false);

  $scope.start = ngAudio.load("audio/pacman.mp3"); // returns NgAudioObject
  $scope.winner = ngAudio.load("audio/win.mp3"); // returns NgAudioObject
  $scope.wrong = ngAudio.load("audio/buzzer.mp3"); // returns NgAudioObject
  $scope.partial = ngAudio.load("audio/answer.mp3"); // returns NgAudioObject
  $scope.swipe = ngAudio.load("audio/swipe.mp3"); // returns NgAudioObject

  $scope.instructions = function(){
    $scope.stage.now = 'instructions';
  }

  $scope.hallOfFame = function(){
    $scope.stage.now = 'hof';
  }

  $scope.startGame = function(){
    $scope.start.play();
    $scope.stage.now = 'game';
    $scope.$broadcast('timer-start');
  }

  $scope.checkNames = function(){
    $scope.stage.guesses++;
    //First Right
    if($scope.firstNames.activeIndex == 9){
      if($scope.middleNames.activeIndex == 3){
        $scope.winner.play();
        //window.alert('You win');
        $scope.$broadcast('timer-stop');
        $scope.stage.now='end';

      }else{
        $scope.partial.play();
        Notification.success({message: 'You have one name in the right position.', delay: 2000});
      }
    }else if($scope.middleNames.activeIndex == 3){
      $scope.partial.play();
      Notification.success({message: 'You have one name in the right position.', delay: 2000});
    }else if($scope.firstNames.activeIndex == 3){
      if($scope.middleNames.activeIndex == 9){
        $scope.partial.play();
        Notification.success({message: 'You have two correct names in the wrong position.', delay: 2000});
      }else{
        $scope.partial.play();
        Notification.success({message: 'You have selected a correct name in the wrong position.', delay: 2000});
      }
    }else if($scope.middleNames.activeIndex == 9){
      $scope.partial.play();
      Notification.success({message: 'You have selected a correct name in the wrong position.', delay: 2000});
    }else{
      $scope.wrong.play();
      Notification.error({message: 'Nothing Matching', delay: 2000});
    }
  };

  $scope.$on('timer-stopped', function (event, data){
      console.log('Timer Stopped - data = ', data);
      $scope.stage.time = (((data.minutes*60)+data.seconds)+'.'+(data.millis - (data.minutes*60*1000+data.seconds*1000))+' seconds');
      $scope.stats.$add({
        date: new Date(),
        name: $scope.stage.name,
        time: data.millis,
        guesses: $scope.stage.guesses
      });
      localStorage.setItem("babyNameGame", true);
  });
});
