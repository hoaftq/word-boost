package wordboost;

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import wordboost.common.DynamoDBUtil;
import wordboost.entities.Word;

import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;

public class AddWord implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final String wordsTableName = System.getenv("WORDS_TABLE");

    private final DynamoDB dynamoDB = new DynamoDB(DynamoDBUtil.GetAmazonDynamoDB());

    private final ObjectMapper objectMapper = new ObjectMapper();

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent request, final Context context) {
        context.getLogger().log("Request: " + request.getBody());

        var wordId = addWord(request.getBody());

        return new APIGatewayProxyResponseEvent()
                .withHeaders(new HashMap<>() {{
                    put("Access-Control-Allow-Origin", "*");
                }})
                .withStatusCode(200)
                .withBody(wordId);
    }

    @SneakyThrows
    private String addWord(String requestBody) {
        var newWord = objectMapper.readValue(requestBody, Word.class);
        var wordId = UUID.randomUUID().toString();
        var sentences2 = newWord.getSentences2().stream()
                .map(s -> {
                    try {
                        return objectMapper.writeValueAsString(s);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());


        var table = dynamoDB.getTable(wordsTableName);
        table.putItem(new Item()
                .with("id", wordId)
                .with("value", newWord.getValue())
                .with("unit", newWord.getUnit())
                .with("course", newWord.getCourse())
                .with("imageUrl", newWord.getImageUrl())
                .with("order", newWord.getOrder())
                .with("sentences2", sentences2)
        );

        return wordId;
    }
}
