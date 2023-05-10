@echo off
set WORD_BOOST_BUCKET_URL=word-boost.s3.ap-southeast-1.amazonaws.com
if %API_CLOUDFORMATION_STACK_NAME%=="" (
  set API_CLOUDFORMATION_STACK_NAME="<your api cloudformation stack name>"
)
echo API_CLOUDFORMATION_STACK_NAME=%API_CLOUDFORMATION_STACK_NAME%

for /F "tokens=*" %%u in ('aws cloudformation describe-stacks --stack-name "%API_CLOUDFORMATION_STACK_NAME%" --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue | [0]"') do (
  set API_URL=%%~u
)
echo API_URL=%API_URL%

for /F "tokens=*" %%i in ('aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[0].DomainName=='%WORD_BOOST_BUCKET_URL%'].Id | [0]"') do (
  set WORD_BOOST_DISTRIBUTION_ID=%%~i
)
echo WORD_BOOST_DISTRIBUTION_ID=%WORD_BOOST_DISTRIBUTION_ID%

npm run build ^
 && aws s3 sync ./out s3://word-boost ^
 && aws cloudfront create-invalidation --distribution-id %WORD_BOOST_DISTRIBUTION_ID% --path "/*"
