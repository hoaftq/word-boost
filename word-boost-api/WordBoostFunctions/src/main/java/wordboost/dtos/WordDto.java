package wordboost.dtos;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordDto {
    private String id;

    private String value;

    private String unit;

    private String course;

    private String imageUrl;

    private String videoUrl;

    private List<SentenceDto> sentences;
}
