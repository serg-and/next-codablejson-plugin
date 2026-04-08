import { withCodableJSONPage as _withCodableJSONPage } from "next-codablejson-plugin/tools";
import { withCodableJSONProps as _withCodableJSONProps } from "next-codablejson-plugin/tools";
export const getServerSideProps = _withCodableJSONProps(async () => {}, [
  "smth",
]);
export default _withCodableJSONPage(() => {
  return <></>;
});
