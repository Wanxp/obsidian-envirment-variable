import {EnvLevelEnum} from "../dict/EnvLevelEnum";

export interface EnvironmentHolder {
	getEnvItems():string[];

	getEnvItemData(env:string):Map<string, string>;

	saveEnv(env:string);

	getEnvLevel():EnvLevelEnum;

	getActiveEnv():string;

}
