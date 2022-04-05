import * as cdk from '@aws-cdk/core';
import * as ssp from '@aws-quickstart/ssp-amazon-eks';
import { DatadogAddOn } from '../lib';

const app = new cdk.App();

const addOns: Array<ssp.ClusterAddOn> = [
    new DatadogAddOn({
        // One of these must be uncommented and configured
        // apiKey: '<api key>',
        // apiKeyExistingSecret: '<secret name>'
    })
];

const account = '<account id>'
const region = '<region>'
const stackID = '<stack id>'
const props = { env: { account, region } }

new ssp.EksBlueprint(app, { id: stackID, addOns}, props)
