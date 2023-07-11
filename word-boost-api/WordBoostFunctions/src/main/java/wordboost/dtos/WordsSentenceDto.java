package wordboost.dtos;

import lombok.Getter;
import lombok.Setter;

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

    @Getter
    @Setter
    public static class Word {
        private String value;

        private String imageUrl;

        private int order;
    }
}

