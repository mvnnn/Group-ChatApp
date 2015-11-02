var express= require('express');
var app=express();
var http=require('http');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var mongo=require('mongodb').MongoClient;

app.set('views', __dirname + '/view');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res){
res.render('home');
});


    mongo.connect('mongodb://127.0.0.1/chat',function(err,db){
      if(err) throw err;

      io.on('connection',function(socket){
          var col=db.collection('aa');
					// socket.on('load',function(data){
					// 	console.log('ok');
					// })
					var statuscode=function(info){
						socket.emit('status',info);
					};

     col.find().limit(100).sort({_id:1}).toArray(function(err,res){
			 if(err)throw err;
			 socket.emit('output',res);
		 });

          socket.on('input',function(data){
            var name=data.name;
            var message=data.message;
            var emptyms=/^\s*$/;

            if(emptyms.test(name) || emptyms.test(message)){
              statuscode('name and message required');
            }
            else{
            col.insert({name:name,message:message},function(){
							io.emit('output',[data]);
              statuscode({message:'message sent',
						              clear:true} );
            });
         }
          });
      });
    });

server.listen(3000);
    console.log('server listen at : 3000');
