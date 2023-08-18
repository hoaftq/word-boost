import { Box, CircularProgress } from "@mui/material";
import { useState } from "react";
import Image from "next/image";

export function LoadingImage({ imageUrl, visible }: { imageUrl: string, visible: boolean }) {
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
        <Image src={imageUrl}
            alt=""
            width={1}
            height={1}
            style={{ left: -10 }} />
        <Box sx={{
            position: "relative",
            display: visible ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%"
        }}>
            {loading && <CircularProgress />}
            <Image src={imageUrl}
                alt=""
                style={{
                    objectFit: 'contain',
                    opacity: loading ? 0 : 1
                }}
                fill={true}
                onLoadingComplete={() => setLoading(false)} />
        </Box>
    </>;
}

LoadingImage.defaultProps = {
    visible: true
}
