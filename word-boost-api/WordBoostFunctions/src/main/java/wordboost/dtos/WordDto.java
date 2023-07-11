package wordboost.dtos;

import lombok.*;
import wordboost.entities.Sentence;

import java.util.List;

@Getter
@Setter
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
