// original tool source from 'babel-plugin-superjson-next'

import hoistNonReactStatics from "hoist-non-react-statics";
import type { GetServerSideProps } from "next";
import React from "react";
import { decode, encode } from "codablejson";

export type CodableJSONProps<P> = P & {
  __gip_codablejson?: P;
};

export function withCodableJSONProps<P extends JSX.IntrinsicAttributes>(
  gssp: GetServerSideProps<P>,
  exclude: string[] = [],
): GetServerSideProps<CodableJSONProps<P>> {
  return async function withCodableJSON(...args) {
    const result = await gssp(...args);

    if (!("props" in result)) {
      return result;
    }

    if (!result.props) {
      return result;
    }

    const excludedPropValues = exclude.map((propKey) => {
      const value = (result.props as any)[propKey];
      delete (result.props as any)[propKey];
      return value;
    });

    const props = encode(result.props) as any;

    exclude.forEach((key, index) => {
      const excludedPropValue = excludedPropValues[index];
      if (typeof excludedPropValue !== "undefined") {
        props[key] = excludedPropValue;
      }
    });

    return {
      ...result,
      props,
    };
  };
}

export function withCodableJSONInitProps(
  gip: any,
  exclude: string[] = [],
): any {
  return async function withCodableJSON(...args: any[]) {
    const result = await gip(...args);

    const excludedPropValues = exclude.map((propKey) => {
      const value = (result as any)[propKey];
      delete (result as any)[propKey];
      return value;
    });

    const props = encode(result) as any;

    exclude.forEach((key, index) => {
      const excludedPropValue = excludedPropValues[index];
      if (typeof excludedPropValue !== "undefined") {
        props[key] = excludedPropValue;
      }
    });

    return {
      ...result,
      __gip_codablejson: props,
    };
  };
}

export function deserializeProps<P>(serializedProps: CodableJSONProps<P>): P {
  const { __gip_codablejson, ...props } = serializedProps;

  if (__gip_codablejson) {
    return { ...props, ...decode(__gip_codablejson) };
  }

  return decode(props as any);
}

export function withCodableJSONPage<P extends JSX.IntrinsicAttributes>(
  Page: React.ComponentType<P>,
): React.ComponentType<CodableJSONProps<P>> {
  function WithCodableJSON(serializedProps: CodableJSONProps<P>) {
    return <Page {...deserializeProps<P>(serializedProps)} />;
  }

  hoistNonReactStatics(WithCodableJSON, Page);

  return WithCodableJSON;
}

export function serialize<P>(props: P) {
  return encode(props);
}
