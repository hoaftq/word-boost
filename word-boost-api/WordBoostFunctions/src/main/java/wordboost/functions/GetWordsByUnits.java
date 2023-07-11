package wordboost.functions;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.FunctionBase;
import wordboost.dtos.UnitCourseDto;
import wordboost.services.WordService;

public class GetWordsByUnits extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final WordService wordService = new WordService();

    @Override
    @SneakyThrows
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var unitCourseDtos = objectMapper.readValue(request.getBody(), UnitCourseDto[].class);
        var result = wordService.getWordsByUnits(unitCourseDtos);
        return createResponse(result);
    }
}
