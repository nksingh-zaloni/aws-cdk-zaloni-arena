// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MainStack } from './main-stack';

interface MainStageProps extends cdk.StageProps {
  config: any;
}

export class MainStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: MainStageProps) {
    super(scope, id, props);

    new MainStack(this, 'aws-cdk-zaloni-arena', {
      ...props.config,
    });
  }
}