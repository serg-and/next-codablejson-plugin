"use client";

import { CodableJSONProps, withCodableJSONPage } from "./tools";
import * as React from "react";

export default function CodableJSONComponent<
  P extends JSX.IntrinsicAttributes,
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
}
