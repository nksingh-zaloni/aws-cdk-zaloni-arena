// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MainStack } from './main-stack';
import { Stage, Construct, StageProps } from '@aws-cdk/core';

interface MainStageProps extends StageProps {
    config: any
}
    
export class MainStage extends Stage {
    constructor(scope: Construct, id: string, props: MainStageProps) {
        super(scope, id, props);

        new MainStack(this, 'arena', {
            ...props.config            
        });
    }
}