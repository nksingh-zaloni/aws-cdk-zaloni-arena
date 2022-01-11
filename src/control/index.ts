// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import { KeyPair } from 'cdk-ec2-key-pair';

interface ControlProps {
  vpc: ec2.Vpc;
  key: KeyPair;
  instanceType: string,
  whitelist: Array<string>
}

export class Control extends cdk.Construct {
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: cdk.Construct, id: string, props: ControlProps) {
    super(scope, id);

    this.securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: props.vpc,
      description: 'Zaloni Arena Control Node',
      allowAllOutbound: true
    });
    
    // Access to the white listed IPs
    for (const ip of props.whitelist) {
      this.securityGroup.addIngressRule(ec2.Peer.ipv4(ip), ec2.Port.tcp(22), 'Allow SSH Access');
    }

    // EC2 role
    const role = new iam.Role(this, 'ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess') // TBD: Should be reduced to what actually is needed by ansible scripts
      ]
    })

    // Use Latest Amazon Linux Image - CPU Type ARM64
    const machineImage = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64
    });
    
    const userData = [
      "yum update -y",
      "sudo yum install -y amazon-linux-extras ansible2 java-1.8.0-openjdk",
    ];

    // Create the Control Node
    const instance = new ec2.Instance(this, 'ControlNode', {
      vpc: props.vpc,
      instanceType: new ec2.InstanceType(props.instanceType),
      machineImage,
      securityGroup: this.securityGroup,
      keyName: props.key.keyPairName,
      role,
      vpcSubnets: {
        subnetGroupName: 'public-subnet'
      }
    });
    instance.userData.addCommands(...userData);
    new cdk.CfnOutput(this, 'Control Node IP Address', { value: instance.instancePublicIp });
    new cdk.CfnOutput(this, 'Control Node ssh command', { value: 'ssh -i ' + props.key.keyPairName + '.pem -o IdentitiesOnly=yes ec2-user@' + instance.instancePublicIp })
 }
}