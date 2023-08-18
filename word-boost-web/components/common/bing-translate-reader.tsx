
// This is just a temporary solution to read text
export function BingTranslateReader({ text }: { text: string }) {
    const bingUrl = `https://www.bing.com/translator?from=en&text=${encodeURIComponent(text)}`;

    return <div style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        position: "relative",
        overflow: "hidden"
    }}>
        <iframe style={{
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