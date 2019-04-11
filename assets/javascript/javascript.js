$(document).ready(function () {


  // Initialize Firebase
    var config = {
        apiKey: "AIzaSyD8dLXURA6xO8MCTHTy0F66Dmfnkb814EA",
        authDomain: "train-scheduler-96b6d.firebaseapp.com",
        databaseURL: "https://train-scheduler-96b6d.firebaseio.com",
        projectId: "train-scheduler-96b6d",
        storageBucket: "",
        messagingSenderId: "278208085277"
    };
    firebase.initializeApp(config);

    var database = firebase.database();


    // connectionsRef references a specific location in our database.
    // All of our connections will be stored in this directory.
    var connectionsRef = database.ref("/connections");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes.
    // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected"); //.info/connected is a special firebase selector taht tells the client if a user is connected.

    // When the client's connection state changes...
    connectedRef.on("value", function(snap) { // .on event listener for whenever a value changes "value" we run this function. (snap) or (snapshot) can name whatever you want is literally just the data

    // If they are connected..
    if (snap.val()) { // nap is an object and has methods on it .val().  if true; snap.val() similar to ajax response.

        // Add user to the connections list.
        var con = connectionsRef.push(true);
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
    });

    // When first loaded or when the connections list changes...
    connectionsRef.on("value", function(snap) {

        // Display the viewer count in the html.
        // The number of online users is the number of children in the connections list.
        $("#watching").text("# Watching: " + snap.numChildren()); // select connected-viewers and update .text snap getting our data from firebase and update 
    });




    // Initial Values
    var trainName = "";
    var destination = "";
    var firstTrainTime = "";
    var frequency = "";
    var nextArrival = "";
    var minutesAway = "";


    // current time
    var currentTime = moment().format("HH:mm");
    console.log("current time: " + currentTime);

    $('#submit-form').on("click", function () {
        event.preventDefault();

        trainName = $('#name-input').val().trim();
        destination = $('#destination-input').val().trim();
        firstTrainTime = $('#first-train-input').val().trim();
        frequency = $('#frequency-input').val().trim();
       

        
        
        
        
        
        database.ref().push({
            trainName: trainName,
            destination: destination,
            firstTrainTime: firstTrainTime,
            frequency: frequency,
            // nextArrival: nextArrival,
            // minutesAway: minutesAway,
        });
        
        
    });           
    
    database.ref().on("child_added", function (childSnapshot) {
        console.log(childSnapshot.val());
        console.log("this is the child of snapshot.val")
        console.log(childSnapshot.val().firstTrainTime);
        
        
        // using moment.js to convert input times into new variables and do some math to calculate next train arrival to display on our table. 
        var firstTrainTimeConverted = moment(childSnapshot.val().firstTrainTime, "HH:mm").subtract(1, "years");
        console.log(firstTrainTimeConverted);
        
        // Difference between times
        var diffTime = moment().diff(moment(firstTrainTimeConverted), "minutes");
        console.log("diff in time: " + diffTime);
        // Time apart
        var timeRemainder = diffTime % childSnapshot.val().frequency;
        console.log(timeRemainder);
        // Minutes until next train arrives
        minutesAway = childSnapshot.val().frequency - timeRemainder;
        console.log("min till next train: " + minutesAway);
        
        // Next Train
        if (firstTrainTime !== "") {

            nextArrival = moment().add(minutesAway, "minutes");
            console.log("next arrival: " + moment(nextArrival).format("hh:mm"));
            var newRow = $('<tr>').append(
                $('<td>').text(childSnapshot.val().trainName),
                $('<td>').text(childSnapshot.val().destination),
                $('<td>').text(childSnapshot.val().frequency),
                $('<td>').text(nextArrival.format("h:mm a")),
                $('<td>').text(minutesAway),
            );
            $("tbody").append(newRow);
        } else {
            trainName = "";
            destination = "";
            firstTrainTime = "";
            frequency = "";
            nextArrival = "";
            minutesAway = "";
        }        
    })





});