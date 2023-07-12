package wordboost.services;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import wordboost.common.ServiceBase;
import wordboost.dtos.UnitCourseDto;
import wordboost.entities.Lesson;

import java.util.Map;

public class LessonService extends ServiceBase {
    private final DynamoDBMapper dynamoDBMapper = new DynamoDBMapper(amazonDynamoDB);

    public void saveLesson(Lesson lesson) {
        dynamoDBMapper.save(lesson);
    }

    public Lesson getLesson(UnitCourseDto unitCourseDto) {
        var queryExpression = new DynamoDBQueryExpression<Lesson>()
                .withKeyConditionExpression("course = :course AND #unit = :unit")
                .withExpressionAttributeNames(Map.of("#unit", "unit"))
                .withExpressionAttributeValues(Map.of(
                        ":course", new AttributeValue(unitCourseDto.getCourse()),
                        ":unit", new AttributeValue(unitCourseDto.getUnit())));
        var lessons = dynamoDBMapper.query(Lesson.class, queryExpression);
        return !lessons.isEmpty() ? lessons.get(0) : null;
    }
}
