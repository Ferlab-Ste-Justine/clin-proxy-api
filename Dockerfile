FROM node:10.15-alpine
ADD . /code
WORKDIR /code
RUN cp -p docker.env .env
RUN npm install -g pnpm
RUN pnpm install -g pnpm
RUN pnpm i --force
CMD ["pnpm", "start"]