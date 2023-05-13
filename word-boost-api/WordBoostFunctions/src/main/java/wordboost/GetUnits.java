package wordboost;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;

import java.util.HashMap;
import java.util.stream.Collectors;

public class GetUnits implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private final String wordsTableName = System.getenv("WORDS_TABLE");

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AmazonDynamoDB dynamoDB = DynamoDBUtil.GetAmazonDynamoDB();

    @SneakyThrows
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var result = dynamoDB.scan(new ScanRequest().withTableName(wordsTableName));
        var words = result.getItems().stream()
                .map(i -> i.get("unit").getS())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return new APIGatewayProxyResponseEvent()
                .withHeaders(new HashMap<>() {{
                    put("Access-Control-Allow-Origin", "*");
                }})
                .withBody(objectMapper.writeValueAsString(words));
    }
}