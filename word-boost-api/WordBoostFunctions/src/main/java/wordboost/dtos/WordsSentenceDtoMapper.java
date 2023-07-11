package wordboost.dtos;

import wordboost.entities.Sentence;

import java.util.List;
import java.util.stream.Collectors;

public final class WordsSentenceDtoMapper {

    public static List<WordDto> toWords(WordsSentenceDto wordsSentenceDto) {
        return wordsSentenceDto.getWords().stream()
                .map(w -> WordDto.builder()
                        .course(wordsSentenceDto.getCourse())
                        .unit(wordsSentenceDto.getUnit())
                        .value(w.getValue())
                        .imageUrl(w.getImageUrl())
                        .order(w.getOrder())
                        .sentences(List.of(Sentence.builder()
                                .value(wordsSentenceDto.getSentence())
                                .mediaUrl(wordsSentenceDto.getMediaUrl())
                                .order(wordsSentenceDto.getOrder())
                                .build()))
                        .build())
                .collect(Collectors.toList());
    }
}