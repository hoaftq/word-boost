@echo off
if "%API_URL%"=="" (
  echo Please set API_URL with "set API_URL=<your api url>"
  exit /b
)

if "%WORD_BOOST_DISTRIBUTION_ID%"=="" (
  echo Please set WORD_BOOST_DISTRIBUTION_ID with "set WORD_BOOST_DISTRIBUTION_ID=<your cloudfront distribution id>"
  exit /b
)

npm run build ^
 && aws s3 sync ./out s3://word-boost ^
 && aws cloudfront create-invalidation --distribution-id %WORD_BOOST_DISTRIBUTION_ID% --path "/*"
