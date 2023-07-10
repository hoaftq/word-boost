package wordboost;

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.SneakyThrows;
import wordboost.common.DynamoDBUtil;
import wordboost.common.FunctionBase;
import wordboost.dtos.WordDto;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class AddWord extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private final DynamoDB dynamoDB = new DynamoDB(DynamoDBUtil.GetAmazonDynamoDB());

    @SneakyThrows
    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent request, final Context context) {
        context.getLogger().log("Request: " + request.getBody());
        var newWord = objectMapper.readValue(request.getBody(), WordDto.class);
        var wordId = addWord(newWord);
        return createResponse(wordId);
    }

    @SneakyThrows
    private String addWord(WordDto wordDto) {
        var wordId = UUID.randomUUID().toString();
        var sentences = getSentences(wordDto);

        var table = dynamoDB.getTable(wordsTableName);
        table.putItem(new Item()
                .with("id", wordId)
                .with("value", wordDto.getValue())
                .with("unit", wordDto.getUnit())
                .with("course", wordDto.getCourse())
                .with("imageUrl", wordDto.getImageUrl())
                .with("order", wordDto.getOrder())
                .with("sentences2", sentences)
        );

        return wordId;
    }

    private List<String> getSentences(WordDto wordDto) {
        return wordDto.getSentences().stream()
                .map(s -> {
                    try {
                        return objectMapper.writeValueAsString(s);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());
    }
}
