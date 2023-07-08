package wordboost;

import lombok.*;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Word {

    private String id;

    private String value;

    private String unit;

    private String course;

    private String imageUrl;

    private int order;

    private List<Sentence> sentences;

    private List<Sentence> sentences2;
}
