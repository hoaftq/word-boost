package wordboost.dtos;

import lombok.*;

import java.util.List;

@Getter
@Setter
public class WordsSentenceDto {

    private String sentence;

    private String unit;

    private String course;

    private String mediaUrl;

    private int order;

    private List<Word> words;

    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public static class Word {
        private String value;

        private String imageUrl;

        private int order;
    }
}

