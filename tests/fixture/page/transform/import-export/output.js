import { withCodableJSONPage as _withCodableJSONPage } from "next-codablejson-plugin/tools";
import { withCodableJSONProps as _withCodableJSONProps } from "next-codablejson-plugin/tools";
import {
  foo as _NEXT_CODABLEJSON_IMPORTED_PROPS,
  default as Page,
} from "source";
const _NEXT_CODABLEJSON_SSG_PROPS = _withCodableJSONProps(
  _NEXT_CODABLEJSON_IMPORTED_PROPS,
  ["smth"],
);
export { _NEXT_CODABLEJSON_SSG_PROPS as getServerSideProps };
export default _withCodableJSONPage(Page);
