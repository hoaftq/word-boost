import { Box, CircularProgress, CircularProgressProps, Typography } from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

type ProgressTimerProps = CircularProgressProps & { maxValue: number, onTimeup: () => void };

export type ProgressTimerRef = {
    resetTimer: () => void;
}

export const ProgressTimer = forwardRef<ProgressTimerRef, ProgressTimerProps>((props, ref) => {
    const { maxValue, onTimeup, ...circularProgressProps } = props;
    const [currentValue, setCurrentValue] = useState(maxValue);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setCurrentValue((prevValue) => {
                const newValue = prevValue - 1;

                if (newValue < 0) {
                    clearTimeout(timerId);
                    onTimeup();

                    // With this statement, currentValue won't be changed so it won't triggered this effect for another time
                    return prevValue;
                }

                return newValue;
            });
        }, 1000);

        return () => {
            clearTimeout(timerId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentValue]);

    useImperativeHandle(ref, () => ({
        resetTimer: () => setCurrentValue(maxValue)
    }));

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress {...circularProgressProps}
                variant="determinate"
                size="4rem"
                value={currentValue * 100 / maxValue} />
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
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="primary"
                    fontSize="2rem"
                    fontWeight="bold"
                >{currentValue}</Typography>
            </Box>
        </Box>)
});

ProgressTimer.displayName = "ProgressTimer";