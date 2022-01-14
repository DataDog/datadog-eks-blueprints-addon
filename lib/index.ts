import { ClusterInfo } from "@aws-quickstart/ssp-amazon-eks";
import { Construct } from "@aws-cdk/core";
import { HelmAddOn, HelmAddOnProps, HelmAddOnUserProps } from '@aws-quickstart/ssp-amazon-eks/dist/addons/helm-addon';
import merge from "ts-deepmerge";

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
     * If set, this parameter takes precedence over "apiKey".
     */
    apiKeyExistingSecret?: string;

    /**
     * Use existing Secret which stores APP key instead of creating a new one.
     * The value should be set with the `app-key` key inside the secret.
     * If set, this parameter takes precedence over "appKey".
     */
    appKeyExistingSecret?: string;
}

export const defaultProps: HelmAddOnProps & DatadogAddOnProps = {
    chart: "datadog",
    name: "datadog-addon",
    namespace: "default",
    release: "datadog",
    repository: "https://helm.datadoghq.com",
    version: "2.28.13",
    values: {}
};

export class DatadogAddOn extends HelmAddOn {

    readonly options: DatadogAddOnProps;

    constructor(props: DatadogAddOnProps) {
        super({...defaultProps, ...props});
        this.options = this.props as DatadogAddOnProps;
    }

    deploy(clusterInfo: ClusterInfo): Promise<Construct> {
        let values = merge({
            datadog: {
                apiKey: this.options.apiKey,
                appKey: this.options.appKey,
                apiKeyExistingSecret: this.options.apiKeyExistingSecret,
                appKeyExistingSecret: this.options.appKeyExistingSecret
            }
        }, this.options.values ?? {})

        const chart = this.addHelmChart(clusterInfo, values);

        return Promise.resolve(chart);
    }
}
