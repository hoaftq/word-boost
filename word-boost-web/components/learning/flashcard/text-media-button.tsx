import { IconButton, SxProps, Theme, Tooltip } from '@mui/material';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PermMediaIcon from '@mui/icons-material/PermMedia';

export function TextMediaButton({ isText, sx, onClick }: { isText: boolean, sx?: SxProps<Theme>, onClick: () => void }) {
    return (
        <Tooltip title={isText ? "The word is shown" : "The video/image is shown"}>
            <IconButton onClick={onClick} color="secondary" sx={sx}>
                {isText ? <TextSnippetIcon /> : <PermMediaIcon />}
            </IconButton>
        </Tooltip>
    )
}