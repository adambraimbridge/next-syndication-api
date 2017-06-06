node_modules/@financial-times/n-gage/index.mk:
	npm install @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

APP_NAME := ft-next-syndication-api

TEST_APP := "${APP_NAME}-branch-${CIRCLE_BUILD_NUM}"

coverage-report:
	@nyc --all --reporter=lcovonly --reporter=text make unit-test
	@$(DONE)

deploy:
	nht configure
	nht deploy --skip-gtg

install:
# delete the package-lock.json here so all modules can install correctly as
# n-gage installing secret-squirell will cause a package-lock.json to be created
	rm -rf ./package-lock.json
	make install-n-gage
	rm -rf ./package-lock.json
	npm install
	rm -rf ./package-lock.json

install-clean:
# delete the package-lock.json here so n-gage can install correctly
	rm -rf ./package-lock.json node_modules
	make install

run-coveralls: coverage-report
	@cat ./coverage/lcov.info | coveralls
	@$(DONE)

provision:
	nht float -md --testapp ${TEST_APP} --skip-gtg

run:
	nht run --local --https

test: verify
ifeq ($(CIRCLECI),true)
	@make run-coveralls
else
	@make coverage-report
endif

tidy:
	nht destroy ${TEST_APP}

unit-test:
	@export NEW_SYNDICATION_USERS=testUserUuid1,testUserUuid2; \
	export NEW_SYNDICATION_USERS_AWAITING=testUserUuid3,testUserUuid4; \
	mocha test/server/ --recursive -t 10000
	@$(DONE)
