#Copy environment file
if [ ! -f app/.env ]; then
  echo "Please, copy the development.env file to app/.env and don't forget to replace the __UNDEFINED__ value by the elasticsearch basic auth token";
  exit 1;
fi

NPM=$(which npm)
if [ -z "$NPM" ]; then
  echo "Node needs to be installed locally to run clin-proxy-api services directly.
Either install node on your machine or launch the dockerized version.";
  exit 1;
fi

#Make sure pnpm is installed
PNPM=$(which pnpm)
if [ -z "$PNPM" ]; then
  npm install -g pnpm;
fi

(
  cd app;
  pnpm install;
  pnpm start
)