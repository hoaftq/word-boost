package wordboost;

import lombok.*;

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
}
