import { useCallback, useDebugValue, useState } from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import getConfig from "next/config";

const { publicRuntimeConfig: { apiUrl } } = getConfig();

export function useBlockingFetch() {
    const [open, setOpen] = useState(false);
    useDebugValue(open ? "Fetching" : "Fetched");

    const blockingFetch = useCallback((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        setOpen(true);
        return fetch(`${apiUrl}/${input}`, init)
            .finally(() => setOpen(false));
    }, []);

    function FetchingBackdrop() {
        return (
            <Backdrop
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={open}
            >
                <CircularProgress color="primary" />
            </Backdrop>
        );
    }

    return { blockingFetch, FetchingBackdrop };
}
