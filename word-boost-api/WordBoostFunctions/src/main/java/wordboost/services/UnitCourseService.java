package wordboost.services;

import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import wordboost.common.ServiceBase;
import wordboost.dtos.UnitCourseDto;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class UnitCourseService extends ServiceBase {

    public List<String> getUnits() {
        var scanRequest = new ScanRequest().withTableName(wordsTableName)
                .withProjectionExpression("#unit")
                .withExpressionAttributeNames(Map.of("#unit", "unit"));
        return amazonDynamoDB.scan(scanRequest).getItems()
                .stream()
                .map(i -> i.get("unit").getS())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public List<UnitCourseDto> getUnitsAndCourses() {
        var scanRequest = new ScanRequest()
                .withTableName(wordsTableName)
                .withProjectionExpression("course, #unit")
                .withExpressionAttributeNames(Map.of("#unit", "unit"));
        return amazonDynamoDB.scan(scanRequest)
                .getItems()
                .stream().map(i -> new UnitCourseDto(i.get("unit").getS(), i.get("course").getS()))
                .distinct()
                .collect(Collectors.toList());
    }

    public List<UnitCourseDto> getUnitsByCourses(List<String> courses) {
        var scanRequest = new ScanRequest()
                .withTableName(wordsTableName)
                .withProjectionExpression("course, #unit");
        if (!courses.isEmpty()) {
            var attributeValues = IntStream.range(0, courses.size())
                    .boxed()
                    .collect(Collectors.toMap(i -> ":course" + i, i -> new AttributeValue().withS(courses.get(i))));

            scanRequest.withFilterExpression("course IN (" + String.join(",", attributeValues.keySet()) + ")")
                    .withExpressionAttributeNames(Map.of("#unit", "unit"))
                    .withExpressionAttributeValues(attributeValues);
        }

        return amazonDynamoDB.scan(scanRequest).getItems()
                .stream()
                .map(i -> new UnitCourseDto(i.get("unit").getS(), i.get("course").getS()))
                .distinct()
                .sorted(Comparator.comparing(UnitCourseDto::getUnit))
                .collect(Collectors.toList());
    }
}
