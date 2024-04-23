import { merge } from "ts-deepmerge";
import { Construct } from 'constructs';
import { ClusterInfo } from "@aws-quickstart/eks-blueprints/dist/spi";
import { HelmAddOn, HelmAddOnProps, HelmAddOnUserProps } from '@aws-quickstart/eks-blueprints/dist/addons/helm-addon';
import { getSecretValue } from "@aws-quickstart/eks-blueprints/dist/utils";

export interface DatadogAddOnProps extends HelmAddOnUserProps {
    /**
     * Your Datadog API key
     */
    apiKey?: string;

    /**
     * Datadog APP key required to use metricsProvider.
     * If you are using clusterAgent.metricsProvider.enabled = true, you must set a Datadog application key for read access to your metrics.
     */
    appKey?: string;

    /**
     * Use existing Secret which stores API key instead of creating a new one.
     * The value should be set with the `api-key` key inside the secret.
     * If set, this parameter takes precedence over "apiKey" and "apiKeyAWSSecret".
     */
    apiKeyExistingSecret?: string;

    /**
     * Use existing Secret which stores App key instead of creating a new one.
     * The value should be set with the `app-key` key inside the secret.
     * If set, this parameter takes precedence over "appKey" and "appKeyAWSSecret".
     */
    appKeyExistingSecret?: string;

    /**
     * The name of the secret in AWS Secrets Manager which stores the API key.
     * If set, this parameter takes precedence over "apiKey".
     */
    apiKeyAWSSecret?: string;

    /**
     * The name of the secret in AWS Secrets Manager which stores the App key.
     * If set, this parameter takes precedence over "appKey".
     */
    appKeyAWSSecret?: string;
}

export const defaultProps: HelmAddOnProps & DatadogAddOnProps = {
    chart: "datadog",
    name: "datadog-addon",
    namespace: "default",
    release: "datadog",
    repository: "https://helm.datadoghq.com",
    version: "3.59.6",
    values: {}
};

export class DatadogAddOn extends HelmAddOn {

    readonly options: DatadogAddOnProps;

    constructor(props: DatadogAddOnProps) {
        super({...defaultProps, ...props});
        this.options = this.props as DatadogAddOnProps;
    }

    async deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        let apiKeyValue: string | undefined
        let appKeyValue: string | undefined

        if (this.options.apiKeyAWSSecret) {
            apiKeyValue = await getSecretValue(this.options.apiKeyAWSSecret!, clusterInfo.cluster.stack.region);
        }

        if (this.options.appKeyAWSSecret) {
            appKeyValue = await getSecretValue(this.options.appKeyAWSSecret!, clusterInfo.cluster.stack.region);
        }

        let values = merge({
            datadog: {
                apiKey: apiKeyValue ? apiKeyValue : this.options.apiKey,
                appKey: appKeyValue ? appKeyValue : this.options.appKey,
                apiKeyExistingSecret: this.options.apiKeyExistingSecret,
                appKeyExistingSecret: this.options.appKeyExistingSecret
            }
        }, this.options.values ?? {})

        const chart = this.addHelmChart(clusterInfo, values);

        return Promise.resolve(chart);
    }
}
