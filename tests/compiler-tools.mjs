import { Coder } from "codablejson";
import { createCodableJSONTools } from "../dist/tools.js";

export const {
  withCodableJSONPage,
  withCodableJSONProps,
  withCodableJSONInitProps,
  serialize,
} = createCodableJSONTools(new Coder());
