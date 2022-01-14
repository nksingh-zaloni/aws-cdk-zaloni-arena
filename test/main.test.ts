import { resolve } from 'path';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import YAML from 'yamljs';
import { MainStack } from '../src/main-stack';

test('Snapshot', () => {
  const app = new App();
  const config = YAML.load(resolve(__dirname, '../config/dev.yaml'));
  const stack = new MainStack(app, 'test', {
    ...config,
  });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});