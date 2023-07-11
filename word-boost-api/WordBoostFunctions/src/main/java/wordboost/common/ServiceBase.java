package wordboost.common;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.fasterxml.jackson.databind.ObjectMapper;

public abstract class ServiceBase {

    protected final String wordsTableName = System.getenv("WORDS_TABLE");

    protected final ObjectMapper objectMapper = new ObjectMapper();

    protected final AmazonDynamoDB amazonDynamoDB = DynamoDBUtil.GetAmazonDynamoDB();
}
