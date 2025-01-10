# Bomberman
Bomberman is a video game franchise created by Shinichi Nakamoto and Shigeki Fujiwara, originally developed by Hudson Soft and currently owned by Konami.

![alt text](https://github.com/thepetruha/bomberman/blob/main/demo.png?raw=true)

```Makefile
run_server:
	npm run server
run_client:
	npm run client
run_game:
	make run_server & make run_client
full:
	sudo npm i && make run_game
```

### For Quick Start

```bash
make full
```