REM API_URL and WORD_BOOST_DISTRIBUTION_ID system variables must be set before running this script
npm run build ^
 && aws s3 sync ./out s3://word-boost ^
 && aws cloudfront create-invalidation --distribution-id %WORD_BOOST_DISTRIBUTION_ID% --path "/*"
