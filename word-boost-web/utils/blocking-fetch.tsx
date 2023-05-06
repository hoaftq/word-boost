import { useState } from "react";
import { Backdrop, CircularProgress } from "@mui/material";

export function useBlockingFetch() {
    const [open, setOpen] = useState(false);

    function blockingFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        setOpen(true);
        return fetch(input, init)
            .finally(() => setOpen(false));
    }

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
