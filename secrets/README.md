# About

This script is used to create secrets belonging to the clin proxy apis.

This script is currently executed manually.  In the future, it should be automatically integrated with the creation of new environments.

# Usage

- Create a file called **clin_proxy_api_jwt_secret** and put clin's jwt secret in it

- Run:

```
./store.sh
```

- Delete the **clin_proxy_api_jwt_secret** file. Do not leave it laying around on the server