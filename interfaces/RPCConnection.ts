import RPCUser from "./RPCUser.js";

export default interface RPCConnection {
    connectionURL: string,
    user: RPCUser
}