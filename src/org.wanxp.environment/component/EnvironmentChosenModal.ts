import {App, FuzzySuggestModal} from "obsidian";
import {EnvironmentHolder} from "../module/EnvironmentHolder";
import EnvironmentVariablePlugin from "../main";

export class EnvironmentChosenModal extends FuzzySuggestModal<string> {

	private environments:string[];
	private envHolder:EnvironmentHolder;

	private plugin:EnvironmentVariablePlugin;
	constructor(app:App, plugin:EnvironmentVariablePlugin, envHolder:EnvironmentHolder) {
		super(app);
		this.plugin = plugin;
		this.envHolder = envHolder;
		this.initItems(envHolder);
		this.setPlaceholder('search env');
		this.buildInstructions();
	}

	private initItems(envHolder: EnvironmentHolder) {
		this.environments = envHolder.getEnvItems();
	}

	getItemText(item: string): string {
		return item;
	}

	getItems(): string[] {
		return this.environments;
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		this.plugin.activeEnv(item, this.envHolder.getEnvLevel());
	}

	buildInstructions(): void {
			let instructions;
			instructions = [
				{
					command: "↵",
					purpose: "switch",
				},
				{
					command: "ctrl ↵",
					purpose: "rename",
				},
				{
					command: "shift ⌫",
					purpose: "delete",
				},
				{
					command: "esc",
					purpose: "cancel",
				}
			];
			this.setInstructions(instructions);
	}

}
