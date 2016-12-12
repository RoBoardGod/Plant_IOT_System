function water() {
    socket.emit('water');
};

function stopwater() {
    socket.emit('stopwater');
};

function choice(data) {
    socket.emit('display',data);
};

function interval(data) {
    var remainingWater = Math.round(data.Remaining);
    var humidityLevel = Math.round(data.Humidity);
    var airhumidity = Math.round(data.etHumidity);
    var temperature = Math.round(data.Temperature);
    var pressure = Math.round(data.Pressure);
    var Altitude = Math.round((1013 - data.Pressure) * 8.6227);
	if(data.Pressure == 0)
		Altitude = 0;
    $("#remaining-water")
          .css("width", remainingWater + "%")                           
          .attr("aria-valuenow", remainingWater)                        
          .text(remainingWater + "%");
    $("#humidity-level")                                                
          .css("width", humidityLevel + "%")
          .attr("aria-valuenow", humidityLevel)
          .text(humidityLevel + "%");                             
    $("#relative-humidity")                                            
          .css("width", airhumidity + "%")
          .attr("aria-valuenow", airhumidity)                     
          .text(airhumidity + "%RH");                               
    $("#temperature")                                             
          .css("width", temperature + "%")
          .attr("aria-valuenow", temperature)
          .text(temperature + "°C");
    $("#atmospheric-pressure")                                             
          .css("width", pressure/20 + "%")
          .attr("aria-valuenow", pressure/20)
          .text(pressure + "hPa");
    $("#Altitude")                                             
          .css("width", Altitude + "%")
          .attr("aria-valuenow", Altitude)
          .text(Altitude + "m");
};

function getJSON(item, index) {
        lineChartData.data.labels[index] = item.time;
        lineChartData.data.datasets[0].data[index] = item.Remaining;
        lineChartData.data.datasets[1].data[index] = item.Humidity;
        lineChartData.data.datasets[2].data[index] = item.etHumidity;
        lineChartData.data.datasets[3].data[index] = item.Temperature;
        lineChartData.data.datasets[4].data[index] = item.Pressure;
};

function Get_Settings_reply(item) {
	var name = document.getElementsByName("name");
	name[0].value= item.name;
	var email = document.getElementsByName("email");
	email[0].value= item.email;
	var mode = document.getElementsByName("mode");
    mode[item.mode].checked = true;
	var humidity = document.getElementsByName("humidity"); 
	humidity[0].value= item.humidity;
	var MaxCistern = document.getElementsByName("MaxCistern");
	MaxCistern[0].value= item.MaxCistern;
	var minCistern = document.getElementsByName("minCistern");
	minCistern[0].value= item.minCistern;
	var Protocol = document.getElementsByName("Protocol");
	if(item.Protocol == "WEP")
		Protocol[0].checked = true;
	else if(item.Protocol == "WPA")
		Protocol[1].checked = true;
	var ssid = document.getElementsByName("ssid");
	ssid[0].value= item.ssid;
	var key = document.getElementsByName("key");
	key[0].value= item.key;
};                                                

function Set_Settings(my_form) {
	var f_name = document.getElementsByName("name");
	var f_email = document.getElementsByName("email");
	var f_humidity = document.getElementsByName("humidity");
	var f_MaxCistern = document.getElementsByName("MaxCistern");
	var f_minCistern = document.getElementsByName("minCistern");
	var f_ssid = document.getElementsByName("ssid");
	var f_key = document.getElementsByName("key");
	var obj = {
		name: f_name[0].value,
		email: f_email[0].value,
		mode: my_form.mode.value,
		humidity: f_humidity[0].value,
		MaxCistern: f_MaxCistern[0].value,
		minCistern: f_minCistern[0].value,
		Protocol: my_form.Protocol.value,
		ssid: f_ssid[0].value,
		key: f_key[0].value
	};
    alert("Setting compile!\nName: " + obj.name
		+ "\nMail: " + obj.email
		+ "\nMode: " + (obj.mode == 0 ? "Warning" : "Watering")
		+ "\nhumidity: " + obj.humidity
		+ "\nMaxCistern: " + obj.MaxCistern
		+ "\nminCistern: " + obj.minCistern
		+ "\nProtocol: " + obj.Protocol
		+ "\nssid: " + obj.ssid
		+ "\nkey: " + obj.key
		);
	
    socket.emit('SetSettings',obj);
};

