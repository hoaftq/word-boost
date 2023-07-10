package wordboost;

import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import wordboost.common.FunctionBase;

import java.util.stream.Collectors;

public class GetCourses extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {
        var scanRequest = new ScanRequest()
                .withTableName(wordsTableName)
                .withProjectionExpression("course");
        var courses = dynamoDB.scan(scanRequest)
                .getItems()
                .stream().map(i -> i.get("course").getS())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return createResponse(courses);
    }
}
