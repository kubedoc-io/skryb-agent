FROM mhart/alpine-node:16
LABEL maintainer="Joel Grenon <joelgrenon@covistra.com>"

WORKDIR /opt/service

COPY package.json package.json
RUN apk add --no-cache --virtual build_tools make gcc g++ python && npm install -q && apk del build_tools
COPY . /opt/service

ENV NODE_ENV production
EXPOSE 15999

CMD ["./src/main.js", "start"]