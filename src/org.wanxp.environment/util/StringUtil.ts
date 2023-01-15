import placeholder from "object-placeholder";

export class StringUtil {
	public static replacePlaceHolder(text:string, data:Object):string {
		return placeholder(text, data);
	}
}
