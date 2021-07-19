var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const multer = require('multer');

app.use(express.static("src"))

http.listen(8000, function(){ 
	console.log('listening on :8000'); 
});

app.get( '/', function(req, res){ 
	res.sendFile(__dirname + '/src/index.html');  
});

app.get( '/test.html', function(req, res){ 
	res.sendFile(__dirname + '/src/test.html');  
});

var users = {};
var numberOfConnectors = 0;

io.on("connection", function(socket) {	
	
	numberOfConnectors ++;
	users[socket.id] = socket.id;
	io.emit("number_of_connectors", numberOfConnectors);
	
	// socket.broadcast.emit("come_in", socket.id);
	
	socket.on("chatting", function(data){
		const { name, msg, time } = data;
		socket.broadcast.emit("chatting", {
			name,
			msg,
			time
		})
	});
	
	socket.on("send_select_user", function(data){
		const { name, msg, time, socketId } = data;
		io.to(socketId).emit("chatting", {
			name,
			msg,
			time
		})
	});
	
	socket.on("user_register", function(data) {
		users[socket.id] = data;
		socket.broadcast.emit("new_user", {
			"nickname": data,
			"socketId": socket.id
		});
	});
	
	socket.on("disconnect", function () {
		numberOfConnectors --;
		io.emit("number_of_connectors", numberOfConnectors);
	});

});

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    }
  }),
});

app.post('/uploaded', upload.single('img'), (req, res) => {
	console.log( req.file );
	res.sendFile(__dirname + '/src/index.html');
});