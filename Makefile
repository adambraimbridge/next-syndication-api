include n.Makefile

TEST_APP := "ft-syndication-branch-${CIRCLE_BUILD_NUM}"

run:
	nht run --local --https

unit-test:
	@export NEW_SYNDICATION_USERS=testUserUuid1,testUserUuid2; \
	export NEW_SYNDICATION_USERS_AWAITING=testUserUuid3,testUserUuid4; \
	mocha test/server/ --recursive -t 10000
	@$(DONE)

coverage-report:
	@nyc --all --reporter=lcovonly --reporter=text make unit-test
	@$(DONE)

run-coveralls: coverage-report
	@cat ./coverage/lcov.info | coveralls
	@$(DONE)

test: verify
ifeq ($(CIRCLECI),true)
	@make run-coveralls
else
	@make coverage-report
endif

provision:
	nht float -md --testapp ${TEST_APP} --skip-gtg

tidy:
	nht destroy ${TEST_APP}

deploy:
	nht configure
	nht deploy --skip-gtg
