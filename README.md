<h1 align="middle"> Next CodableJSON Plugin</h1>
<h3 align="middle">🔌 CodableJSON Plugin for Next.js (SWC)</h3>

Plugin for Next.js that allows the use of Non-JSON serializable values in server components and pages router pre-render function (`getServerSideProps`, `getInitialProps`).
<br>
It uses [CodableJSON](https://github.com/pie6k/codablejson) for (de)serialization, which is up to [5x faster](https://codablejson.com/docs/performance) than SuperJSON.

## Installation

Install packages first:

```sh
npm install next-codablejson-plugin
```

Add the plugin into `next.config.js`

```js
// next.config.js
module.exports = {
  experimental: {
    swcPlugins: [["next-codablejson-plugin", {}]],
  },
};
```

### Versions

SWC plugins must match your Next.js version, use this table to check which version is compatible with your Next.js version.

| plugin version | Next.js versions |
| :------------- | :--------------- |
| `0.1.0`        | SWC 54 (original target: `16.1.6`) |
| `0.2.0`        | SWC 54; incompatible with `16.4.2` |
| `0.2.1`        | `16.4.2` (SWC 79) |

Next.js upgrades can change the SWC plugin ABI even within the same major version.
The current compiler regression suite pins Next.js to `16.4.2`. To rebuild the
WASM and test it with the actual Next.js compiler, use Node.js 22.12+ and Bun:

```sh
bun install --frozen-lockfile
rustup target add wasm32-wasip1
bun run test:compiler
```

This builds and packages `dist/next_codablejson.wasm`, then checks Pages Router
wrappers, Date/BigInt JSON transport, and default/custom App Router transforms.
Run it again when changing Next.js or SWC versions. The generated `dist` directory
is ignored by Git and included in the npm package.

### Publishing locally

With dependencies and the Rust WASM target installed as above, run:

```sh
npm publish --dry-run --access public
npm publish --access public
```

The `prepublishOnly` hook runs the runtime tests, rebuilds the WASM, and verifies
it with Next.js 16.4.2 before npm packages the release. The second command
publishes to npm and requires an account with package publishing access.

## Usage

### /pages (Pages Directory)

```jsx
// For pages router no further configuration is required.

// You can also use getInitialProps, getStaticProps
export const getServerSideProps = () => {
  return {
    props: {
      date: new Date(),
    },
  };
};

export default function Page({ date }) {
  return <div>Today is {date.toDateString()}</div>;
}
```

- Allows pre-rendering functions to return props including [Non-JSON Values](https://codablejson.com/docs/json-serialization/supported-types)(Date, Map, Set..)

### /app (App Directory)

```jsx
// Use "data-codable" attribute to pass non-serializable props to client components
// No needs to change the propsType of Client Component (It's type-safe!)

export default function ServerComponent() {
  const date = new Date();
  return <ClientComponent date={date} data-codable />;
}
```

- Provides `data-codable` attribute for [Server Component > Client Component Serialization](https://nextjs.org/docs/app/getting-started/server-and-client-components#passing-data-from-server-to-client-components).

### Options

In `next.config.js`, you can use the `excluded` option to exclude specific properties from serialization.

```js
['next-codablejson-plugin', { excluded: ["someProp"] }],
```

### Custom types and coders

Use `customCoder.toolsModule` to supply helpers bound to your own CodableJSON
`Coder`. Add `customCoder.clientModule` when using `data-codable` in App Router.
No Next config wrapper is required.

Install `codablejson` as a direct dependency of your application:

```sh
npm install codablejson
```

Define a shared coder with your custom types:

```ts
// src/lib/codable.ts
import { Coder } from "codablejson";

export class Money {
  constructor(public cents: number) {}

  format() {
    return (this.cents / 100).toFixed(2);
  }
}

const coder = new Coder();
coder.addType(
  "Money",
  (value): value is Money => value instanceof Money,
  (value) => value.cents,
  (cents) => new Money(cents),
  { Class: Money, isFlat: true },
);

export default coder;
```

Create a tools module with the named exports used by the plugin:

```ts
// src/lib/codable-tools.ts
import { createCodableJSONTools } from "next-codablejson-plugin/tools";
import coder from "./codable";

export const {
  serialize,
  deserializeProps,
  withCodableJSONProps,
  withCodableJSONInitProps,
  withCodableJSONPage,
} = createCodableJSONTools(coder);
```

#### Pages Router

Only `toolsModule` is needed. It provides both encoding in `getServerSideProps`,
`getStaticProps`, or `getInitialProps`, and decoding in the page wrapper.

```js
// next.config.js
module.exports = {
  experimental: {
    swcPlugins: [
      ["next-codablejson-plugin", {
        customCoder: {
          toolsModule: "@/lib/codable-tools",
        },
      }],
    ],
  },
};
```

```tsx
// src/pages/price.tsx
import { Money } from "@/lib/codable";

export function getServerSideProps() {
  return { props: { price: new Money(1250) } };
}

export default function PricePage({ price }: { price: Money }) {
  return <p>{price.format()}</p>;
}
```

#### App Router

Create a separate client module that default-exports the decoding component.
Keep `"use client"` at the top of this file:

```tsx
// src/lib/codable-client.tsx
"use client";

import { createCodableJSONComponent } from "next-codablejson-plugin/client";
import coder from "./codable";

export default createCodableJSONComponent(coder);
```

Configure both module paths:

```js
["next-codablejson-plugin", {
  customCoder: {
    toolsModule: "@/lib/codable-tools",
    clientModule: "@/lib/codable-client",
  },
}]
```

Continue using `data-codable` as usual:

```tsx
// src/app/price/page.tsx
import { Money } from "@/lib/codable";
import Price from "./Price";

export default function PricePage() {
  return <Price price={new Money(1250)} data-codable />;
}
```

```tsx
// src/app/price/Price.tsx
"use client";

import type { Money } from "@/lib/codable";

export default function Price({ price }: { price: Money }) {
  return <p>{price.format()}</p>;
}
```

If `customCoder` is configured and a transformed component uses `data-codable`
without a `clientModule`, compilation fails with:

```text
next-codablejson-plugin: customCoder.clientModule is required when using data-codable with a custom coder.
```

`clientModule` may be omitted when no App Router `data-codable` transformation is
needed. With no `customCoder` option, the plugin uses its default coder and modules.
The `excluded` option can be combined with `customCoder` for Pages Router.

Module paths are emitted as import specifiers in transformed source files. Use a
configured alias (these examples assume `@/*` maps to `src/*`), an absolute path,
or a package specifier. Relative paths resolve from each transformed file, not
from `next.config.js`.

After changing `customCoder` options, clear Next.js's `.next` build cache and
restart or rebuild so cached SWC transforms do not retain the previous settings.

The coder and its type definitions must work on both server and browser, with
matching registrations on both sides. Keep the tools module free of `"use client"`
and `server-only` dependencies: it is used by both server code and Pages Router
client code. The separate client module establishes the App Router client boundary;
the coder itself is never passed across that boundary as a prop.

## Bug Report

⚠️ Keep in mind: SWC Plugin is still an experimental feature for Next.js

Plugin always ensures compatibility with [Next.js Canary version](https://nextjs.org/docs/messages/opening-an-issue) only.

[Leave an Issue](https://github.com/serg-and/next-codablejson-plugin/issues)
