# AWS CDK Infrastructure as Code for Zaloni Arena

This project is meant to automate the deployment of all the resources required to deploy Zaloni Arena on 
AWS using AWS CDK in Typescript.

## Getting started

*The following instructions has been developed and tested on the [AWS Cloud9](https://aws.amazon.com/cloud9) IDE.*

Clone this repository and issue the following commands to initialize the cdk in the account and region your 
Cloud9 instance is running in:

```console
cd aws-cdk-zaloni-arena
npm install -g yarn
npm install
npx cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

To install the stack with [this configuration](./config/dev.yaml)

```console
npx cdk deploy Dev/*
```

## CI/CD Pipeline


Create the [AWS CodeCommit](https://aws.amazon.com/codecommit) repository that our pipeline will use as source

```console
aws codecommit create-repository --repository-name aws-cdk-zaloni-arena
```

Create a local branch and commit it to the AWS Code Commit repository

```console
pip3 install git-remote-codecommit
git remote add pipeline codecommit://aws-cdk-zaloni-arena
git checkout -b pipeline
git push pipeline pipeline 
```

Install the pipeline stack

```console
npx cdk deploy --require-approval never
```

After the pipeline stack has been created, the pipeline itself will automatically be 
triggered but will not install anything as there are no configuration files.
To create a configuration file for **test** and **prod**

```console
cp ./config/dev.yaml ./config/test.yaml
cp ./config/dev.yaml ./config/prod.yaml
...edit files to suit your setup...
git add ./config/test.yaml ./config/prod.yaml
git commit -am"created config for test and prod"
git push pipeline pipeline 
```

Wait for the pipeline to be triggered again and observe the test stack to be created.
Creation of **prod** stack requires manual approval which can be given in AWS CodePipeline.
Look at each stack outputs in AWS CloudFormation for relevant information on how 
to access the resources created by the stacks.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This code is licensed under the MIT-0 License. See the LICENSE file.
