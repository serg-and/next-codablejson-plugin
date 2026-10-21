"use client";

import { codablejson, type Coder } from "codablejson";
import { type CodableJSONProps, createCodableJSONTools } from "./tools";
import * as React from "react";

/** Call from a module marked "use client" that imports the shared coder. */
export function createCodableJSONComponent(coder: Coder) {
  const { withCodableJSONPage } = createCodableJSONTools(coder);

  return function CodableJSONComponent<
    P extends object,
  >({
    component,
    props,
    children,
  }: {
    component: React.ComponentType<P>;
    props: CodableJSONProps<P>;
    children?: React.ReactNode;
  }) {
    const WithCodableJSON = withCodableJSONPage(component);
    return <WithCodableJSON {...props}>{children}</WithCodableJSON>;
  };
}

export default createCodableJSONComponent(codablejson);
