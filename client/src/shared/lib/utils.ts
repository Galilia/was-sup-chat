import axios, {AxiosError} from "axios";


export function formatMessageTime(date: Date | string) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
}

export const getErrorMessage = (err: unknown) => {
    if (axios.isAxiosError(err)) {
        const e = err as AxiosError<any>;
        return e.response?.data?.message ?? e.message;
    }
    if (err instanceof Error) return err.message;
    return "Unknown error";
};