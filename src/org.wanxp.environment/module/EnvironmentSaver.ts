export interface EnvironmentSaver {
	saveActiveEnv(env:string);

	saveEnvData(data:Map<string, string>);

	loadEnvData():Map<string, string>;

}
