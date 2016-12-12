#include "Arduino.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>


#include "SDL/SDL.h"
#include "SDL/SDL_image.h"
#include "SDL/SDL_ttf.h"
#include "SDL/SDL_gfxPrimitives.h"

#include <sys/ioctl.h>
#include <net/if.h>
#include <unistd.h>
#include <arpa/inet.h>

#include "sio_client.h"
#include "sio_message.h"
#include "sio_socket.h"



short keyshift_x = 0,keyshift_y = 0;

float ad[5];
float ad_show[5];
int ad_pins_map[5] = {1,0,3,2,4};
int ad_magnification[5] = {100,100,100,100,1000};
float ad_max[5] = {100,100,40,100,1500};
float ad_min[5] = {0,0,0,0,500};

SDL_Surface *ad_msg = NULL;

const int SCREEN_WIDTH = 320;
const int SCREEN_HEIGHT = 240;
const int SCREEN_BPP = 32;


SDL_Surface *buttonSheet = NULL;
SDL_Surface *background = NULL;
SDL_Surface *loading = NULL;
SDL_Surface *screen = NULL;


SDL_Surface *message = NULL;
TTF_Font *font = NULL;
SDL_Color textColor = { 255, 255, 255 };

SDL_Event event;
SDL_Rect Button_clips[ 4 ];
SDL_Rect Loading_clips[ 8 ];

sio::client socketio;



void RGBtoBGR(SDL_Surface*);
void handle_keys(SDL_Event* , int* );
void apply_surface( int , int , SDL_Surface* , SDL_Surface* , SDL_Rect* );
bool SDL_init();
bool load_files();
void clean_up();
void set_clips();

int mode = 0;

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


class Button
{
    private:

    SDL_Rect* clip;

    public:
    SDL_Rect box;
    Button( int x, int y, int w, int h );

    void handle_events();

    void show();
};
Button::Button( int x, int y, int w, int h )
{
    box.x = x;
    box.y = y;
    box.w = w;
    box.h = h;

    clip = &Button_clips[ 0 ];
}

void Button::handle_events()
{
    int x = event.motion.x;
    int y = event.motion.y;

    if( event.type == SDL_MOUSEMOTION )
    {
        if( ( x > box.x ) && ( x < box.x + box.w ) && ( y > box.y ) && ( y < box.y + box.h ) )
        {
            clip = &Button_clips[ 2 ];
        }
        else
        {
            clip = &Button_clips[ 0 ];
        }
    }
    if( event.type == SDL_MOUSEBUTTONDOWN )
    {
        if( event.button.button == SDL_BUTTON_LEFT )
        {
            if( ( x > box.x ) && ( x < box.x + box.w ) && ( y > box.y ) && ( y < box.y + box.h ) )
            {
				socketio.socket()->emit("water");
                clip = &Button_clips[ 2 ];
            }
        }
    }
    if( event.type == SDL_MOUSEBUTTONUP )
    {
        if( event.button.button == SDL_BUTTON_LEFT )
        {
			socketio.socket()->emit("stopwater");
			clip = &Button_clips[ 3 ];
        }
    }
}

void Button::show()
{
    apply_surface( box.x, box.y, buttonSheet, screen, clip );
}

void RGBtoBGR(SDL_Surface *image)
{
	int i, size;
	unsigned char *data, swp;
	data=(unsigned char*)image->pixels;

	size=4*image->w*image->h;
	for(i=0;i<size;i+=4)
	{
		swp=data[i];
		data[i]=data[i+2];
		data[i+2]=swp;
	}
}
 
void handle_keys(SDL_Event* event, int* quit)
{
    if (event->type == SDL_KEYDOWN)
    {
		switch(event->key.keysym.sym){
			case SDLK_ESCAPE:
				*quit = 1;
				break;
			case SDLK_UP:
				keyshift_y--;
				break;
			case SDLK_DOWN:
				keyshift_y++;
				break;
			case SDLK_LEFT:
				keyshift_x--;
				break;
			case SDLK_RIGHT:
				keyshift_x++;
				break;
			case SDLK_w:
				socketio.socket()->emit("water");
				break;
		}
    }
}

void apply_surface( int x, int y, SDL_Surface* source, SDL_Surface* destination, SDL_Rect* clip = NULL )
{
    SDL_Rect offset;

    offset.x = x;
    offset.y = y;

    SDL_BlitSurface( source, clip, destination, &offset );
}

bool SDL_init()
{
    if( SDL_Init( SDL_INIT_EVERYTHING ) == -1 )
    {
        return false;
    }

    screen = SDL_SetVideoMode( SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_BPP, SDL_SWSURFACE );

    if( screen == NULL )
    {
        return false;
    }

    if( TTF_Init() == -1 )
    {
        return false;
    }

    SDL_WM_SetCaption( "TTF Test", NULL );

    return true;
}

bool load_files()
{
	if(mode == 0)
		background = SDL_LoadBMP("background2.bmp");
	else
		background = SDL_LoadBMP("background.bmp");
    loading = SDL_LoadBMP("loading.bmp");
    buttonSheet = SDL_LoadBMP( "water.bmp" );

    font = TTF_OpenFont( "mvboli.ttf", 12 );


    if( background == NULL )
    {
        return false;
    }
    if( loading == NULL )
    {
        return false;
    }
    if( font == NULL )
    {
        return false;
    }
	
    if( buttonSheet == NULL )
    {
        return false;
    }
	
    return true;
}

void clean_up()
{
    SDL_FreeSurface( background );
    SDL_FreeSurface( loading );
    SDL_FreeSurface( message );

    TTF_CloseFont( font );

    TTF_Quit();

    SDL_Quit();
}

void set_clips()
{
	for(int j = 0; j < 2; j++){
		for(int i = 0 ; i < 2; i++){
			Button_clips[j*2+i].x = 47*i;
			Button_clips[j*2+i].y = 47*j;
			Button_clips[j*2+i].w = 47;
			Button_clips[j*2+i].h = 47;
		}
	}
	for(int j = 0; j < 2; j++){
		for(int i = 0 ; i < 4; i++){
			Loading_clips[j*4+i].x = 320*i;
			Loading_clips[j*4+i].y = 240*j;
			Loading_clips[j*4+i].w = 320;
			Loading_clips[j*4+i].h = 240;
		}
	}
}

void rotation(float *x,float *y,float degree)
{
	float radian = degree * 0.017453;
	float prex = *x,prey = *y;	
	*x = prex*cos(radian)-prey*sin(radian);
	*y = prex*sin(radian)+prey*cos(radian);
	
}

void OnMessage(sio::event & val)
{
	ad_show[ad_pins_map[0]] = (float)val.get_message()->get_map()["Remaining"]->get_int();
	ad_show[ad_pins_map[1]] = (float)val.get_message()->get_map()["Humidity"]->get_int();
	ad_show[ad_pins_map[2]] = (float)val.get_message()->get_map()["etHumidity"]->get_int();
	ad_show[ad_pins_map[3]] = (float)val.get_message()->get_map()["Temperature"]->get_int();
	ad_show[ad_pins_map[4]] = (float)val.get_message()->get_map()["Pressure"]->get_double();
	for(int i = 0; i < 5; i++){
		if(ad_show[i] > ad_max[i])
			ad_show[i] = ad_max[i];
		else if (ad_show[i] < ad_min[i])
			ad_show[i] = ad_min[i];
	
		ad[i] = (ad_show[i] - ad_min[i]) / (ad_max[i] - ad_min[i]);
	}	
	
	if(mode != (int)val.get_message()->get_map()["mode"]->get_int()){
		mode = (int)val.get_message()->get_map()["mode"]->get_int();
		SDL_FreeSurface( background );
		if(mode == 0)
			background = SDL_LoadBMP("background2.bmp");
		else
			background = SDL_LoadBMP("background.bmp");
	}
	
	if(mode == 0 && ad_show[ad_pins_map[4]] != ad_min[ad_pins_map[4]]){
		ad_show[ad_pins_map[0]] = (1013-(ad_show[ad_pins_map[4]]))*8.6227;
		if(ad_show[ad_pins_map[0]] <= 0)
			ad_show[ad_pins_map[0]] = 0;
		ad[ad_pins_map[0]] = ad_show[ad_pins_map[0]] / 100;
	}else if(mode == 0){
		ad_show[ad_pins_map[0]] = 0;
	}
}
int main( int argc, char* args[] )
{
    int quit = 0;

    if( SDL_init() == false )
    {
		printf("init fail\n");
        return 1;
    }

    if( load_files() == false )
    {
		printf("load fail\n");
        return 1;
    }
    Button myButton( 10, 183, 47, 47 );
    set_clips();
	SDL_FillRect( screen, &screen->clip_rect, SDL_MapRGB( screen->format, 0xFF, 0xFF, 0xFF ) );
		
	socketio.connect("http://localhost:3000");
	ad_msg = TTF_RenderText_Solid( font, "Loading... Please wait", textColor );
	for( int count = 0; !socketio.opened() && count < 300; count ++){
		apply_surface( 0, 0, loading, screen, &Loading_clips[count % 8] );
		apply_surface(20,115, ad_msg, screen );
		
		RGBtoBGR(screen);
		SDL_Flip( screen );
		usleep(100000);
	}
	
	FILE *fp;
	char usbwifiID[20];
	fp = fopen("/tmp/usbwifiID", "r");
	fscanf(fp, "%s", usbwifiID);
	fclose(fp);

    while( !quit )
    {		
		//keyshift
		/*
		char shift[10];
		sprintf(shift,"%d",keyshift_x);
		ad_msg = TTF_RenderText_Solid( font, shift, textColor );
		apply_surface(10, 50, ad_msg, screen );
		
		sprintf(shift,"%d",keyshift_y);
		ad_msg = TTF_RenderText_Solid( font, shift, textColor );
		apply_surface(30,50, ad_msg, screen );
		*/
		
		
		message = TTF_RenderText_Solid( font, get_IP(usbwifiID), (SDL_Color){ 255, 0, 0 } );
        apply_surface( 0, 0, background, screen );
		apply_surface( 215, 225, message, screen );
        myButton.show();
		
		
		short homex = 180,homey = 108;
		/*
		for(int i = 0; i < 5; i++)
			ad[ad_pins_map[i]] = (float)analogRead(A0+i)/1024;
		*/
		socketio.socket()->on("update", &OnMessage);
		
		for(int i = 0; i < 5; i++){
			float x = 0,y = 78;
			float x2 = 0,y2 = 88;
			float avg1,avg2;
			short output_x[4];
			short output_y[4];
			char s[20];
			avg1 = i!=0 ? (ad[i]+ad[i-1])/4 : (ad[0]+ad[4])/4;
			avg2 = i!=4 ? (ad[i]+ad[i+1])/4 : (ad[0]+ad[4])/4;
			
			rotation(&x2,&y2,-180-72*i-36);

			sprintf(s,"%d",(int)(ad_show[i]));
			if((int)(ad_show[i]) != 0){
				ad_msg = TTF_RenderText_Solid( font, s, (SDL_Color){ 255, 64, 64 } );
				apply_surface((x2*ad[i]) +homex -9,(y2*ad[i]) +homey  -4, ad_msg, screen );

				rotation(&x,&y,-180-72*i);
				output_x[0] = (x*avg1) + homex;
				output_y[0] = (y*avg1) + homey;
				rotation(&x,&y,-36);
				output_x[1] = (x*ad[i]) + homex;
				output_y[1] = (y*ad[i]) + homey;
				rotation(&x,&y,-36);
				output_x[2] = (x*avg2) + homex;
				output_y[2] = (y*avg2) + homey;
				
				output_x[3] = homex;
				output_y[3] = homey;

				filledPolygonRGBA(	screen, 
									output_x, output_y,
									4,
									(1.0-(float)ad[i])*255, (float)ad[i]*255, 0, 128);
			}else{
				rotation(&x,&y,-180-72*i);
				output_x[0] = (x*avg1) + homex;
				output_y[0] = (y*avg1) + homey;
				rotation(&x,&y,-36);
				output_x[1] = (x) + homex;
				output_y[1] = (y) + homey;
				rotation(&x,&y,-36);
				output_x[2] = (x*avg2) + homex;
				output_y[2] = (y*avg2) + homey;
				
				output_x[3] = homex;
				output_y[3] = homey;

				filledPolygonRGBA(	screen, 
									output_x, output_y,
									4,
									0, 255, 0, 128);
			}
		}
        while(SDL_PollEvent(&event))
        {
            if (event.type == SDL_QUIT)
            {
                quit = 1;
            }
            handle_keys(&event, &quit);
			
            myButton.handle_events();
        }
		
		RGBtoBGR( screen );
		SDL_Flip( screen );
		
		usleep(500000);
		
    }
    clean_up();
    return 0;
}




