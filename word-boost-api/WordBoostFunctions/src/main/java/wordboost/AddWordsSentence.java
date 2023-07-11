package wordboost;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.WordFunction;
import wordboost.dtos.WordsSentenceDto;
import wordboost.dtos.WordsSentenceDtoMapper;

import java.util.stream.Collectors;

public class AddWordsSentence extends WordFunction implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    @SneakyThrows
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var wordsSentenceDto = objectMapper.readValue(request.getBody(), WordsSentenceDto.class);
        var words = WordsSentenceDtoMapper.toWords(wordsSentenceDto);
        var ids = words.stream().map(this::addWord)
                .collect(Collectors.joining(","));
        return createResponse(ids);
    }
}
