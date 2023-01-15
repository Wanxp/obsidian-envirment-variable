export interface EnvironmentSaver {
	saveActiveEnv(env:string):void;

	saveEnvData(data:Map<string, string>):void;

	loadEnvData():Map<string, string>;

}
