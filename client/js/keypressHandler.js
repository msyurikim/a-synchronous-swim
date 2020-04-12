$('body').on('keydown', (event) => {
  var arrowPress = event.key.match(/Arrow(Up|Down|Left|Right)/);
  if (arrowPress) {
    var direction = arrowPress[1];
    SwimTeam.move(direction.toLowerCase());
  }
});

console.log('Client is running in the browser!');

var keyPressFromServer = function() {
  $.ajax({
    type: 'GET',
    url: 'http://127.0.0.1:3000/keypress',
    success: function(data) {
      console.log(data);
      SwimTeam.move(data);
    },
    error: function(data) {
      console.error('There was an error making the AJAX request');
    }
  });
};

setInterval(keyPressFromServer, 3000);