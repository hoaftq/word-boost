package wordboost.dtos;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SentenceDto {
    private String value;

    private String mediaUrl;
}
