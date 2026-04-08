import { withCodableJSONPage as _withCodableJSONPage } from "next-codablejson-plugin/tools";
import { withCodableJSONProps as _withCodableJSONProps } from "next-codablejson-plugin/tools";
export const getStaticProps = _withCodableJSONProps(() => {}, ["smth"]);
export const getStaticPaths = () => {};
export default _withCodableJSONPage(() => {
  return <></>;
});
