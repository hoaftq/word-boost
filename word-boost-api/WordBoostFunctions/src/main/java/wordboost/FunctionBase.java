package wordboost;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;

import java.util.HashMap;

public class FunctionBase {

    protected final String wordsTableName = System.getenv("WORDS_TABLE");

    protected final ObjectMapper objectMapper = new ObjectMapper();

    protected final AmazonDynamoDB dynamoDB = DynamoDBUtil.GetAmazonDynamoDB();

    @SneakyThrows
    protected APIGatewayProxyResponseEvent createResponse(Object body) {
        return new APIGatewayProxyResponseEvent()
                .withHeaders(new HashMap<>() {{
                    put("Access-Control-Allow-Origin", "*");
                }})
                .withBody(objectMapper.writeValueAsString(body));
    }
}
