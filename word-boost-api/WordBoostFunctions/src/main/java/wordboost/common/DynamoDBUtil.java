package wordboost.common;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;

public final class DynamoDBUtil {

    public static AmazonDynamoDB GetAmazonDynamoDB() {
        var isLocalSam = Boolean.parseBoolean(System.getenv("AWS_SAM_LOCAL"));
        if (isLocalSam) {
            return AmazonDynamoDBClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration("http://host.docker.internal:8000", "local"))
                    .build();
        }

        return AmazonDynamoDBClientBuilder.defaultClient();
    }
}
