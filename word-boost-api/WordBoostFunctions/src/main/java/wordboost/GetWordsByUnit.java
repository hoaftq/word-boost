package wordboost;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.WordFunction;

import java.util.Optional;

public class GetWordsByUnit extends WordFunction implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    @SneakyThrows
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var unit = Optional.ofNullable(request.getQueryStringParameters())
                .map(q -> q.get("unit"))
                .orElse(null);

        var words = getWordsByUnit(unit);

        return createResponse(words);
    }
}
