include n.Makefile

TEST_APP := "ft-syndication-branch-${CIRCLE_BUILD_NUM}"

run-local:
	nht run --local

provision:
	nht float -d --testapp ${TEST_APP}

tidy:
	nht destroy ${TEST_APP}

deploy:
	nht ship
