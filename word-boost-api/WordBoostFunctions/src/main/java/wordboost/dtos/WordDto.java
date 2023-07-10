package wordboost.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import wordboost.entities.Sentence;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordDto {

    private String value;

    private String unit;

    private String course;

    private String imageUrl;

    private int order;

    private List<Sentence> sentences;
}
