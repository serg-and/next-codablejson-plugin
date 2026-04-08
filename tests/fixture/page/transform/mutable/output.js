import { withCodableJSONPage as _withCodableJSONPage } from "next-codablejson-plugin/tools";
import { withCodableJSONProps as _withCodableJSONProps } from "next-codablejson-plugin/tools";
let foo = 1;
foo = 2;
export { foo as getServerSideProps };
foo = _withCodableJSONProps(() => {}, ["smth"]);
export default _withCodableJSONPage(() => {});
