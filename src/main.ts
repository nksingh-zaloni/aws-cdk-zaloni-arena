// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from '@aws-cdk/core';
import { PipelineStack } from './pipeline-stack';
import { resolve } from 'path';
const YAML = require('yamljs');
import { MainStage } from './main-stage';

const app = new cdk.App();

new PipelineStack(app, 'arena-pipeline', { 
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});

try {
  const config = YAML.load(resolve(__dirname, '../config/dev.yaml'))
  new MainStage(app, 'dev', {
    env: { 
      account: process.env.CDK_DEFAULT_ACCOUNT, 
      region: process.env.CDK_DEFAULT_REGION 
    },
    config
  });
} catch (err) {
    if ((err as NodeJS.ErrnoException).code != 'ENOENT') {
        throw err;
    } else {
        console.log('ERROR: ./config/dev.yaml file not found');
    }
}

app.synth();