#!/bin/bash

sudo amazon-linux-extras install epel -y
sudo amazon-linux-extras install ansible2 -y
sudo yum update -y

sudo yum groupinstall "Development Tools" -y
sudo yum install gcc open-ssl-devel bzip2-devel libffi-devel -y
sudo yum install wget -y
sudo wget https://www.python.org/ftp/python/3.7.10/Python-3.7.10.tgz
sudo tar xzf Python-3.7.10.tgz
cd Python-3.7.10
sudo ./configure --enable-optimizations
sudo make altinstall
cd ../

sudo yum install python3-pip
pip3 install boto3
sudo yum install git -y
sudo yum install java-1.8.0-openjdk -y

curl --silent --location http://pkg.jenkins-ci.org/redhat-stable/jenkins.repo | sudo tee /etc/yum.repos.d/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
sudo yum install jenkins -y
sudo systemctl start jenkins
sudo systemctl enable jenkins
sudo cat /var/lib/jenkins/secrets/initialAdminPassword


#TO_DO
# Install docker