// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from 'aws-cdk-lib';
import * as directoryservice from 'aws-cdk-lib/aws-directoryservice';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface DirectoryServiceProps {
  vpc: ec2.Vpc;
  domainName: string;
  directoryEdition?: string;
}

export class DirectoryService extends Construct {
  public readonly secret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: DirectoryServiceProps) {
    super(scope, id);

    this.secret = new secretsmanager.Secret(this, 'Secret', {
      secretName: 'directory-service/' + cdk.Stack.of(this).stackName + '/private',
      description: 'Directory service credentials created for aws-cdk-zaloni-arena stack',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'admin',
          domain: props.domainName,
        }),
        generateStringKey: 'password',
        passwordLength: 30,
        excludeCharacters: "\"@'$`",
      },
    });

    new cdk.CfnOutput(this, 'ADCredentials', {
      value: 'aws secretsmanager get-secret-value --secret-id ' +
        this.secret.secretName,
    });

    const subnetIds: Array<string> = [];
    const selection = props.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_NAT });
    for (const subnet of selection.subnets) {
      subnetIds.push(subnet.subnetId);
    }

    const ds = new directoryservice.CfnMicrosoftAD(this, 'DhcpOptions', {
      name: props.domainName,
      password: this.secret.secretValueFromJson('password').toString(),
      vpcSettings: {
        subnetIds,
        vpcId: props.vpc.vpcId,
      },
      edition: props.directoryEdition !== undefined ? props.directoryEdition : 'Standard',
    });

    const dhcp_options = new ec2.CfnDHCPOptions(this, 'DHCPOptions', {
      domainName: props.domainName,
      domainNameServers: ds.attrDnsIpAddresses,
    });

    new ec2.CfnVPCDHCPOptionsAssociation(this, 'DhcpOptionsAssociation', {
      dhcpOptionsId: dhcp_options.ref,
      vpcId: props.vpc.vpcId,
    });
  }
}