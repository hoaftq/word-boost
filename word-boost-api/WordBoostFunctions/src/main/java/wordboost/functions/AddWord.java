package wordboost.functions;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.FunctionBase;
import wordboost.dtos.WordDto;
import wordboost.services.WordService;

public class AddWord extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final WordService wordService = new WordService();

    @SneakyThrows
    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent request, final Context context) {
        context.getLogger().log("Request: " + request.getBody());
        var newWord = objectMapper.readValue(request.getBody(), WordDto.class);
        var wordId = wordService.addWord(newWord);
        return createResponse(wordId);
    }
}
