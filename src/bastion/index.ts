// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import { KeyPair } from 'cdk-ec2-key-pair';

interface BastionProps {
  vpc: ec2.Vpc;
  key: KeyPair;
  instanceType: string,
  whitelist: Array<string>,
  dsSecret: secretsmanager.Secret
}

export class Bastion extends cdk.Construct {
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: cdk.Construct, id: string, props: BastionProps) {
    super(scope, id);

    this.securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: props.vpc,
      description: 'Zaloni Arena Bastion Host',
      allowAllOutbound: true
    });
    // Access to the white listed IPs
    for (const ip of props.whitelist) {
      this.securityGroup.addIngressRule(ec2.Peer.ipv4(ip), ec2.Port.tcp(3389), 'Allow RDP Access');
    }

    // EC2 role
    const role = new iam.Role(this, 'ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMDirectoryServiceAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite')
      ]
    })
    
    // Use Latest Windows 2016
    const machineImage = new ec2.WindowsImage(ec2.WindowsVersion.WINDOWS_SERVER_2016_ENGLISH_FULL_BASE);

    // Install tools to manage the our AD
    const userData = ec2.UserData.forWindows();
    userData.addCommands('Install-WindowsFeature DNS');
    userData.addCommands('Install-WindowsFeature -name AD-Domain-Services -IncludeManagementTools');
    userData.addCommands('Import-Module AWSPowerShell');
    userData.addCommands('[string]$SecretAD  = "' + props.dsSecret.secretName + '"');
    userData.addCommands('$SecretObj = Get-SECSecretValue -SecretId $SecretAD');
    userData.addCommands('[PSCustomObject]$Secret = ($SecretObj.SecretString  | ConvertFrom-Json)');
    userData.addCommands('$password   = $Secret.password | ConvertTo-SecureString -asPlainText -Force');
    userData.addCommands('$username   = $Secret.username + "@" + $Secret.domain');
    userData.addCommands('$credential = New-Object System.Management.Automation.PSCredential($username,$password)');
    userData.addCommands('Add-Computer -DomainName $Secret.domain -Credential $credential -Restart -Force');
    
    // Create the App Node
    const instance = new ec2.Instance(this, 'BastionHost', {
      vpc: props.vpc,
      instanceType: new ec2.InstanceType(props.instanceType),
      machineImage,
      securityGroup: this.securityGroup,
      keyName: props.key.keyPairName,
      userData,
      role,
      vpcSubnets: {
        subnetGroupName: 'public-subnet'
      }
    });
    // Join domain
    cdk.Tags.of(instance).add("JoinAD", "");

    new cdk.CfnOutput(this, 'Bastion Host IP Address', { value: instance.instancePublicIp });
    new cdk.CfnOutput(this, 'Bastion Host Administrator Password', { 
      value: 'aws ec2 get-password-data --instance-id ' + instance.instanceId +' --priv-launch-key ' + props.key.keyPairName + '.pem'
    });
  }
}