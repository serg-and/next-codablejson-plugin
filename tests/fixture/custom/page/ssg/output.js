import { withCodableJSONPage as _withCodableJSONPage } from "@/lib/codable-tools";
import { withCodableJSONProps as _withCodableJSONProps } from "@/lib/codable-tools";
export const getServerSideProps = _withCodableJSONProps(async function() {}, [
    "smth"
]);
function Page() {
    return <></>;
}
export default _withCodableJSONPage(Page);
