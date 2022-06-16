import RPCUser from "./RPCUser";

export default interface RPCConnection {
    protocol: string,
    hostname: string,
    port: number,
    user: RPCUser
}