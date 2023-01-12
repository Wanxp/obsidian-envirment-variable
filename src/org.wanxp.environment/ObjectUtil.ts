export class ObjectUtil {

	public static toMap(obj:Object):Map<string, any> {
		const map:Map<string, any> = new Map<string, any>();
		(Object.keys(obj) as (keyof typeof obj)[]).map((k) => {
			map.set(k, obj[k]);
		})
		return map;
	}




}
