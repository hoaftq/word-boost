import { RefObject, useEffect } from "react";
import ReactPlayer, { ReactPlayerProps } from "react-player";

type YoutubePlayerProps = ReactPlayerProps & {
    playerRef: RefObject<ReactPlayer>,
    onCustomProgress?: (duration: number) => void
}

export default function YoutubePlayer(props: YoutubePlayerProps) {
    const { playerRef, ref, onCustomProgress, ...rest } = props;

    useEffect(() => {
        function isPlaying() {
            return playerRef.current?.getInternalPlayer()?.getPlayerState() === 1;
        }

        if (!onCustomProgress) {
            return;
        }

        const timerId = setInterval(() => {
            const currentTime = playerRef.current?.getCurrentTime();
            if (currentTime && isPlaying()) {
                onCustomProgress(currentTime);
            }
        }, 10);

        return () => {
            clearInterval(timerId);
        };
    }, [onCustomProgress, playerRef]);

    return <ReactPlayer ref={playerRef}  {...rest} />
}