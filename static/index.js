// Connect to websocket
var socket = io.connect(location.protocol + '//'
             + document.domain + ':' + location.port);

// Adds one message to the message window
function addmessage(entry){

  var card = document.createElement('div');
  card.className = "card bg-light mb-1";

  var cardbody = document.createElement('div');
  cardbody.className = "card-body";

  var h5 = document.createElement('h5');
  h5.className = "card-title mr-2";
  h5.innerHTML = entry[0];

  var h6 = document.createElement('h6');
  h6.className = "card-subtitle mb-1 text-muted";
  h6.innerHTML = entry[1];

  var p = document.createElement('p');
  p.className = "card-text";
  p.innerHTML = entry[2];

  cardbody.appendChild(h5);
  cardbody.appendChild(h6);

  // Adds a delete button if displayname matches user that sent the message
  if(entry[0] == localStorage.getItem('displayname')){
    var btn = document.createElement('button');
    btn.className = "btn btn-light pull-right";
    btn.onclick = function(){
      socket.emit('delete message', {'id': entry[3], 'channel': entry[4]});
    };
    var span = document.createElement('span');
    span.className = "fas fa-times";

    btn.appendChild(span);
    cardbody.appendChild(btn);
  }

  cardbody.appendChild(p);
  card.appendChild(cardbody);
  document.querySelector("#messagesbox").appendChild(card);
}


// Gets the contents of a channel and displays it
function load(channel){

  // Clears messagesbox
  var messagebox = document.querySelector("#messagesbox");
  messagebox.innerHTML = "";

  // Adds messages one by one
  for (x = 0; x < channel.length; x++) {
    addmessage(channel[x]);
  }

  // Scrolls to the bottom of the page
  messagebox.scrollTop = messagebox.scrollHeight;

}

// Makes the hyperlinks load their respective channels
function addchannellink(a){
  a.onclick = () => {
    const channel = a.innerHTML;
    localStorage.setItem('currentchannel', channel);
    socket.emit('get channel', {'channel': channel});
  };
}

document.addEventListener('DOMContentLoaded', () => {

    // Initial prompt for display name
    if (localStorage.getItem('displayname') == null){
      const name = prompt("Please choose a display name:");
      localStorage.setItem('displayname', name);
    }

    // Displays name
    document.querySelector("#name").innerHTML =
    localStorage.getItem('displayname');

    // Sets default channel
    if (!localStorage.getItem('currentchannel')){
      localStorage.setItem('currentchannel', 'General');
    }

    // Changes display name
    document.querySelector("#namechangebutton").onclick = () => {
      const name = document.querySelector("#namechange").value;

      // Disregards blank names
      if(name != ""){
        localStorage.setItem('displayname', name);
      }
      document.querySelector("#name").innerHTML = name;
      document.querySelector("#namechange").value = "";
      return false;
    };

    socket.on('connect', () => {

        // Gets saved channel
        socket.emit('get channel', {'channel':
        localStorage.getItem('currentchannel')});

        // Gets value of channel being added
        document.querySelector('#addchannelbutton').onclick = () => {
            const channel = document.querySelector("#addchannel").value;
            // Disregards blank channels
            if(channel != ""){
              socket.emit('add channel', {'channel': channel});
            }
            document.querySelector("#addchannel").value = "";
            return false;
        };

        // Attaches appropriate function to each channel link
        document.querySelectorAll('.channel').forEach(a => {
            addchannellink(a);
        });

        // Gets information about message being sent
        document.querySelector('#sendmessagebutton').onclick = () => {

            const channel = localStorage.getItem('currentchannel');
            const user = localStorage.getItem('displayname');
            const message = document.querySelector("#sendmessage").value;

            // Disregards blank messages
            if(message != ""){
              socket.emit('send message', {'channel': channel,
              'user': user,'message': message});
            }


            document.querySelector("#sendmessage").value = "";
            return false;
        };

    });

    // Creates and appends the new channel
    socket.on('channel added', data => {

      var li = document.createElement('li');
      li.className = "nav-item";

      var a = document.createElement('a');
      a.className = "channel nav-link";
      a.setAttribute("href", "#");
      a.innerHTML = data;
      addchannellink(a);

      // Appends channel to the list of channels
      li.appendChild(a);
      document.querySelector("#channels").appendChild(a);
    });

    // Loads the received channel using load()
    socket.on('load channel', data => {
      document.querySelector("#channelname").innerHTML =
      localStorage.getItem('currentchannel');
      load(data);
    });

    // Displays the added message if user is in that channel
    socket.on('message added', data => {
      if(data[4] == localStorage.getItem('currentchannel')){
        addmessage(data);
        var messagebox = document.querySelector("#messagesbox");
        messagebox.scrollTop = messagebox.scrollHeight;
      }
    });

    // Deletes deleted message from the channel
    socket.on('message deleted', data => {
      console.log(data);
      if(data[1] == localStorage.getItem('currentchannel')){
        load(data[0]);
      }
    });

});
