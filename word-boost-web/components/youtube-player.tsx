import { RefObject } from "react";
import ReactPlayer, { ReactPlayerProps } from "react-player";

type YoutubePlayerProps = ReactPlayerProps & {
    playerRef: RefObject<ReactPlayer>
}

export default function YoutubePlayer(props: YoutubePlayerProps) {
    const { playerRef, ref, ...rest } = props;
    return <ReactPlayer ref={playerRef}  {...rest} />
}