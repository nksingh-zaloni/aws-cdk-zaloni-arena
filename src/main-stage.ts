// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
​
import { Stage, Construct, StageProps } from '@aws-cdk/core';
import { MainStack } from './main-stack';
​
interface MainStageProps extends StageProps {
  config: any;
}
​
export class MainStage extends Stage {
  constructor(scope: Construct, id: string, props: MainStageProps) {
    super(scope, id, props);
​
    new MainStack(this, 'aws-cdk-zaloni-arena', {
      ...props.config,
    });
  }
}