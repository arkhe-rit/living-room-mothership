# living room

## Getting it running

### Requirements

- [Node.js and NPM](https://nodejs.org/en/download/)

### Run

In a terminal window (likely Git Bash on Windows or the Terminal on Mac) run:

```js
npm run start
```


# Dashboard/TV Redis connectivity

### Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)
    - [Windows Linux Kernel](https://learn.microsoft.com/en-us/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package)

### Running

In a terminal (likely vscode's integrated terminal) run:
```js
npm run start
```
to start the main server. In separate terminals run the following to start the dashboard and TV respectively:
```js
npm run start-dashboard
```
```js
npm run start-tv
```
The dashboard will open on port 4321 and the TV will open on port 1234.