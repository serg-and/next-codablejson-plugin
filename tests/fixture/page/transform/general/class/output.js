import { withCodableJSONPage as _withCodableJSONPage } from "next-codablejson-plugin/tools";
import { withCodableJSONProps as _withCodableJSONProps } from "next-codablejson-plugin/tools";
export const getServerSideProps = _withCodableJSONProps(async function () {}, [
  "smth",
]);
class Page {
  render() {
    return <></>;
  }
}
export default _withCodableJSONPage(Page);
