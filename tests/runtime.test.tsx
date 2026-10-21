import { describe, expect, test } from "bun:test";
import { Coder, codablejson } from "codablejson";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createCodableJSONTools,
  deserializeProps,
  serialize,
} from "../tools/tools";
import CodableJSONComponent, { createCodableJSONComponent } from "../tools/client";

class Money {
  constructor(public cents: number) {}
  format() {
    return (this.cents / 100).toFixed(2);
  }
}

function moneyCoder() {
  const coder = new Coder();
  coder.addType(
    "Money",
    (value): value is Money => value instanceof Money,
    (value) => value.cents,
    (cents) => new Money(cents),
    { Class: Money, isFlat: true },
  );
  return coder;
}

// Separate instances model server and browser registries and JSON transport.
const server = createCodableJSONTools(moneyCoder());
const client = createCodableJSONTools(moneyCoder());
const transport = (value: unknown) => JSON.parse(JSON.stringify(value));

function Price({ price }: { price: Money }) {
  return <p>{price.format()}</p>;
}

describe("custom coder runtime", () => {
  test("Pages Router encodes and decodes custom types alongside built-ins and excluded props", async () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const getProps = server.withCodableJSONProps(async () => ({
      props: { price: new Money(1250), date, untouched: "plain" },
    }), ["untouched"]);
    const result = await getProps({} as any);
    const serialized: unknown = transport(result);
    expect(serialized).toEqual({ props: {
      price: { $$Money: 1250 }, date: { $$Date: date.toISOString() }, untouched: "plain",
    } });
    const decoded = client.deserializeProps<any>(transport((result as any).props));
    expect(decoded.price).toBeInstanceOf(Money);
    expect(decoded.price.format()).toBe("12.50");
    expect(decoded.date).toEqual(date);
    expect(decoded.untouched).toBe("plain");
    const Wrapped = client.withCodableJSONPage(Price);
    expect(renderToStaticMarkup(<Wrapped {...transport((result as any).props)} />))
      .toBe("<p>12.50</p>");
  });

  test("getInitialProps uses the custom coder and preserves page statics", async () => {
    const getInitialProps = server.withCodableJSONInitProps(async () => ({
      price: new Money(1234), untouched: "plain",
    }), ["untouched"]);
    const props = transport(await getInitialProps({}));
    const Page = Object.assign(Price, { getInitialProps });
    const Wrapped = client.withCodableJSONPage(Page);
    expect(Wrapped).toHaveProperty("getInitialProps", getInitialProps);
    expect(client.deserializeProps<any>(props).price).toBeInstanceOf(Money);
    expect(client.deserializeProps<any>(props).untouched).toBe("plain");
    expect(renderToStaticMarkup(<Wrapped {...props} />)).toBe("<p>12.34</p>");
  });

  test("redirects and not-found results pass through unchanged", async () => {
    for (const result of [{ redirect: { destination: "/login", permanent: false } }, { notFound: true }] as const) {
      expect(await server.withCodableJSONProps(async () => result)({} as any)).toBe(result);
    }
  });

  test("App Router client adapter decodes custom props and preserves children", () => {
    const Component = createCodableJSONComponent(moneyCoder());
    const props = transport(server.serialize({ price: new Money(2500) }));
    function WithChildren({ price, children }: { price: Money; children?: React.ReactNode }) {
      return <div>{price.format()}{children}</div>;
    }
    expect(renderToStaticMarkup(
      <Component component={WithChildren} props={props}><span>child</span></Component>,
    )).toBe("<div>25.00<span>child</span></div>");
  });

  test("default exports still handle built-ins and do not share custom registrations", () => {
    const date = new Date("2026-01-01T00:00:00Z");
    const props = transport(serialize({ date }));
    expect(deserializeProps<any>(props).date).toEqual(date);
    function DatePage({ date }: { date: Date }) {
      return <p>{date.getUTCFullYear()}</p>;
    }
    expect(renderToStaticMarkup(<CodableJSONComponent component={DatePage} props={props} />))
      .toBe("<p>2026</p>");
    expect(new Coder().getTypeByName("Money")).toBeNull();
    expect(codablejson.getTypeByName("Money")).toBeNull();
  });
});
