import { serialize } from "next-codablejson-plugin/tools";
import CodableJSONComponent from "next-codablejson-plugin/client";
import ServerComponent from "./ServerComponent";
import Client from "./Client";
export default function Page() {
    const rest = {};
    const date = new Date();
    return <>
      <ServerComponent date={date}/>
      <CodableJSONComponent props={serialize({
        date: date,
        ...rest
    })} component={Client.Component}/>
    </>;
}
