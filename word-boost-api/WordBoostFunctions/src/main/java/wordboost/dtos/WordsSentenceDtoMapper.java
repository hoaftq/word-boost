package wordboost.dtos;

import java.util.List;
import java.util.stream.Collectors;

public final class WordsSentenceDtoMapper {

    public static List<WordDto> toWords(WordsSentenceDto wordsSentenceDto) {
        var words = wordsSentenceDto.getWords();
        if (words.isEmpty()) {
            words = List.of(WordsSentenceDto.Word.builder()
                    .value("")
                    .imageUrl("")
                    .build());
        }

        return words.stream()
                .map(w -> WordDto.builder()
                        .course(wordsSentenceDto.getCourse())
                        .unit(wordsSentenceDto.getUnit())
                        .value(w.getValue())
                        .imageUrl(w.getImageUrl())
                        .sentences(List.of(SentenceDto.builder()
                                .value(wordsSentenceDto.getSentence())
                                .mediaUrl(wordsSentenceDto.getMediaUrl())
                                .build()))
                        .build())
                .collect(Collectors.toList());
    }
}