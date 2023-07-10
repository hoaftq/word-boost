package wordboost;

import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import wordboost.dtos.UnitCourseDto;

import java.util.Collections;
import java.util.Comparator;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class GetUnitsByCourses extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var courses = Optional.ofNullable(request.getMultiValueQueryStringParameters())
                .map(q -> q.get("course"))
                .orElse(Collections.emptyList());

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

        var unitCourseDtos = dynamoDB.scan(scanRequest).getItems()
                .stream()
                .map(i -> new UnitCourseDto(i.get("unit").getS(), i.get("course").getS()))
                .distinct()
                .sorted(Comparator.comparing(UnitCourseDto::getUnit))
                .collect(Collectors.toList());
        return createResponse(unitCourseDtos);
    }
}
