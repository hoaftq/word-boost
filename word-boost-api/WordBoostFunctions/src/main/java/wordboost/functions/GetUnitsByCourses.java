package wordboost.functions;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import wordboost.common.FunctionBase;
import wordboost.services.UnitCourseService;

import java.util.Collections;
import java.util.Optional;

public class GetUnitsByCourses extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final UnitCourseService unitCourseService = new UnitCourseService();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var courses = Optional.ofNullable(request.getMultiValueQueryStringParameters())
                .map(q -> q.get("course"))
                .orElse(Collections.emptyList());

        var unitCourseDtos = unitCourseService.getUnitsByCourses(courses);
        return createResponse(unitCourseDtos);
    }
}
