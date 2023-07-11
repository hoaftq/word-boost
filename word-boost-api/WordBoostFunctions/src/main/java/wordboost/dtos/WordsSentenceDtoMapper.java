package wordboost.dtos;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import wordboost.entities.Sentence;
import wordboost.entities.Word;

import java.util.List;
import java.util.stream.Collectors;

//@Mapper
//public interface WordsSentenceDtoMapper {
//
//    WordsSentenceDtoMapper INSTANCE = Mappers.getMapper(WordsSentenceDtoMapper.class);
//
//    List<Word> toWords(List<WordsSentenceDto.Word> wordDtos, WordsSentenceDto wordsSentenceDto);
//
//    @Mapping(target = "course", source = "wordsSentenceDto.course")
//    @Mapping(target = "unit", source = "wordsSentenceDto.unit")
//    @Mapping(target = "value", source = "wordDto.value")
//    @Mapping(target = "imageUrl", source = "wordDto.imageUrl")
//    @Mapping(target = "order", source = "wordDto.order")
//    @Mapping(target = "sentences2", source = "wordsSentenceDto", qualifiedByName = "toSentence")
//    Word toWord(WordsSentenceDto.Word wordDto, WordsSentenceDto wordsSentenceDto);
//
//    @Mapping(target = "value", source = "wordsSentenceDto.sentence")
//    @Mapping(target = "mediaUrl", source = "wordsSentenceDto.mediaUrl")
//    @Mapping(target = "order", source = "wordsSentenceDto.order")
//    Sentence toSentence(WordsSentenceDto wordsSentenceDto);
//}

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