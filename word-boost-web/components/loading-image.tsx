import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import Image from "next/image";

export function LoadingImage({ imageUrl }: { imageUrl: string; }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
    }, [imageUrl]);

    if (imageUrl) {
        return (
            <>
                {loading && <CircularProgress />}
                <Image src={imageUrl}
                    alt=""
                    style={{ objectFit: 'contain', opacity: loading ? 0 : 1 }}
                    fill={true}
                    onLoadingComplete={() => { setLoading(false); }} />
            </>
        );
    }

    return <></>;
}
