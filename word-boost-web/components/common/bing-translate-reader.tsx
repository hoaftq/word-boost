import { useEffect, useRef } from "react";

type BingTranslateReaderProps = {
    text: string;
    onClick?: () => void;
}

// This is just a temporary solution to read text
export function BingTranslateReader({ text, onClick }: BingTranslateReaderProps) {
    const iframeRef = useRef(null);
    const bingUrl = `https://www.bing.com/translator?from=en&text=${encodeURIComponent(text)}`;

    useEffect(() => {
        if (onClick) {
            const timerId = setInterval(() => {
                if (document.activeElement === iframeRef.current) {
                    onClick();
                    window.focus();
                }
            }, 1000);

            return () => {
                clearInterval(timerId);
            };
        }
    }, [onClick]);

    return <div style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        position: "relative",
        overflow: "hidden"
    }}>
        <iframe ref={iframeRef}
            style={{
                border: 0,
                width: 300,
                height: 430,
                position: "absolute",
                top: -269,
                left: -19,
            }}
            scrolling="no"
            src={bingUrl} />
    </div>
}

export function FullBingTranslate({ text }: { text: string }) {
    const bingUrl = `https://www.bing.com/translator?from=en&text=${encodeURIComponent(text)}`;

    return <div style={{
        width: 268,
        height: 362,
        overflow: "hidden",
        position: "relative",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "lightgray",
        borderRadius: 5
    }}>
        <iframe style={{
            border: 0,
            width: 1024,
            height: 800,
            position: "absolute",
            left: -30,
            top: -240,
        }}
            src={bingUrl} />
    </div>
}