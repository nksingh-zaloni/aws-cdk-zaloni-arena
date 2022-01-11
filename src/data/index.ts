// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as efs from '@aws-cdk/aws-efs';
import * as s3 from '@aws-cdk/aws-s3';

interface DataProps {
  removalPolicy: cdk.RemovalPolicy;
  vpc: ec2.Vpc;
  s3BucketPrefix: string;
}

export class Data extends cdk.Construct {
  public readonly db: rds.DatabaseInstance;
  public readonly fs: efs.FileSystem;
  public readonly fsSecurityGroup: ec2.SecurityGroup;
  public readonly dbSecurityGroup: ec2.SecurityGroup;
  public readonly buckets: s3.Bucket[];
  
  constructor(scope: cdk.Construct, id: string, props: DataProps) {
    super(scope, id);
    
    // RDS Database
    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: false
    })
    
    const parameterGroup = new rds.ParameterGroup(this, 'ParameterGroup', {
      engine: rds.DatabaseInstanceEngine.mysql({version: rds.MysqlEngineVersion.VER_5_7}),
      parameters: {
        "log_bin_trust_function_creators": "1",
        "max_allowed_packet": "536870912",
        "query_cache_size": "536870912",
        "key_buffer_size": "1073741824",
        "time_zone": "US/Eastern"
      }
    });
    
    this.db = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.mysql({version: rds.MysqlEngineVersion.VER_5_7}),
      credentials: rds.Credentials.fromGeneratedSecret('admin'), 
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE,
      },
      vpc: props.vpc,
      parameterGroup,
      securityGroups: [ this.dbSecurityGroup ],
      removalPolicy: props.removalPolicy
    });
    
    // new cdk.CfnOutput(this, 'DB arn', { value: this.db.instanceArn })
    
    // EFS
    this.fsSecurityGroup = new ec2.SecurityGroup(this, 'FilesystemSG', {
      vpc: props.vpc,
      allowAllOutbound: true
    })
    
    this.fs = new efs.FileSystem(this, 'Filesystem', {
      vpc: props.vpc,
      securityGroup: this.fsSecurityGroup,
      removalPolicy: props.removalPolicy
    })
    
    new cdk.CfnOutput(this, 'EFS arn', { value: this.fs.fileSystemArn });
    
    // S3 Buckets
    this.buckets = ['Loading', 'Raw', 'Secure', 'Trusted', 'Refined'].map((postfix: string) => {
      const bucket = new s3.Bucket(this, 'Bucket' + postfix, {
        bucketName: [props.s3BucketPrefix, postfix.toLocaleLowerCase()].join('-'),
        removalPolicy: props.removalPolicy
      })
      
      new cdk.CfnOutput(this, 'S3Bucket'+postfix, { value: bucket.bucketArn });
      return bucket
    })
  }
}