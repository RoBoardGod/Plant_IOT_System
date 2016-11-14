# 86duino plant IOT system - ZaiBo
<br>
ZaiBo 是一個在 86Duino Zeo上使用 L86duntu作業系統的工具程式，使用 USB WiFi 網卡做一個IOT系統。
[簡介影片](https://www.youtube.com/watch?v=LVtBhEpdLYw)

ZaiBo除了把原始碼公開以外，也將[建構教學](http://roboardgod.blogspot.tw/2016/11/86duino-iot-zaibo_14.html)也一併公開，任何人都可以自由使用、修改、散佈。
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
		這個UI_display是使用SDL來繪製圖形介面，提供觸控功能、自動澆水並且有遠端監控等功能。
		
	2. \l86duntu\home\dmp\TFT_display
		這個TFT_display是精簡版，精簡版雖然沒有自動澆水功能，但它可以提醒使用者澆水，
		並且採用TFT LCD做為簡易的螢幕，而網站功能皆相同。
		
	3. \l86duntu\home\dmp\plant
		我們使用了MRAA來轉換C/C++的函式到JavaScript。
		我們也建立了一個網站在L86duintu上，你可以在上面看到所有的數值(例如：濕度、水量、溫度...等)，
		也有即時網路攝影機來讓你隨時觀看並照顧你的盆栽。
		
	4. \l86duntu\etc\init.d\plant
		這個script可以讓我們在開機時自動啟動所有程式，並且有自動辨別的功能，詳情可以看我部落格中的介紹。
		
<br>
<br>
<br>