package wordboost;

import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import wordboost.common.FunctionBase;
import wordboost.dtos.UnitCourseDto;

import java.util.Map;
import java.util.stream.Collectors;

public class GetUnitsAndCourses extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {
        var scanRequest = new ScanRequest()
                .withTableName(wordsTableName)
                .withProjectionExpression("course, #unit")
                .withExpressionAttributeNames(Map.of("#unit", "unit"));
        var courses = amazonDynamoDB.scan(scanRequest)
                .getItems()
                .stream().map(i -> new UnitCourseDto(i.get("unit").getS(), i.get("course").getS()))
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return createResponse(courses);
    }
}
