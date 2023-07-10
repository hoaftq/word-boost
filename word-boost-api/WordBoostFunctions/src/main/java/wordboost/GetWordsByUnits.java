package wordboost;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;

public class GetWordsByUnits extends WordFunction implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    @Override
    @SneakyThrows
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var unitCourseDtos = objectMapper.readValue(request.getBody(), UnitCourseDto[].class);
        var result = getWordsByUnits(unitCourseDtos);
        return createResponse(result);
    }
}
