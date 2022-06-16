export default class InternalRPCException implements Error {
    name: string;
    message: string;
    stack?: string | undefined;
    
    constructor(error: string, stack?: string) {
        this.name = error;
        this.stack = stack;
        switch (error) {
            case "DAEMONS_UNAVAILABLE":
                this.message = "The primary and backup daemons are unavailable. Check your internet connection, update your connection settings if necessary, and try again.";
                break;
            default:
                this.message = "No more information about this error is available.";
                break;
        }
    }
}