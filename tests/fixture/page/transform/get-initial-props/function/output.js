import { withCodableJSONPage as _withCodableJSONPage } from "next-codablejson-plugin/tools";
import { withCodableJSONInitProps as _withCodableJSONInitProps } from "next-codablejson-plugin/tools";
function Page({ stars }) {
  return <div>Next stars: {stars}</div>;
}
Page.getInitialProps = _withCodableJSONInitProps(
  async (ctx) => {
    const res = await fetch("https://api.github.com/repos/vercel/next.js");
    const json = await res.json();
    return {
      stars: json.stargazers_count,
    };
  },
  ["smth"],
);
export default _withCodableJSONPage(Page);
