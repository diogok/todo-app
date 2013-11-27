all: upload

clear:
	rm todo.zip -f
	rm todo.apk -f

build: clear
	zip todo.zip * -r

upload: build
	curl -F file=@todo.zip -X PUT -u diogo@diogok.net https://build.phonegap.com/api/v1/apps/622086

download: 
	wget http://build.phonegap.com/apps/622086/download/android -O todo.apk

install: download
	adb install -r todo.apk

launch:
	chromium index.html

