const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  name: 'aws-cdk-zaloni-arena',
  description: 'This project is meant to automate the deployment of all the resources required to deploy Zaloni Arena on AWS using AWS CDK in Typescript.',
  license: 'MIT-0',
  copyrightOwner: 'Amazon.com, Inc. or its affiliates. All Rights Reserved.',
  copyrightPeriod: '',
  defaultReleaseBranch: 'main',
  cdkVersion: '2.8.0',
  deps: [
    'cdk-ec2-key-pair',
    'yamljs',
    '@types/yamljs',
    'cdk-iam-floyd',
  ],
  gitignore: [
    '*.pem',
  ],
});
project.synth();
