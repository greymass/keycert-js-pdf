@greymass/keycert-pdf
=====================

Pure JS PDF generation for Anchor Owner Key Certificates 🚀

## Installation

The `@greymass/keycert-pdf` package is distributed as a module on [npm](https://www.npmjs.com/package/@greymass/keycert-pdf).

```
yarn add @greymass/keycert-pdf
# or
npm install --save @greymass/keycert-pdf
```

## Usage

```ts
import generate from '@greymass/keycert-pdf'
const cert = .. // KeyCertificate instance obtained from @greymass/keycert
const state = await client.chain.getInfo()
const pdfBytes = await generate({cert, state})
```

## Developing

You need [Make](https://www.gnu.org/software/make/), [node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install) installed.

Clone the repository and run `make` to checkout all dependencies and build the project. See the [Makefile](./Makefile) for other useful targets. Before submitting a pull request make sure to run `make lint`.

---

Made with ☕️ & ❤️ by [Greymass](https://greymass.com), if you find this useful please consider [supporting us](https://greymass.com/support-us).
