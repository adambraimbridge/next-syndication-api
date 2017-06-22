node_modules/@financial-times/n-gage/index.mk:
	npm install --no-package-lock @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

APP_NAME := ft-next-syndication-api

TEST_APP := "${APP_NAME}-${CIRCLE_BUILD_NUM}"

coverage-report:
	@rm -rf ./coverage ./nyc_output
	@nyc --all --reporter=lcovonly --reporter=text make unit-test
	@$(DONE)

deploy:
	./node_modules/.bin/nht ship

install:
# delete the package-lock.json here so all modules can install correctly as
# n-gage installing secret-squirell will cause a package-lock.json to be created
	rm -rf ./package-lock.json
	make install-n-gage
	npm install --no-package-lock
	rm -rf ./package-lock.json

install-clean:
# delete the package-lock.json here so n-gage can install correctly
	rm -rf ./package-lock.json node_modules
	make install

run-coveralls: coverage-report
	@cat ./coverage/lcov.info | coveralls
	@$(DONE)

provision:
	./node_modules/.bin/nht float --testapp ${TEST_APP}

run:
	./node_modules/.bin/nht run --local --https

test: verify
ifeq ($(CIRCLECI),true)
	@make run-coveralls
else
	@make coverage-report
endif

tidy:
	# nothing to tidy

unit-test:
	@export NEW_SYNDICATION_USERS=testUserUuid1,testUserUuid2; \
	export NEW_SYNDICATION_USERS_AWAITING=testUserUuid3,testUserUuid4; \
	export NODE_ENV="test" && \
	node ./node_modules/.bin/mocha --full-trace --harmony --recursive --slow 15000 --sort --timeout 30000 test/
	@$(DONE)
