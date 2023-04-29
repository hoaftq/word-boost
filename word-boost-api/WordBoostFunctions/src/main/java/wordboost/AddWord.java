package wordboost;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;

import java.util.HashMap;
import java.util.UUID;

public class AddWord implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final String wordsTableName = System.getenv("WORDS_TABLE");

    private final DynamoDB dynamoDB = new DynamoDB(AmazonDynamoDBClientBuilder.defaultClient());

    private final ObjectMapper objectMapper = new ObjectMapper();

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent request, final Context context) {
        context.getLogger().log("Request: " + request.getBody());

        var wordId = addWord(request.getBody());

        return new APIGatewayProxyResponseEvent()
                .withHeaders(new HashMap<>() {{
                    put("Content-Type", "application/json");
                    put("X-Custom-Header", "application/json");
                }})
                .withStatusCode(200)
                .withBody(wordId);
    }

    @SneakyThrows
    private String addWord(String requestBody) {
        var newWord = objectMapper.readValue(requestBody, Word.class);
        var table = dynamoDB.getTable(wordsTableName);
        var id = UUID.randomUUID().toString();
        table.putItem(new Item()
                .with("id", id)
                .with("value", newWord.getValue())
                .with("unit", newWord.getUnit())
                .with("course", newWord.getCourse()));

        return id;
    }
}
