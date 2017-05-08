include n.Makefile

TEST_APP := "ft-syndication-branch-${CIRCLE_BUILD_NUM}"

run:
	nht run --local --https

unit-test:
	@export NEW_SYNDICATION_USERS=testUserUuid1,testUserUuid2; \
	export NEW_SYNDICATION_USERS_AWAITING=testUserUuid3,testUserUuid4; \
	mocha test/server/ --recursive -t 10000
	@$(DONE)

test: verify

provision:
	nht float -md --testapp ${TEST_APP} --skip-gtg

tidy:
	nht destroy ${TEST_APP}

deploy:
	nht configure
	nht deploy --skip-gtg
