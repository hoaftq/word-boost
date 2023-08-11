import { Popover } from "@mui/material";
import { BingTranslateReader } from "@wb/components/common/bing-translate-reader";
import { useState, MouseEvent, useCallback } from "react";

export function useSelectionTranslator() {
    const [selection, setSelection] = useState<{ x: number, y: number, text?: string }>();

    const onMouseUpCapture = useCallback(function onMouseUpCapture(event: MouseEvent<HTMLDivElement>): void {
        setSelection({
            x: event.clientX,
            y: event.clientY,
            text: window.getSelection()?.toString()
        });
    }, []);

    function TranslatorPopover() {
        if (!selection?.text) {
            return null;
        }

        return <Popover
            anchorReference="anchorPosition"
            anchorPosition={{ top: selection.y, left: selection.x }}
            anchorOrigin={{
                vertical: "top",
                horizontal: "left",
            }}
            transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            open={!!selection.text}>
            <div style={{ padding: 3 }}>
                <BingTranslateReader text={selection.text} />
            </div>
        </Popover>;
    }

    return { onMouseUpCapture, TranslatorPopover };
}