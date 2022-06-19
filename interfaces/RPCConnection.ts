import RPCUser from "./RPCUser";

export default interface RPCConnection {
    connectionURL: string,
    user: RPCUser
}