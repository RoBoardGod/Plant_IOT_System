# 86duino plant IOT system - ZaiBo
<br>
ZaiBo �O�@�Ӧb 86Duino Zero�W�ϥ� L86duntu�@�~�t�Ϊ��u��{���A�ϥ� USB WiFi ���d���@��IOT�t�ΡC
<br>
[²���v��](https://www.youtube.com/watch?v=LVtBhEpdLYw)
<br>
ZaiBo���F���l�X���}�H�~�A�]�N[�غc�о�](http://roboardgod.blogspot.tw/2016/11/86duino-iot-zaibo_14.html)�]�@�֤��}�A����H���i�H�ۥѨϥΡB�ק�B���G�C

<br>
<br>


ZaiBo is a 86Duino Zero on the use of L86duntu operating system tool program, using USB WiFi card to do an IOT system.
<br>
[Introduction video](https://www.youtube.com/watch?v=LVtBhEpdLYw)
<br>
In addition to the original code, ZaiBo will also open the [teaching of construction](http://roboardgod.blogspot.tw/2016/11/86duino-iot-zaibo_14.html), any person can freely use, modify, distribute.

<br>
<br>
<br>
![](https://3.bp.blogspot.com/-TaLSBJyWCHM/WCkRY_NqpEI/AAAAAAAATNg/1WQs4kb6NuYReLrDIDnmvTvmoUTQY6oNgCEw/s1600/blog01.JPG)
<br>
[My blog](http://roboardgod.blogspot.tw/)
<br>
-------------
## I. File list
-------------
	1. \l86duntu\home\dmp\UI_display
		�o��UI_display�O�ϥ�SDL��ø�s�ϧΤ����A����Ĳ���\��B�۰ʼ���åB�����ݺʱ����\��C
		The UI_display use SDL to draw graphical interface, providing touch function,
		automatic watering and remote monitoring and other functions.
		
	2. \l86duntu\home\dmp\TFT_display
		�o��TFT_display�O��²���A��²�����M�S���۰ʼ���\��A�����i�H�����ϥΪ̼���A
		�åB�ĥ�TFT LCD����²�����ù��A�Ӻ����\��ҬۦP�C
		The TFT_display is a compact, lightweight version, although there is no automatic watering function,
		but it can remind the user watering, and the use of TFT LCD as a simple screen, and website functions 
		are the same.
		
	3. \l86duntu\home\dmp\plant
		�ڭ̨ϥΤFMRAA���ഫC/C++���禡��JavaScript�C
		�ڭ̤]�إߤF�@�Ӻ����bL86duintu�W�A�A�i�H�b�W���ݨ�Ҧ����ƭ�(�Ҧp�G��סB���q�B�ū�...��)�A
		�]���Y�ɺ�����v�������A�H���[�ݨ÷��U�A���֮�C
		We used MRAA to convert C / C ++ functions to JavaScript.
		We have also created a website on L86duintu where you can see all the values (eg humidity, water, 
		temperature ...)
		There are also instant webcams that let you watch and take care of your potted plants at any time.
		
	4. \l86duntu\etc\init.d\plant
		�o��script�i�H���ڭ̦b�}���ɦ۰ʱҰʩҦ��{���A�åB���۰ʿ�O���\��A�Ա��i�H�ݧڳ����椤�����СC
		This script allows us to start automatically when the boot all the programs, and automatic identification
		function, the details can see my blog in the introduction.
		
<br>
<br>
<br>