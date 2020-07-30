# Plottery

Wrappers for personal projects using plotly.js.

## Demo (Storybook)

- [Storybook](https://clonardo.github.io/plottery/)

## Local build

- `yarn` to install dependencies
- `yarn build`
- `yarn storybook` to bring up local demo environment

## Publishing

- Published using [np](https://github.com/sindresorhus/np)
- Ensure that np is installed globally
- To publish a specific version (x.y.z), `yarn build`, then `np x.y.x --yolo`
- To publish Storybook to Github pages, `yarn build-storybook`, then `yarn deploy-storybook`
