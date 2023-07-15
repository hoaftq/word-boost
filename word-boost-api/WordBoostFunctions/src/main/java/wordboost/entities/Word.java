package wordboost.entities;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Word {

    private String id;

    private String value;

    private String unit;

    private String course;

    private String imageUrl;

    private long order;

    private List<Sentence> sentences;

    private List<Sentence> sentences2;
}
