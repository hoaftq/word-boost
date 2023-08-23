import { useEffect, useRef } from "react";
import { isBrowser } from "react-device-detect";

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

    const size = isBrowser ? 42 : 37;

    return <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        position: "relative",
        overflow: "hidden"
    }}>
        <iframe ref={iframeRef}
            style={{
                border: 0,
                width: 800,
                height: 600,
                position: "absolute",
                top: isBrowser ? -269 : -207,
                left: isBrowser ? -19 : -751,
            }}
            scrolling="no"
            src={bingUrl} />
    </div>
}

export function FullBingTranslate({ text }: { text: string }) {
    const bingUrl = `https://www.bing.com/translator?from=en&text=${encodeURIComponent(text)}`;

    return <div style={{
        width: isBrowser ? 268 : 263,
        height: isBrowser ? 362 : 205,
        overflow: "hidden",
        position: "relative",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "lightgray",
        borderRadius: 5
    }}>
        <iframe style={{
            border: 0,
            width: isBrowser ? 1024 : 268,
            height: isBrowser ? 800 : 482,
            position: "absolute",
            left: isBrowser ? -30 : 0,
            top: isBrowser ? -240 : -124,
        }}
            src={bingUrl} />
    </div>
}