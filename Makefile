.PHONY: run_server, run_client, run_game
run_server:
	npm run server
run_client:
	npm run client
run_game:
	make run_server & make run_client
full:
	sudo npm i && make run_game
