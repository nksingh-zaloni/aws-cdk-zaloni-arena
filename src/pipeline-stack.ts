// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { resolve } from 'path';
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { CodePipelineSource, CodePipeline, CodeBuildStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import YAML from 'yamljs';
import { MainStage } from './main-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repo = codecommit.Repository.fromRepositoryName(this, 'Repository',
      'aws-cdk-zaloni-arena');

    // @ts-ignore
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'aws-cdk-zaloni-arena',
      crossAccountKeys: true,
      synth: new CodeBuildStep('SynthStep', {
        input: CodePipelineSource.codeCommit(repo, 'pipeline'),
        commands: [
          'npm i',
          'npx projen synth',
        ],
      }),
    });

    try {
      const config = YAML.load(resolve(__dirname, '../config/test.yaml'));
      pipeline.addStage(new MainStage(this, 'test', { config }));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code != 'ENOENT') {
        throw err;
      }
    }

    try {
      const config = YAML.load(resolve(__dirname, '../config/prod.yaml'));
      pipeline.addStage(new MainStage(this, 'prod', { config }), {
        pre: [new ManualApprovalStep('PromoteToProd')],
      });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code != 'ENOENT') {
        throw err;
      }
    }

  }
}
