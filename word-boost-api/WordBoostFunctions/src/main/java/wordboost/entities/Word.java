package wordboost.entities;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
