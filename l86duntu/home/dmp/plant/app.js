/**
 * Module dependencies.
 */

var nodemailer = require('nodemailer');
var m = require('mraa');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/images/86Duino.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/settings', routes.settings);

var server = http.createServer(app);

server.listen(app.get('port'));
console.log('ready');
serv_io = io.listen(server);


//rm-g185 variables
var rm_g185 = new m.I2c(0);

//pump variables
var pump = new m.Pwm(6);
pump.period_ms(60);
pump.enable(true);
var pump_speed = 0;
var pump_time = 0;

//cistern variables
var sonic_echo = new m.Gpio(3); 
var sonic_trig = new m.Gpio(2); 
sonic_echo.dir(m.DIR_IN);
sonic_trig.dir(m.DIR_OUT);	
var cistern_full = 17.5;
var cistern_shortage = 3.5;

//humidity variables
var humidity = new m.Aio(4);
var humidity_dry = 65;

//other variables
var outputval = [0,0,0,0,0];
var mailSend = false;
var Drying_counter = 0;
var Drying_wait = 15;
var Watering = false;

//filesystem variables
var buf_count = 0;
var array = new Array(5);
for(i = 0; i < 5; i++)
	array[i] = new Array();
var json_len = 10;
var record_addr = "/home/dmp/plant/record.json";
var settings_addr = "/home/dmp/plant/settings.json";
var settings = require(settings_addr);

//debug led

var led0 = new m.Gpio(8); 
var led1 = new m.Gpio(9); 
var led2 = new m.Gpio(10); 
led0.dir(m.DIR_OUT);
led1.dir(m.DIR_OUT);
led2.dir(m.DIR_OUT);
var ledState0 = true;
var ledState1 = true;
var ledState2 = true;
function periodicActivity()
{
  led0.write(ledState0?1:0);
  ledState0 = !ledState0;
  setTimeout(periodicActivity,1000);
}
periodicActivity();

var transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 25,
    tls: {
        rejectUnauthorized: false
    }
});

var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
	for (var k2 in interfaces[k]) {
		var address = interfaces[k][k2];
		if (address.family === 'IPv4' && !address.internal) {
			addresses.push(address.address);
		}
	}
}
if(settings.addresses != addresses[addresses.length-1]){
	settings.addresses = addresses[addresses.length-1];
	var fs = require('fs');
	fs.writeFile(settings_addr, JSON.stringify(settings));
	var getIP_mailOptions = {
		sender: '86planter@86duino.com',
		to: settings.email,
		subject: '來自 ' + settings.name + ' 的IP更換通知',

		text: '親愛的主人您好 :\n'
			+ '我是' + settings.name + ',\n'
			+ '我的IP因為某些原因被換掉了！\n'
			+ '現在的網址為: http://' + settings.addresses + ':3000\n'
			+ '有空可以來關心我唷！'
			+ '\n\n'
			+ '來自你可愛的盆栽'
	};
	transporter.sendMail(getIP_mailOptions, function(err, info){
		if(err)
			console.log(err);
		else
			console.log(info);
	});
}

setInterval(function resetMailSend() {
    mailSend = false;
}, 7200000);

//---------------pump system---------------//
setInterval(function IsWatering(){
	if(Watering){
		pump_time = Date.now();
        pump_speed += .1;
		if(pump_speed >= 1)
            pump.write(1);
        else
			pump.write(pump_speed);
    }else if(pump_time + 5000 > Date.now()){
        pump_speed += .1;
		if(pump_speed >= 1)
            pump.write(1);
        else
			pump.write(pump_speed);
	}else{
		pump_speed = 0;
		Watering = false;
		pump.write(0);
	}
},500);
  
//---------------get data---------------//
function sleep(delay) {
  delay += Date.now();
  while (Date.now() < delay);
}

function checkCistern(){	
	sonic_trig.write(0);
	sleep(2);
	sonic_trig.write(1); 
	sleep(10);
	sonic_trig.write(0);	  
	var out = Date.now();
	
    while(sonic_echo.read() == 0)
		if(out + 500 < Date.now())
			return;
    var t = process.hrtime();
    while(sonic_echo.read() == 1)
		if(out + 500 < Date.now())
			return;
    t = process.hrtime(t);
	var v = (settings.MaxCistern - t[1] / 58200)*100/settings.MaxCistern;
	if( v >= 0 )
		outputval[0] = Math.round((outputval[0] + v)/2); // 58200 = 1000 * 2 * 29.1
	else
		outputval[0] = 0;
	
}
  
setInterval(function checkState() {
    var v, d;
	checkCistern();
	v =humidity.readFloat()*100;
	if( v >= 0 )
		outputval[1] = Math.round((outputval[1] + v)/2);
	else
		outputval[1] = 0;

	rm_g185.address(0x40);	//SHT21
	d = rm_g185.readBytesReg(0xE5, 3);	//etHumidity
	v = -6.0 + 125.0 / 65536.0 * ((d[0] * 256) + d[1]);
	if( v >= 0  && v <= 100)
		outputval[2] = Math.round((outputval[2] + v)/2);
	else
		outputval[2] = 0;

	rm_g185.address(0x40);	//SHT21
	d = rm_g185.readBytesReg(0xE3, 3);	//GetTemperature
	v = -46.85 + 175.72 / 65536.0 * ((d[0] * 256) + d[1]);
	if( v >= 0 && v <= 100)
		outputval[3] = Math.round((outputval[3] + v)/2);
	else
		outputval[3] = 0;
	
	
	rm_g185.address(0x5D);	//LPS331
	rm_g185.writeReg(0x20,0xE0);	//init
	rm_g185.address(0x5D);	//LPS331
	d = rm_g185.readBytesReg(0xA8, 3);
	v = (d[2] * 65536 + d[1] * 256 + d[0]) / 4096;
	if( v >= 0 && v <= 2000)
		outputval[4] = (outputval[4] + v) / 2;
	else
		outputval[4] = 0;
	
	for(var i = 0; i < 5; i++){
		array[i].push(outputval[i]);
	}
    buf_count ++;
    if(buf_count > 7200)
	{
		for(var i = 0; i < 5; i++)
			array[i].sort();
        var myData = require(record_addr);
        var now = new Date();
        myData.push({
            time: (now.getMonth()+1) + "/" + now.getDate() + " " + now.toLocaleTimeString(),
            Remaining: array[0][Math.floor(buf_count/2)],
            Humidity: array[1][Math.floor(buf_count/2)],
            etHumidity: array[2][Math.floor(buf_count/2)],
            Temperature: array[3][Math.floor(buf_count/2)],
            Pressure: array[4][Math.floor(buf_count/2)]
        });
        fs = require('fs');
        fs.writeFile(record_addr, JSON.stringify(myData));
        buf_count = 0;
		for(var i = 0; i < 5; i++)
			array[i] = [];
		
		if(array[1][Math.floor(buf_count/2)] < settings.humidity && settings.mode == 0 && !mailSend){
			console.log('send mail');
			mailSend = true;
			var Warning_mailOptions = {
				sender: '86planter@86duino.com',
				to: settings.email,
				subject: '來自 ' + settings.name + ' 的求救信',

				text: '親愛的主人您好 :\n'
					+ '我是' + settings.name + ',\n'
					+ '拜託救救我! 我口渴了,\n'
					+ '請抽空來幫我澆水，拜託了！\n'
					+ '現在的土壤濕度為 ' + outputval[1] + '%，\n'
					+ '已經低於'+ settings.humidity +'%了。'
					+ '現在的網址為: http://' + settings.addresses + ':3000\n'
					+ '\n\n'
					+ '來自你可愛的盆栽'
			};
			transporter.sendMail(Warning_mailOptions, function(err, info){
				if(err)
					console.log(err);
				else
					console.log(info);
			});
		}
		if (array[0][Math.floor(buf_count/2)] < (settings.minCistern/settings.MaxCistern*100) && settings.mode == 1 && !mailSend)
		{
			mailSend = true;
			var Watering_mailOptions = {
				sender: '86planter@86duino.com',
				to: settings.email,
				subject: '來自 ' + settings.name + ' 的求救信',

				text: '親愛的主人您好 :\n'
					+ '我是' + settings.name + ',\n'
					+ '拜託救救我! 水桶沒水了,\n'
					+ '請抽空來幫我補充水桶的水，拜託了！\n'
					+ '現在的水桶水量為 ' + outputval[0] + '%，\n'
					+ '已經低於'+ (settings.minCistern/settings.MaxCistern*100) +'%了。'
					+ '現在的網址為: http://' + settings.addresses + ':3000\n'
					+ '\n\n'
					+ '來自你可愛的盆栽'
			};
			transporter.sendMail(Watering_mailOptions, function(err, info){
				if(err)
					console.log(err);
				else
					console.log(info);
			});
		}
    }
	
	if(outputval[0] >= (settings.minCistern/settings.MaxCistern*100) && settings.mode == 1){
		if(Drying_counter > Drying_wait ){
			Drying_counter = 0;
			Watering = true;
			console.log('auto: water');
		}else if(outputval[1] < settings.humidity){
			Drying_counter ++;
			Watering = false;
		}else{
			Drying_counter = 0;
			Watering = false;
		}
	}
		
}, 1000);

function run_cmd(cmd, args, cb, end) {
    var spawn = require('child_process').spawn,
        child = spawn(cmd, args),
        me = this;
    child.stdout.on('data', function (buffer) { cb(me, buffer) });
    child.stdout.on('end', end);
}
setInterval(function checkConnect() {
	
	led2.write(ledState2?1:0);
	ledState2 = !ledState2;
	
	var foo = new run_cmd(
    'bash', ['/home/dmp/plant/checkWIFI'],
    function (me, buffer) { me.stdout += buffer.toString() },
    function () { console.log(foo.stdout) }
	);
	
	var os = require('os');
	var interfaces = os.networkInterfaces();
	var addresses = [];
	for (var k in interfaces) {
		for (var k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if (address.family === 'IPv4' && !address.internal) {
				addresses.push(address.address);
			}
		}
	}
	if(settings.addresses != addresses[addresses.length-1] && addresses[addresses.length-1] != '10.0.1.1'){
		settings.addresses = addresses[addresses.length-1];
		var fs = require('fs');
		fs.writeFile(settings_addr, JSON.stringify(settings));
		var getIP_mailOptions = {
			sender: '86planter@86duino.com',
			to: settings.email,
			subject: '來自 ' + settings.name + ' 的IP更換通知',

			text: '親愛的主人您好 :\n'
				+ '我是' + settings.name + ',\n'
				+ '我的IP因為某些原因被換掉了！\n'
				+ '現在的網址為: http://' + settings.addresses + ':3000\n'
				+ '有空可以來關心我唷！'
				+ '\n\n'
				+ '來自你可愛的盆栽'
		};
		transporter.sendMail(getIP_mailOptions, function(err, info){
			if(err)
				console.log(err);
			else
				console.log(info);
		});
		
		led1.write(1);
	}else{
		led0.write(0);
	}
}, 30000);

serv_io.sockets.on('connection', function (socket) {
    setInterval(function () {
        socket.emit('update', {
            'mode': parseInt(settings.mode),
            'Remaining': outputval[0],
            'Humidity': outputval[1],
            'etHumidity': outputval[2],
            'Temperature': outputval[3],
            'Pressure': outputval[4]
        });
    }, 1000);
    socket.on('webStart', function() {
        var json = require(record_addr);
		json_len = 10;
        socket.emit('getJSON',json.slice(json.length < json_len ? 0 : json.length - json_len ,json.length));
    });
    socket.on('display', function(data) {
        var json = require(record_addr);
        json_len = data;
        if(json_len == -1)
            json_len = json.length;
        socket.emit('getJSON',json.slice(json.length < json_len ? 0 : json.length - json_len ,json.length));
    });
    socket.on('water', function() {
        console.log('get:water');
		Watering = true;
    });
    socket.on('stopwater', function() {
        console.log('get:stopwater');
        Watering = false;
    });
    socket.on('SetSettings', function(obj) {
        console.log('Set name: ' + obj.name);
        console.log('Set email: ' + obj.email);
        console.log('Set mode: ' + obj.mode);
        console.log('Set humidity: ' + obj.humidity);
        console.log('Set MaxCistern: ' + obj.MaxCistern);
        console.log('Set minCistern: ' + obj.minCistern);
        console.log('Set Protocol: ' + obj.Protocol);
        console.log('Set ssid: ' + obj.ssid);
        console.log('Set key: ' + obj.key);
		
		settings.name = obj.name;
		settings.email = obj.email;
		settings.mode = obj.mode;
		if(!isNaN(obj.humidity))
			settings.humidity = obj.humidity;
		if(!isNaN(obj.MaxCistern))
			settings.MaxCistern = obj.MaxCistern;
		if(!isNaN(obj.minCistern))
			settings.minCistern = obj.minCistern;
		settings.Protocol = obj.Protocol;
		settings.ssid = obj.ssid;
		settings.key = obj.key;

		
		var fs = require('fs');
		fs.writeFile(settings_addr, JSON.stringify(settings));
		if(obj.mode == 0){	//Warning mode
			var reply_mailOptions = {
				sender: '86planter@86duino.com',
				to: settings.email,
				subject: '來自 ' + settings.name + ' 的設定更改通知',

				text: '親愛的主人您好 :\n'
					+ '我是' + settings.name + ',\n'
					+ '您的設定已經更改！\n'
					+ '濕度設定在 ' + settings.humidity + '% 以下時通知您。\n'
					+ 'wifi設定為' + obj.Protocol + '協定，\n'
					+ '並將連線到' + obj.ssid + '，密碼為' + obj.key + '，\n'
					+ '建議您重開機，設定將會被正確的執行。\n'
					+ '現在的網址為: http://' + settings.addresses + ':3000\n'
					+ '\n\n'
					+ '來自你可愛的盆栽'
			};			
		}else{
			
		}
		transporter.sendMail(reply_mailOptions, function(err, info){
			if(err)
				console.log(err);
			else
				console.log(info);
		});
    });
	socket.on('Get_Settings', function() {
        console.log('Reply name: ' + settings.name);
        console.log('Reply email: ' + settings.email);
        console.log('Reply mode: ' + settings.mode);
        console.log('Reply humidity: ' + settings.humidity);
        console.log('Reply MaxCistern: ' + settings.MaxCistern);
        console.log('Reply minCistern: ' + settings.minCistern);
        console.log('Reply Protocol: ' + settings.Protocol);
        console.log('Reply ssid: ' + settings.ssid);
        console.log('Reply key: ' + settings.key);
        socket.emit('Get_Settings_reply',settings);
    });
});


