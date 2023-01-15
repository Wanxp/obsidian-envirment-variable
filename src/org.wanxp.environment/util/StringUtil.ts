import placeholder from "object-placeholder";

export class StringUtil {
	public static replacePlaceHolder(text:string, data:Object, options?:object):string {
		return placeholder(text, data, options);
	}

	static isJson(textareaValue: string):boolean {
		let result:boolean = true;
		try {
			JSON.parse(textareaValue);
		}catch (e) {
			result = false;
		}
		return result;
	}
}
