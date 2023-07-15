package wordboost.functions;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import lombok.SneakyThrows;
import wordboost.common.FunctionBase;
import wordboost.dtos.LessonWordsDto;
import wordboost.dtos.UnitCourseDto;
import wordboost.dtos.WordDtoMapper;
import wordboost.services.LessonService;
import wordboost.services.WordService;

import java.util.stream.Collectors;

public class GetWordsByUnits extends FunctionBase implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final WordService wordService = new WordService();
    private final LessonService lessonService = new LessonService();

    @Override
    @SneakyThrows
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        var unitCourseDtos = objectMapper.readValue(request.getBody(), UnitCourseDto[].class);
        if (unitCourseDtos.length == 0) {
            return createBadRequestResponse("Empty request");
        }

        var words = wordService.getWordsByUnits(unitCourseDtos)
                .stream().map(WordDtoMapper.INSTANCE::mapWord)
                .collect(Collectors.toList());

        // Only get the lesson for the first option
        var lesson = lessonService.getLesson(unitCourseDtos[0]);
        return createResponse(new LessonWordsDto(words, lesson));
    }
}
