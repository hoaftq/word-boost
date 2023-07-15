package wordboost.dtos;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import wordboost.entities.Word;

@Mapper
public interface WordDtoMapper {

    WordDtoMapper INSTANCE = Mappers.getMapper(WordDtoMapper.class);

    WordDto mapWord(Word word);
}
