import { serialize } from "next-codablejson-plugin/tools";
import CodableJSONComponent from "next-codablejson-plugin/client";
import ClientComponent from "./ClientComponent";
export default function Page() {
    const rest = {};
    const date = new Date();
    return <CodableJSONComponent props={serialize({
        date: date,
        ...rest
    })} component={ClientComponent}>
      <p>children</p>
    </CodableJSONComponent>;
}
