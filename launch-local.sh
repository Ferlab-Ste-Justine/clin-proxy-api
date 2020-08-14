#Copy environment file
cp development.env images/.env;

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
  cd images;
  pnpm install;
  pnpm start
)