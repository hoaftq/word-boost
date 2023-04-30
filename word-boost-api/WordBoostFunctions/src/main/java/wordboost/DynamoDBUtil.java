package wordboost;

import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;

public final class DynamoDBUtil {

    public static final AmazonDynamoDB GetAmazonDynamoDB() {
        var isLocalSam = Boolean.valueOf(System.getenv("AWS_SAM_LOCAL"));
        if (isLocalSam) {
            return AmazonDynamoDBClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration("http://host.docker.internal:8000", "local"))
                    .build();
        }

        return AmazonDynamoDBClientBuilder.defaultClient();
    }
}
