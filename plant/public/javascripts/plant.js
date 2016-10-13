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
    var remainingWater = data.Remaining;
    var humidityLevel = data.Humidity;
    var airhumidity = data.etHumidity;
    var temperature = data.Temperature;
    var pressure = data.Pressure;
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
          .css("width", pressure/10 + "%")
          .attr("aria-valuenow", pressure)
          .text(pressure + "mbar");
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
};                                                

function Set_Settings(my_form) {
	var f_name = document.getElementsByName("name");
	var f_email = document.getElementsByName("email");
	var f_humidity = document.getElementsByName("humidity");
	var f_MaxCistern = document.getElementsByName("MaxCistern");
	var f_minCistern = document.getElementsByName("minCistern");
	var obj = {
		name: f_name[0].value,
		email: f_email[0].value,
		mode: my_form.mode.value,
		humidity: f_humidity[0].value,
		MaxCistern: f_MaxCistern[0].value,
		minCistern: f_minCistern[0].value
	};
    alert("Setting compile!\nName: " + obj.name
		+ "\nMail: " + obj.email
		+ "\nMode: " + (obj.mode == 0 ? "Warning" : "Watering")
		+ "\nhumidity: " + obj.humidity
		+ "\nMaxCistern: " + obj.MaxCistern
		+ "\nminCistern: " + obj.minCistern
		);
	
    socket.emit('SetSettings',obj);
};

