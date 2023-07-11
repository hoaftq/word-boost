package wordboost.common;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;

import java.util.HashMap;

public abstract class FunctionBase {

    protected final ObjectMapper objectMapper = new ObjectMapper();

    @SneakyThrows
    protected APIGatewayProxyResponseEvent createResponse(Object body) {
        return new APIGatewayProxyResponseEvent()
                .withHeaders(new HashMap<>() {{
                    put("Access-Control-Allow-Origin", "*");
                }})
                .withBody(objectMapper.writeValueAsString(body));
    }
}
