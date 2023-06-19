import { Box, CircularProgress, CircularProgressProps, Typography } from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

type TimerMode = "seconds" | "minutes";

type ProgressTimerProps = CircularProgressProps & {
    mode: TimerMode,
    maxValue: number,
    onTimeup: () => void,
    onTicking?: (currentValue: number, maxValue: number) => void
};

export type ProgressTimerRef = {
    resetTimer: () => void;
}

export const ProgressTimer = forwardRef<ProgressTimerRef, ProgressTimerProps>((props, ref) => {
    const { mode, maxValue, onTimeup, onTicking, ...circularProgressProps } = props;
    const [currentValue, setCurrentValue] = useState(maxValue);
    const [isCountingStopped, setIsCountingStopped] = useState(false);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setCurrentValue((prevValue) => {
                if (isCountingStopped) {
                    return prevValue;
                }

                const newValue = prevValue - 1;

                if (newValue < 0) {
                    clearTimeout(timerId);
                    onTimeup();

                    // With this statement, currentValue won't be changed so it won't triggered this effect for another time
                    return prevValue;
                }

                onTicking?.(newValue, maxValue);

                return newValue;
            });
        }, 1000);

        return () => {
            clearTimeout(timerId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentValue, isCountingStopped]);

    const formatCurrentTime = () => {
        const minutes = Math.floor(currentValue / 60);
        const seconds = currentValue % 60;
        return `${minutes.toString()} : ${seconds.toString().padStart(2, "0")}`;
    }

    const handleTimerClick = () => {
        setIsCountingStopped((v) => !v);
    }

    useImperativeHandle(ref, () => ({
        resetTimer: () => {
            setCurrentValue(maxValue);
            setIsCountingStopped(false);
        }
    }));

    return (
        mode === "seconds"
            ? <Box sx={{ position: 'relative', display: 'inline-flex', cursor: "pointer" }}
                onClick={handleTimerClick}>
                <CircularProgress {...circularProgressProps}
                    variant="determinate"
                    size="4rem"
                    value={currentValue * 100 / maxValue}
                    color={isCountingStopped ? "error" : "primary"}
                />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: "none"
                    }}
                >
                    <Typography
                        variant="caption"
                        component="div"
                        color={isCountingStopped ? "error" : "primary"}
                        fontSize="2rem"
                        fontWeight="bold"
                    >{currentValue}</Typography>
                </Box>
            </Box>
            : <div style={{ fontWeight: "bold" }}>{formatCurrentTime()}</div>);
});

ProgressTimer.displayName = "ProgressTimer";