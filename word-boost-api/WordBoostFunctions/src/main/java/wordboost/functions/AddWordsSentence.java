package wordboost.functions;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.FunctionBase;
import wordboost.dtos.WordsSentenceDto;
import wordboost.dtos.WordsSentenceDtoMapper;
import wordboost.services.WordService;

import java.util.stream.Collectors;

public class AddWordsSentence extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final WordService wordService = new WordService();

    @SneakyThrows
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var wordsSentenceDto = objectMapper.readValue(request.getBody(), WordsSentenceDto.class);
        var words = WordsSentenceDtoMapper.toWords(wordsSentenceDto);

        var ids = words.stream()
                .map(wordService::addWord)
                .collect(Collectors.joining(","));

        return createResponse(ids);
    }
}
