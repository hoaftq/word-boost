package wordboost.services;

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.SneakyThrows;
import wordboost.common.DynamoDBUtil;
import wordboost.common.ServiceBase;
import wordboost.dtos.UnitCourseDto;
import wordboost.dtos.WordDto;
import wordboost.entities.Sentence;

import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class WordService extends ServiceBase {

    private final DynamoDB dynamoDB = new DynamoDB(DynamoDBUtil.GetAmazonDynamoDB());

    public List<WordDto> getWordsByUnits(UnitCourseDto[] unitCourseDtos) {
        return getWords(scanRequest -> {
            var filterExpressionBuilder = new StringBuilder();
            HashMap<String, String> attributeNames = new HashMap<>();
            HashMap<String, AttributeValue> attributeValues = new HashMap<>();

            for (var i = 0; i < unitCourseDtos.length; i++) {
                var courseName = "#course" + i;
                var courseValue = ":course" + i;
                var unitName = "#unit" + i;
                var unitValue = ":unit" + i;
                attributeNames.put(courseName, "course");
                attributeValues.put(courseValue, new AttributeValue().withS(unitCourseDtos[i].getCourse()));
                attributeNames.put(unitName, "unit");
                attributeValues.put(unitValue, new AttributeValue().withS(unitCourseDtos[i].getUnit()));
                filterExpressionBuilder
                        .append(String.format("(%s = %s AND %s = %s)", courseName, courseValue, unitName, unitValue))
                        .append(" OR ");

            }

            filterExpressionBuilder.delete(filterExpressionBuilder.length() - 4, filterExpressionBuilder.length() - 1);

            scanRequest.withFilterExpression(filterExpressionBuilder.toString())
                    .withExpressionAttributeNames(attributeNames)
                    .withExpressionAttributeValues(attributeValues);
        });
    }

    public List<WordDto> getWordsByUnit(String unit) {
        return getWords(scanRequest -> {
            if (unit == null || unit.isEmpty()) {
                return;
            }

            scanRequest.withFilterExpression("#unit = :unit")
                    .withExpressionAttributeNames(Map.of("#unit", "unit"))
                    .withExpressionAttributeValues(Map.of(":unit", new AttributeValue().withS(unit)));
        });
    }

    @SneakyThrows
    public String addWord(WordDto wordDto) {
        var wordId = UUID.randomUUID().toString();
        var sentences = getSentences(wordDto);

        var table = dynamoDB.getTable(wordsTableName);
        table.putItem(new Item()
                .with("id", wordId)
                .with("value", wordDto.getValue())
                .with("unit", wordDto.getUnit())
                .with("course", wordDto.getCourse())
                .with("imageUrl", wordDto.getImageUrl())
                .with("order", wordDto.getOrder())
                .with("sentences2", sentences)
        );

        return wordId;
    }

    private List<String> getSentences(WordDto wordDto) {
        return wordDto.getSentences().stream()
                .map(s -> {
                    try {
                        return objectMapper.writeValueAsString(s);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());
    }

    private List<WordDto> getWords(Consumer<ScanRequest> scanRequestConsumer) {
        var scanRequest = new ScanRequest().withTableName(wordsTableName);
        scanRequestConsumer.accept(scanRequest);
        return amazonDynamoDB.scan(scanRequest).getItems()
                .stream()
                .map(this::mapToWord)
                .collect(Collectors.toList());
    }

    private WordDto mapToWord(Map<String, AttributeValue> item) {
        var sentenceMap = item.getOrDefault("sentences", new AttributeValue().withM(new HashMap<>())).getM();
        var sentences = sentenceMap.keySet().stream()
                .map(v -> new Sentence(v, sentenceMap.getOrDefault(v, new AttributeValue()).getS(), Integer.MAX_VALUE));
        var sentences2 = item.getOrDefault("sentences2", new AttributeValue().withL()).getL()
                .stream().map(s -> {
                    try {
                        return objectMapper.readValue(s.getS(), Sentence.class);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                });
        var allSentences = Stream.concat(sentences, sentences2)
                .sorted(Comparator.comparingInt(Sentence::getOrder))
                .collect(Collectors.toList());
        return WordDto.builder()
                .id(item.get("id").getS())
                .value(item.get("value").getS())
                .unit(item.get("unit").getS())
                .course(item.get("course").getS())
                .imageUrl(item.getOrDefault("imageUrl", new AttributeValue()).getS())
                .sentences(allSentences)
                .build();
    }
}