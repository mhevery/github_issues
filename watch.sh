#!/bin/sh

tsc --watch -m commonjs -t es5 --emitDecoratorMetadata app.ts github.ts set.ts
