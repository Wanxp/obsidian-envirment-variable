import {EnvLevelEnum} from "../dict/EnvLevelEnum";

export interface EnvironmentHolder {
	getEnvItems():string[];

	getEnvItemDataObject(env:string):object;

	activeEnv(env:string):void;

	getEnvLevel():EnvLevelEnum;

	getActiveEnv():string;
	saveEnv(env:string, envData:object):void;

	saveAllEnv(envData:object):void;

	getActiveEnvData(): Object;
}
