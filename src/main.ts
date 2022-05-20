// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
​
import { resolve } from 'path';
import * as cdk from '@aws-cdk/core';
import * as YAML from 'yamljs';
import { MainStage } from './main-stage';
import { PipelineStack } from './pipeline-stack';
​
const app = new cdk.App();
​
new PipelineStack(app, 'arena-pipeline', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
​
try {
  const config = YAML.load(resolve(__dirname, '../config/dev.yaml'));
  new MainStage(app, 'control', {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
    config,
  });
} catch (err) {
  if ((err as NodeJS.ErrnoException).code != 'ENOENT') {
    throw err;
  } else {
    console.log('ERROR: ./config/dev.yaml file not found');
  }
}
​
app.synth();