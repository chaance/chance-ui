YARN := yarn --silent
NODE := $(YARN) node
TS_NODE := $(YARN) node -r ts-node/register

bootstrap: clean
	$(YARN) --ignore-engines
	$(YARN) lerna bootstrap

build:
	$(TS_NODE) --max-old-space-size=3049 scripts/build-all

clean-build:
	$(TS_NODE) scripts/clean-dist

clean:
	rm -rf node_modules
	rm -rf yarn.lock
	rm -rf .cache
	rm -rf packages/*/node_modules
	$(MAKE) clean-build
