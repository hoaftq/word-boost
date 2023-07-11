package wordboost.entities;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sentence {

    private String value;

    private String mediaUrl;

    private int order;
}
