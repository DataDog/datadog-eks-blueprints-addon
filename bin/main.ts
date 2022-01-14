import { App } from '@aws-cdk/core';
import * as ssp from '@aws-quickstart/ssp-amazon-eks';
import { DatadogAddOn } from '../dist';

const app = new App();
const account = '<account id>'
const region = '<region>'
const stackID = '<stack id>'
const stackProps = { env: { account, region } }

ssp.EksBlueprint.builder()
    .addOns(new DatadogAddOn({
        // One of these must be uncommented and configured
        // apiKey: '<api key>',
        // apiKeyExistingSecret: '<secret name>'
    }))
    .build(app, stackID, stackProps);
