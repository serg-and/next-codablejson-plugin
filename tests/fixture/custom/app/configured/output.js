import { serialize } from "@/lib/codable-tools";
import CodableJSONComponent from "@/lib/codable-client";
import ServerComponent from "./ServerComponent";
import ClientComponent from "./ClientComponent";
export default function Page() {
    const rest = {};
    const date = new Date();
    return <>
      <ServerComponent date={date}/>
      <CodableJSONComponent props={serialize({
        date: date,
        ...rest
    })} component={ClientComponent}/>
    </>;
}
