const { AwsCdkTypeScriptApp } = require('projen');
const project = new AwsCdkTypeScriptApp({
  name: 'aws-cdk-zaloni-arena',
  description: 'This project is meant to automate the deployment of all the resources required to deploy Zaloni Arena on AWS using AWS CDK in Typescript.',
  license: 'MIT-0',
  copyrightOwner: 'Amazon.com, Inc. or its affiliates. All Rights Reserved.',
  copyrightPeriod: '',
  defaultReleaseBranch: 'main',
  cdkVersion: '1.134.0',
  cdkDependencies: [
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-ssm',
    '@aws-cdk/pipelines',
    '@aws-cdk/aws-codecommit',
    '@aws-cdk/aws-directoryservice',
    '@aws-cdk/aws-secretsmanager',
  ],
  deps: [
    'cdk-ec2-key-pair@2.2.0',
    'yamljs',
    '@types/yamljs',
  ],
  context: {
    ['@aws-cdk/core:newStyleStackSynthesis']: true,
  },
  gitignore: [
    '*.pem',
    'test/__snapshots__/',
  ],
});
project.synth();