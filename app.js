var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server); //socket.io listens to http server

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

var map_clients = [];
var port = Number(process.env.PORT || 8080);
var gps_latitude , gps_longitude , gps_timestamp, gps_userID ;

server.listen(port);
console.log("Server " + port + " has started.");

io.configure('development', function(){
  io.set('transports', ['xhr-polling']);
});

app.get('/', function(req,res){
	res.sendfile(__dirname + '/index.html');
});

app.post('/location', function(request,response){
	//var form_data = "";
	console.log("post on location called");
	/*request.on('data', function(chunk){
		form_data += chunk.toString();
		console.log("on data ");
	});
	request.on('end', function(){
		
		var obj = qs.parse(form_data);
		//insertLocation(obj);
		console.log("Number of connected clients: " + map_clients.length);

		for(var i=0; i < map_clients.length; i++){
			var client = map_clients[i];
			//console.log("client.user_id:" + client.user_id);
			//console.log("client.devices:" + client.devices);

			//if (typeof client.devices != "undefined") {
				//if(isAllowed(client.devices, obj.uuid)){
					//console.log("Sending gps to viewer: " + client.user_id);
					//console.log("Devices: " + client.devices);

					var jsonString = JSON.stringify({ type:'gps', data:obj});
					client.send(jsonString);
				//}
			//}
		}
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write("OK");
		response.end();
	});*/
	
	
	for(var i=0; i < map_clients.length; i++){
		var client = map_clients[i];
		//console.log("client.user_id:" + client.user_id);
		//console.log("client.devices:" + client.devices);

		//if (typeof client.devices != "undefined") {
			//if(isAllowed(client.devices, obj.uuid)){
				//console.log("Sending gps to viewer: " + client.user_id);
				//console.log("Devices: " + client.devices);

				var jsonString = JSON.stringify({ type:'gps', data:request.body});
				client.send(jsonString);
			//}
		//}
	}
	
	gps_userID = request.body.gps_userID;
	gps_timestamp = request.body.gps_timestamp;
	gps_latitude = request.body.gps_latitude;
	gps_longitude = request.body.gps_longitude;
	
	response.writeHead(200,{'Content-Type' : 'text/plain'});
	response.end('OK. userID : '+ gps_userID + ' timestamp : ' + gps_timestamp + ' latitude : ' + gps_latitude + ' longitude : ' + gps_longitude);
	console.log(request.body);
});

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}


io.sockets.on('connection', function(client){
  // We push the map clients to an array.
  // If a gps is received from a device,
  // we broadcast the gps to all map clients.
	console.log("new client connected");
	map_clients.push(client);

	client.on('setUserId',function(user_id){
		console.log("Map client connected for user_id: " + user_id);
		client.user_id = user_id;
	});

	client.on('addDevice',function(device_id){
		console.log("Add device_id: " + device_id);

		if (typeof client.devices == "undefined") {
			client.devices = [];
		}

		client.devices.push(device_id);
	});
	
	client.on('disconnect', function(){
		map_clients.splice(map_clients.indexOf(client), 1);
	});
});