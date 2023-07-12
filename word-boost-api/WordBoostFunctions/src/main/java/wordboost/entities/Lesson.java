package wordboost.entities;

import com.amazonaws.services.dynamodbv2.datamodeling.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@DynamoDBTable(tableName = "Lesson")
public class Lesson {
    @DynamoDBHashKey
    private String course;

    @DynamoDBRangeKey
    private String unit;

    @DynamoDBTyped(DynamoDBMapperFieldModel.DynamoDBAttributeType.L)
    private List<MediaLesson> mediaLessons;

    @Getter
    @Setter
    @DynamoDBDocument
    public static class MediaLesson {
        private String name;

        @DynamoDBTyped(DynamoDBMapperFieldModel.DynamoDBAttributeType.L)
        private List<Command> commands;

        @Getter
        @Setter
        @DynamoDBDocument
        public static class Command {

            private String mediaUrl;

            private String label;

            private float start;

            private float end;

            private float rate;

            private float delay;

            private int repeat;

            private String description;
        }
    }
}

