cd /home/dmp/mjpg-streamer/mjpg-streamer
export LD_LIBRARY_PATH="$(pwd)"
./mjpg_streamer -i "./input_uvc.so -y -r 320x240 -f 10" -o "./output_http.so -w ./www" &
cd /home/dmp/plant
node app.js &
