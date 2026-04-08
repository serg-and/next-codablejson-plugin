import { withCodableJSONPage as _withCodableJSONPage } from "next-codablejson-plugin/tools";
import { withCodableJSONInitProps as _withCodableJSONInitProps } from "next-codablejson-plugin/tools";
import React from 'react';
class Page extends React.Component {
    static getInitialProps = _withCodableJSONInitProps(async function(ctx) {
        const res = await fetch('https://api.github.com/repos/vercel/next.js');
        const json = await res.json();
        return {
            stars: json.stargazers_count
        };
    }, [
        "smth"
    ]);
    render() {
        return <div>Next stars: {this.props.stars}</div>;
    }
}
export default _withCodableJSONPage(Page);
