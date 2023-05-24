import { Word } from "../word-list";

type TestingState = {
    blankWordIds: (string | undefined)[],
    words: Word[]
}

export const initialState: TestingState = {
    blankWordIds: Array.from({ length: 6 }, () => undefined),
    words: []
};

type ActionType = "load-words" | "drop-on-blank" | "drop-on-pool";

type Action = {
    type: ActionType;
    payload: any;
}

function removeWordFromBlank(draft: TestingState, word: Word) {
    const oldPosition = draft.blankWordIds.findIndex(id => id == word.id);
    if (oldPosition >= 0) {
        draft.blankWordIds[oldPosition] = undefined;
    }
}

export function testingReducer(draft: TestingState, action: Action) {
    switch (action.type) {
        case "load-words": {
            draft.words = action.payload;
            break;
        }
        case "drop-on-blank": {
            const { position, word } = action.payload;
            removeWordFromBlank(draft, word);
            draft.blankWordIds[position] = word.id;
            break;
        }
        case "drop-on-pool": {
            const word = action.payload;
            removeWordFromBlank(draft, word);
            break;
        }
    }
}