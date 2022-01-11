const { AwsCdkTypeScriptApp } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.134.0',
  defaultReleaseBranch: 'main',
  name: 'aws-cdk-zaloni-arena',

  cdkDependencies: [
    "@aws-cdk/aws-ec2",
    "@aws-cdk/aws-iam",
    "@aws-cdk/aws-ssm",
    "@aws-cdk/pipelines",
    "@aws-cdk/aws-codecommit",
    "@aws-cdk/aws-directoryservice",
  ],
  // deps: [],                    /* Runtime dependencies of this module. */
  // description: undefined,      /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    "cdk-ec2-key-pair",
    "yamljs",
    "@types/yamljs"
  ],
  // packageName: undefined,      /* The "name" in package.json. */
  // release: undefined,          /* Add release management to this project. */
  context:{
    ["@aws-cdk/core:newStyleStackSynthesis"]: true
  }
});
project.gitignore.exclude('*.pem');
project.synth();