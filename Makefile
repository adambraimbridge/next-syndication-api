include n.Makefile

TEST_APP := "ft-syndication-branch-${CIRCLE_BUILD_NUM}"

run-local:
	nht run --local

provision:
	nht float -md --testapp ${TEST_APP} --skip-gtg

tidy:
	nht destroy ${TEST_APP}

deploy:
	nht ship
