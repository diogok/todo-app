all: upload

clear:
	rm todo.zip
	rm todo.apk

build: clear
	zip todo.zip * -r

upload: build
	curl -F file=@todo.zip -u diogo@diogok.net -F 'data={"title":"To Do","create_method":"file"}' \
		https://build.phonegap.com/api/v1/apps

download: 
	wget http://build.phonegap.com/apps/622086/download/android -O todo.apk

install: download
	adb install -r todo.apk

launch:
	chromium index.html

