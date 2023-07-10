package wordboost.dtos;

import lombok.Builder;
import lombok.Getter;
import wordboost.entities.Sentence;

import java.util.List;

@Getter
@Builder
public class WordDto {

    private String value;

    private String unit;

    private String course;

    private String imageUrl;

    private List<Sentence> sentences;
}
