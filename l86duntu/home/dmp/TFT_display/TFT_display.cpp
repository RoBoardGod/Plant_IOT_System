#include "Arduino.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#include <sys/ioctl.h>
#include <net/if.h>
#include <unistd.h>
#include <arpa/inet.h>

#include "sio_client.h"
#include "sio_message.h"
#include "sio_socket.h"

#include <TFT.h>
#include <SPI.h>
#define cs   42
#define dc   43
#define rst  44


int TFT_val[4] = {0};
int TFT_rval[4] = {0};
char* TFT_name[4] = {"Humidity: ", "Temperature: ", "Air Humidity: ", "Pressure: "};
char* TFT_unit[4] = {"%", "C", "%RH", "hPa"};
char* last_IP = "";

float ad[5];
int ad_pins_map[5] = {1,0,3,2,4};
int ad_magnification[5] = {100,100,100,100,100};


sio::client socketio;



char* get_IP(const char *iface){
	
	struct ifreq ifr;
	int fd = socket(AF_INET, SOCK_DGRAM, 0);
 
    //Type of address to retrieve - IPv4 IP address
    ifr.ifr_addr.sa_family = AF_INET;
 
    //Copy the interface name in the ifreq structure
    strncpy(ifr.ifr_name , iface , IFNAMSIZ-1);
 
    ioctl(fd, SIOCGIFADDR, &ifr);
 
    close(fd);
	return inet_ntoa(( (struct sockaddr_in *)&ifr.ifr_addr )->sin_addr);
}

void OnMessage(sio::event & val)
{
	ad[ad_pins_map[0]] = (float)val.get_message()->get_map()["Remaining"]->get_int();
	ad[ad_pins_map[1]] = (float)val.get_message()->get_map()["Humidity"]->get_int();
	ad[ad_pins_map[2]] = (float)val.get_message()->get_map()["etHumidity"]->get_int();
	ad[ad_pins_map[3]] = (float)val.get_message()->get_map()["Temperature"]->get_int();
	ad[ad_pins_map[4]] = (float)val.get_message()->get_map()["Pressure"]->get_double();
}

void TFT_drawBitmap(int x, int y, FILE *myFile, TFT *TFTdisp) {
  if (myFile) { 
    unsigned long w = 0, h = 0;
    char c = 0, R = 0, G = 0, B = 0;
	for(int i = 0; i < 18 && c != EOF; i++)
		c = getc(myFile);
    for (int i = 0; i < 4 && c != EOF; i++)
      w += (((c = getc(myFile)) & 0xFF) << (i * 8));
    for (int i = 0; i < 4 && c != EOF; i++)
      h += (((c = getc(myFile)) & 0xFF) << (i * 8));
	for(int i = 0; i < 28 && c != EOF; i++)
		c = getc(myFile);
	
	for (int j = h - 1; j >= 0; j--) {
      for (int i = 0; i < w; i++){
		B = getc(myFile);
		G = getc(myFile);
		R = getc(myFile);
		TFTdisp->stroke(R, G, B);
		TFTdisp->point(x+i, y+j);
	  }
      for (int i = 4; i > (w % 4) && (w % 4) != 0; i--)
        getc(myFile);
    } 
  }
}

int main( int argc, char* args[] )
{
	
	char usbwifiID[20];
	FILE *fp = fopen("/tmp/usbwifiID", "r");
	fscanf(fp, "%s", usbwifiID);
	fclose(fp);
	
	TFT TFTscreen = TFT(cs, dc, rst);
	TFTscreen.begin();
	TFTscreen.background(0, 0, 0);
	
	
	socketio.connect("http://localhost:3000");
	
	for( int count = 0; !socketio.opened() && count < 30; count ++){
		usleep(100000);
	}
	
	TFTscreen.fill(255, 0, 0);
	TFTscreen.stroke(255, 0, 0);
	TFTscreen.rect(0, 0, 160, 15);
	
	TFTscreen.stroke(255, 255, 255);
	TFTscreen.setTextSize(1);
	TFTscreen.text(" < 86Duino plant on TFT > ", 0, 3);
	
	TFTscreen.fill(0, 0, 255);
	TFTscreen.stroke(0, 0, 255);
	TFTscreen.rect(0, 114, 160, 15);
	
	TFTscreen.stroke(255, 255, 255);
	TFTscreen.setTextSize(1);
	last_IP = get_IP(usbwifiID);
	TFTscreen.text(last_IP, 40, 117);
	
	
	usleep(100000);
	FILE *file = fopen("/home/dmp/TFT_display/background.bmp", "r");
	TFT_drawBitmap(55, 15, file, &TFTscreen);

	for (int i = 0; i < 4; i++) {
		TFTscreen.stroke(0, 255, 0);
		TFTscreen.text(TFT_name[i], 5 , 16 + i * 25);
		TFTscreen.text(TFT_unit[i], 70 , 30 + i * 25);
	}
	char buffer[10];
	
    while( true )
    {		

		socketio.socket()->on("update", &OnMessage);
		
		TFT_val[0] = ad[0];
		TFT_val[1] = ad[2];
		TFT_val[2] = ad[3];
		TFT_val[3] = ad[4];
		
		TFTscreen.setTextSize(2);
		for (int i = 0; i < 4; i++) {
			if(TFT_val[i] == TFT_rval[i])
				continue;
			/*
			sprintf(buffer, "% 5d", TFT_rval[i]);
			TFTscreen.stroke(0, 0, 0);
			TFTscreen.text(buffer, 5 , 24 + i * 25);
			*/
			TFTscreen.fill(0, 0, 0);
			TFTscreen.stroke(0, 0, 0);
			TFTscreen.rect(5, 24 + i * 25, 60, 15);
		}
		for (int i = 0; i < 4; i++) {
			if(TFT_val[i] == TFT_rval[i])
				continue;
			sprintf(buffer, "% 5d", TFT_val[i]);
			TFTscreen.stroke(0, 255, 0);
			TFTscreen.text(buffer, 5 , 24 + i * 25);
		}
		
		TFT_rval[0] = TFT_val[0];
		TFT_rval[1] = TFT_val[1];
		TFT_rval[2] = TFT_val[2];
		TFT_rval[3] = TFT_val[3];
		
		if(strcmp(last_IP,get_IP(usbwifiID)) != 0){
			TFTscreen.fill(0, 0, 255);
			TFTscreen.stroke(0, 0, 255);
			TFTscreen.rect(0, 114, 160, 15);
			
			TFTscreen.stroke(255, 255, 255);
			TFTscreen.setTextSize(1);
			last_IP = get_IP(usbwifiID);
			TFTscreen.text(last_IP, 40, 117);			
		}
			
				
		usleep(500000);
		
    }
    return 0;
}




