import {EnvLevelEnum} from "../dict/EnvLevelEnum";

export interface EnvironmentHolder {
	getEnvItems():string[];

	getEnvItemDataObject(env:string):object;

	activeEnv(env:string):void;

	getEnvLevel():EnvLevelEnum;

	getActiveEnv():string;

	getActiveEnvData(): Object;
}
