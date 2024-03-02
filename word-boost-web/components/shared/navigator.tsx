import { CSSProperties, MouseEvent } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

type NavigatorProps = {
    index: number;
    total: number;
    containerStyle?: CSSProperties;
    onNext?: (index: number) => void;
    onPrev?: (index: number) => void;
    onRestart?: () => void;
}

export function Navigator({ index, total, containerStyle, onNext, onPrev, onRestart }: NavigatorProps) {
    const isFirst = index === 0;
    const isLast = index >= total - 1;

    function handlePrevious(event: MouseEvent<HTMLButtonElement>): void {
        if (isFirst) {
            return;
        }

        onPrev?.(index - 1);
    }

    function handleNext(event: MouseEvent<HTMLButtonElement>): void {
        if (isLast) {
            return;
        }

        onNext?.(index + 1);
    }

    function handleRestart(event: MouseEvent<HTMLButtonElement>): void {
        onRestart?.();
    }

    return (
        <div style={containerStyle}>
            <Button onClick={handlePrevious}
                variant="outlined"
                disabled={isFirst}
                sx={{ marginRight: 1 }}
                startIcon={<ArrowLeftIcon />}
                color="secondary"
            >Prev</Button>
            <Button variant="outlined"
                sx={{ marginRight: 1 }}
                startIcon={<ArrowRightIcon />}
                color="secondary"
                disabled={isLast}
                onClick={handleNext}>
                Next
            </Button>
            <span style={{
                fontWeight: "bold",
                marginRight: 6
            }}>
                {index + 1}/{total}
            </span>
            <Tooltip title="Restart">
                <IconButton color="secondary"
                    onClick={handleRestart}>
                    <RestartAltIcon />
                </IconButton>
            </Tooltip>
        </div>
    )
}