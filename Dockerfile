FROM node:10.14-alpine
RUN apk add curl
ADD . /code
WORKDIR /code
RUN cp -p docker.env .env
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
CMD ["pnpm", "run", "service-auth"]

ENV MEMORY_LIMIT 256