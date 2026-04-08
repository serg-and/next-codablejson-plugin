import { withCodableJSONPage as _withCodableJSONPage } from "next-codablejson-plugin/tools";
import { withCodableJSONInitProps as _withCodableJSONInitProps } from "next-codablejson-plugin/tools";
function Page({ date }) {
  return <div>{date.getDate()}</div>;
}
Page.getInitialProps = _withCodableJSONInitProps(() => {
  return {
    date: new Date(),
  };
}, ["smth"]);
export default _withCodableJSONPage(Page);
