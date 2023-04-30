package wordboost;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;

import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

public class GetWordsByUnit implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private final String wordsTableName = System.getenv("WORDS_TABLE");

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AmazonDynamoDB dynamoDB = DynamoDBUtil.GetAmazonDynamoDB();

    @SneakyThrows
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        String unit = "";
        if (request.getQueryStringParameters() != null) {
            unit = request.getQueryStringParameters().getOrDefault("unit", "");
        }

        var words = getWordsByUnit(unit);

        return new APIGatewayProxyResponseEvent()
                .withHeaders(new HashMap<>() {{
                    put("Access-Control-Allow-Origin", "*");
                }})
                .withBody(objectMapper.writeValueAsString(words));
    }

    private List<Word> getWordsByUnit(String unit) {
        var scanRequest = new ScanRequest().withTableName(wordsTableName);
        if (unit != null && !unit.isEmpty()) {
            scanRequest.withFilterExpression("#unitAttr = :unitValue")
                    .withExpressionAttributeNames(new HashMap<>() {{
                        put("#unitAttr", "unit");
                    }})
                    .withExpressionAttributeValues(new HashMap<>() {{
                        put(":unitValue", new AttributeValue().withS(unit));
                    }});
        }
        return dynamoDB.scan(scanRequest).getItems()
                .stream()
                .map(i -> Word.builder()
                        .id(i.get("id").getS())
                        .value(i.getOrDefault("value", new AttributeValue()).getS())
                        .unit(i.get("unit").getS())
                        .course(i.get("course").getS())
                        .build()
                ).collect(Collectors.toList());
    }
}
