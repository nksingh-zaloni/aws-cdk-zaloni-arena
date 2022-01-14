// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as cdk from 'aws-cdk-lib';
import { KeyPair } from 'cdk-ec2-key-pair';
import { Construct } from 'constructs';
import { Bastion } from './bastion';
import { Control } from './control';
import { DirectoryService } from './directory_service';
import { Network } from './network';

interface MainStackProps extends cdk.StackProps {
  // VPC CIDR
  vpcCidr: string;

  // Domain Name
  domainName: string;

  // Directory Edition: Standard (default) or Enterprise
  directoryEdition?: string;

  // Instance type for Bastion Host
  bastionHostInstanceType: string;

  // Bastion Host whitelisted IPs
  bastionHostWhitelist: Array<string>;

  // Instance type for Control Node
  controlNodeInstanceType: string;

  // Control Node whitelisted IPs
  controlNodeWhitelist: Array<string>;
}

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props);

    // Create a Key Pair to be used by Bastion and Control hosts
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

    // Create a VPC to host everything
    const network = new Network(this, 'Network', {
      vpcCidr: props.vpcCidr,
    });

    // Directory service
    const ds = new DirectoryService(this, 'DirectoryService', {
      vpc: network.vpc,
      domainName: props.domainName,
      directoryEdition: props.directoryEdition,
    });

    // Windows Bastion host to managed the directory service
    const bastion = new Bastion(this, 'Bastion', {
      vpc: network.vpc,
      key,
      instanceType: props.bastionHostInstanceType,
      whitelist: props.bastionHostWhitelist,
      dsSecret: ds.secret,
    });
    bastion.node.addDependency(ds);

    // Linux Host to install Zaloni Arena using Ansible
    new Control(this, 'Control', {
      vpc: network.vpc,
      key,
      instanceType: props.controlNodeInstanceType,
      whitelist: props.controlNodeWhitelist,
    });
  }
}