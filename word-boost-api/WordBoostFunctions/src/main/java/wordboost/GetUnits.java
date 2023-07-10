package wordboost;

import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.FunctionBase;

import java.util.Map;
import java.util.stream.Collectors;

public class GetUnits extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    @SneakyThrows
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var scanRequest = new ScanRequest().withTableName(wordsTableName)
                .withProjectionExpression("#unit")
                .withExpressionAttributeNames(Map.of("#unit", "unit"));
        var units = amazonDynamoDB.scan(scanRequest).getItems()
                .stream()
                .map(i -> i.get("unit").getS())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return createResponse(units);
    }
}