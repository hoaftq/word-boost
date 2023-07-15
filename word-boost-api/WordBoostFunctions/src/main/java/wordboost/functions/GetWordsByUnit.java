package wordboost.functions;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.FunctionBase;
import wordboost.dtos.WordDtoMapper;
import wordboost.services.WordService;

import java.util.Optional;
import java.util.stream.Collectors;

public class GetWordsByUnit extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final WordService wordService = new WordService();

    @SneakyThrows
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var unit = Optional.ofNullable(request.getQueryStringParameters())
                .map(q -> q.get("unit"))
                .orElse(null);

        var words = wordService.getWordsByUnit(unit)
                .stream().map(WordDtoMapper.INSTANCE::mapWord)
                .collect(Collectors.toList());

        return createResponse(words);
    }
}
