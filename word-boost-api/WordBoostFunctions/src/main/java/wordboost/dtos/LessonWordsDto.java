package wordboost.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import wordboost.entities.Lesson;

import java.util.List;

@Getter
@AllArgsConstructor
public class LessonWordsDto {
    private List<WordDto> words;

    private Lesson lesson;
}
