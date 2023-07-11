package wordboost.functions;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import wordboost.common.FunctionBase;
import wordboost.services.UnitCourseService;

public class GetUnitsAndCourses extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final UnitCourseService unitCourseService = new UnitCourseService();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {
        var unitsAndCourses = unitCourseService.getUnitsAndCourses();
        return createResponse(unitsAndCourses);
    }
}
