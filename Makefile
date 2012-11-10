
watch:
	sass --watch --scss sass/style.scss:public/css/style.css
	supervisor server.js

deploy:
	jitsu deploy

default: