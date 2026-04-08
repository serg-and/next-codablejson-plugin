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
| `0.1.0`        | `^16.1.6`        |

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

## Bug Report

⚠️ Keep in mind: SWC Plugin is still an experimental feature for Next.js

Plugin always ensures compatibility with [Next.js Canary version](https://nextjs.org/docs/messages/opening-an-issue) only.

[Leave an Issue](https://github.com/serg-and/next-codablejson-plugin/issues)
