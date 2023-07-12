package wordboost.functions;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.FunctionBase;
import wordboost.entities.Lesson;
import wordboost.services.LessonService;

public class AddLesson extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private final LessonService lessonService = new LessonService();

    @SneakyThrows
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var lesson = objectMapper.readValue(request.getBody(), Lesson.class);
        lessonService.saveLesson(lesson);
        return createResponse("");
    }
}
