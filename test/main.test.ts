import '@aws-cdk/assert/jest';
import { resolve } from 'path';
import { App } from '@aws-cdk/core';
import * as YAML from 'yamljs';
import { MainStack } from '../src/main-stack';

test('Snapshot', () => {
  const app = new App();
  const config = YAML.load(resolve(__dirname, '../config/dev.yaml'));
  const stack = new MainStack(app, 'test', {
    ...config,
  });

  expect(stack).not.toHaveResource('AWS::S3::Bucket');
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});