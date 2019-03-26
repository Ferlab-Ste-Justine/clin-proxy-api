FROM node:10.14-alpine
ADD . /code
WORKDIR /code
RUN cp -p docker.env .env
RUN npm install -g pnpm
RUN pnpm install -g pnpm
RUN pnpm upgrade pnpm
RUN pnpm i
RUN pnpm run build
CMD ["pnpm", "run", "service-auth"]