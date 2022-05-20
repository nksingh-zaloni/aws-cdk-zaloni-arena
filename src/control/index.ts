// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
​
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import { KeyPair } from 'cdk-ec2-key-pair';
import {readFileSync} from 'fs';
​
interface ControlProps {
  vpcId: string;
  vpcCIDR: string;
  key: KeyPair;
  instanceType: string;
  whitelist: Array<string>;
}
​
export class Control extends cdk.Construct {
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly jenkinsSecurityGroup: ec2.SecurityGroup;
​
  constructor(scope: cdk.Construct, id: string, props: ControlProps) {
    super(scope, id);
​
    const vpc = ec2.Vpc.fromLookup(this, 'vpc', { vpcId: props.vpcId });
​
    // import default VPC
    // const vpc = ec2.Vpc.fromLookup(this, 'my-default-vpc', {
    //   isDefault: true,
    // });
​
    this.securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: vpc,
      description: 'Zaloni Arena Control Node',
      allowAllOutbound: true,
    });
​
    // create a security group for the EC2 instance
    this.jenkinsSecurityGroup = new ec2.SecurityGroup(this, 'jenkins-sg', {
      vpc,
    });
​
    // Access to the white listed IPs
    for (const ip of props.whitelist) {
      this.jenkinsSecurityGroup.addIngressRule(ec2.Peer.ipv4(ip), ec2.Port.tcp(8080), 'allow HTTP traffic');
      this.securityGroup.addIngressRule(ec2.Peer.ipv4(ip), ec2.Port.tcp(22), 'Allow SSH Access');
    }
​
    this.securityGroup.addIngressRule(ec2.Peer.ipv4(props.vpcCIDR), ec2.Port.allTraffic(), 'Allow SSH Access');
    // EC2 role
    const role = new iam.Role(this, 'ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'), // TBD: Should be reduced to what actually is needed by ansible scripts
      ],
    });
​
    // Use Latest Amazon Linux Image - CPU Type ARM64
    const machineImage = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });
​
    // Create the Control Node
    const instance = new ec2.Instance(this, 'ControlNode', {
      vpc: vpc,
      instanceType: new ec2.InstanceType(props.instanceType),
      machineImage,
      securityGroup: this.securityGroup,
      keyName: props.key.keyPairName,
      role,
      vpcSubnets: {subnetType: ec2.SubnetType.PRIVATE_WITH_NAT},
    });
    instance.addSecurityGroup(this.jenkinsSecurityGroup);
    
    // load user data script
    const userDataScript = readFileSync('./lib/user-data.sh', 'utf8');
​
    //add user data to the EC2 instance
    instance.addUserData(userDataScript);
​
    
    new cdk.CfnOutput(this, 'Control Node IP Address', { value: instance.instancePrivateIp });
    new cdk.CfnOutput(this, 'Control Node ssh command', { value: 'ssh -i ' + props.key.keyPairName + '.pem -o IdentitiesOnly=yes ec2-user@' + instance.instancePrivateIp });
  }
}