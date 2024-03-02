import { Box, CircularProgress } from "@mui/material";
import { useState } from "react";
import Image from "next/image";

type LoadingImageProps = {
    imageUrl: string,
    visible: boolean,
    preload: boolean
}

export function LoadingImage({ imageUrl, visible, preload }: LoadingImageProps) {
    const [loading, setLoading] = useState(true);
    const [prevImageUrl, setPrevImageUrl] = useState<string | null>(null);

    if (imageUrl !== prevImageUrl) {
        setLoading(true);
        setPrevImageUrl(imageUrl);
    }

    if (!imageUrl) {
        return null;
    }

    return <>
        <Box sx={{
            position: "relative",
            display: visible ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%"
        }}>
            {loading && <CircularProgress />}
            {(preload || visible) && <Image src={imageUrl}
                alt=""
                style={{
                    objectFit: 'contain',
                    opacity: loading ? 0 : 1
                }}
                fill={true}
                onLoadingComplete={() => setLoading(false)} />}
        </Box>
    </>;
}

LoadingImage.defaultProps = {
    visible: true,
    preload: false
}
