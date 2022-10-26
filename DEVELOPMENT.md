## Local Development

Using Act for development/testing of Github composite action.
https://github.com/nektos/act

Install Act and run:
```sh
act workflow_dispatch
```

### .env
This file should contain any environment variables needed to be passed into the `development.yml` action.

```
GITHUB_REPOSITORY=searchspring-implementations/snap.searchspring.io
```

### .secrets
Any secrets to be passed to the action should be present here.
At minimum you will need a token with permissions to checkout the repository to run the action on.

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```