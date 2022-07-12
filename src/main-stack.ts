// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from '@aws-cdk/core';
import { KeyPair } from 'cdk-ec2-key-pair';
import { Control } from './control';
​
interface MainStackProps extends cdk.StackProps {
  // VPC CIDR
  vpcId: string;
  vpcCIDR: string;
  availabilityZone: string;
  privateSubnetId: string;
  // Instance type for Control Node
  controlNodeInstanceType: string;
​
  // Control Node whitelisted IPs
  controlNodeWhitelist: Array<string>;
}
​
export class MainStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: MainStackProps) {
    super(scope, id, props);
​
    //Create a Key Pair to be used by Bastion and Control hosts
    const key = new KeyPair(this, 'KeyPair', {
      name: this.stackName,
      description: 'Key Pair created for aws-cdk-zaloni-arena stack',
    });
    key.grantReadOnPublicKey;
    new cdk.CfnOutput(this, 'Key Download Command', {
      value: 'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/' +
        this.stackName +
        '/private --query SecretString --output text > ' +
        key.keyPairName + '.pem && chmod 400 ' + key.keyPairName +'.pem',
    });
​
    //Linux Host to install Zaloni Arena using Ansible
    new Control(this, 'Control', {
      vpcId: props.vpcId,
      vpcCIDR: props.vpcCIDR,
      // availabilityZone: props.availabilityZone,
      privateSubnetId: props.privateSubnetId,
      key,
      instanceType: props.controlNodeInstanceType,
      whitelist: props.controlNodeWhitelist,
    });
  }
}